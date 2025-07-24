package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"connectrpc.com/connect"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"

	summaryv1 "backend/gen/summary/v1"
	summaryv1connect "backend/gen/summary/v1/summaryv1connect"

	// ---- generated packages for the two new RPCs ----
	energymanagementeventsv1 "backend/gen/energymanagementevents/v1"
	energymanagementeventsv1connect "backend/gen/energymanagementevents/v1/energymanagementeventsv1connect"
	trafficupdatereventsv1 "backend/gen/trafficupdaterevents/v1"
	trafficupdatereventsv1connect "backend/gen/trafficupdaterevents/v1/trafficupdatereventsv1connect"

	"backend/config"
	"backend/internal"

	"golang.org/x/sync/errgroup"
	genai "google.golang.org/genai"
)

const (
	gcpProjectID = "namm-omni-dev"
)

func withCORS(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers",
			"Content-Type, Accept, X-Grpc-Web, X-User-Agent, Grpc-Timeout")
		w.Header().Set("Access-Control-Expose-Headers",
			"Grpc-Status, Grpc-Message, Grpc-Status-Details-Bin")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		h.ServeHTTP(w, r)
	})
}

// SummaryService implementation
type summaryServer struct{}

func (s *summaryServer) StreamSummary(
	ctx context.Context,
	req *connect.Request[summaryv1.StreamSummaryRequest],
	stream *connect.ServerStream[summaryv1.StreamSummaryResponse],
) error {

	// Load config & prompt
	cfg, err := config.Load()
	if err != nil {
		return err
	}

	// Attempt to load richer system prompt from prompt.yaml (optional)
	promptBytes, errPrompt := ioutil.ReadFile("backend/prompt.yaml")
	var systemPrompt string
	if errPrompt == nil {
		var m map[string]interface{}
		if err := json.Unmarshal(promptBytes, &m); err == nil {
			if p, ok := m["prompt"].(string); ok {
				systemPrompt = p
			}
		}
	}
	if systemPrompt == "" {
		systemPrompt = cfg.Prompt
	}

	// init Gemini client once
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return fmt.Errorf("GEMINI_API_KEY env var not set")
	}
	genClient, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		return err
	}

	log.Printf("StreamSummary request: %v, %v, %v", req.Msg.Areas, req.Msg.Lat, req.Msg.Long)

	// Publish trigger messages to all agent topics to initiate their processing
	triggerData, err := json.Marshal(map[string]interface{}{
		"areas": req.Msg.Areas,
		"lat":   req.Msg.Lat,
		"long":  req.Msg.Long,
	})
	if err != nil {
		return fmt.Errorf("failed to marshal trigger data: %v", err)
	}

	// Trigger topics for each agent
	triggerTopics := []string{
		"trigger-traffic-update-agent",
		"trigger-energy-management-agent",
	}

	for _, topicID := range triggerTopics {
		if err := internal.Publish(ctx, gcpProjectID, topicID, triggerData); err != nil {
			log.Printf("Failed to publish to %s: %v", topicID, err)
			// Continue with other topics even if one fails
		} else {
			log.Printf("Published trigger message to %s", topicID)
		}
	}

	var mu sync.Mutex
	var latestEnergy string
	var latestTraffic string

	maybeGenerate := func() error {
		mu.Lock()
		defer mu.Unlock()
		if latestEnergy == "" || latestTraffic == "" {
			return nil // need both
		}

		prompt := systemPrompt + "\n\n" + latestEnergy + "\n" + latestTraffic
		resp, err := genClient.Models.GenerateContent(ctx, cfg.Model, genai.Text(prompt), nil)
		if err != nil {
			return err
		}
		summaryText := resp.Text()

		return stream.Send(&summaryv1.StreamSummaryResponse{Summary: summaryText})
	}

	g, ctx := errgroup.WithContext(ctx)

	// ---- ENERGY summarizer ----
	energyCh, cancelEnergy, err := internal.Subscribe(context.Background(), gcpProjectID, "energy-management-data-sub")
	if err != nil {
		return err
	}
	g.Go(func() error {
		defer cancelEnergy()
		summ := internal.NewSummarizer(
			energyCh,
			"", // model not used
			"", // prompt not used
			func(text string) error {
				log.Printf("ENERGY raw: %d bytes", len(text))
				mu.Lock()
				latestEnergy = text
				mu.Unlock()
				return maybeGenerate()
			},
		)
		return summ.Run(ctx)
	})

	// ---- TRAFFIC summarizer ----
	trafficCh, cancelTraffic, err := internal.Subscribe(context.Background(), gcpProjectID, "traffic-update-data-sub")
	if err != nil {
		return err
	}
	g.Go(func() error {
		defer cancelTraffic()
		summ := internal.NewSummarizer(
			trafficCh,
			"",
			"",
			func(text string) error {
				log.Printf("TRAFFIC raw: %d bytes", len(text))
				mu.Lock()
				latestTraffic = text
				mu.Unlock()
				return maybeGenerate()
			},
		)
		return summ.Run(ctx)
	})

	// Wait for any goroutine to error or for ctx cancel.
	return g.Wait()
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Energy-Management live-feed server
// ─────────────────────────────────────────────────────────────────────────────
type energyManagementEventsServer struct{}

func (s *energyManagementEventsServer) StreamEnergyManagementEvents(
	ctx context.Context,
	req *connect.Request[energymanagementeventsv1.StreamEnergyManagementEventsRequest],
	stream *connect.ServerStream[energymanagementeventsv1.StreamEnergyManagementEventsResponse],
) error {
	ch, cancel, err := internal.Subscribe(context.Background(), gcpProjectID, "energy-management-data-sub")
	if err != nil {
		return err
	}
	defer cancel()

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case raw, ok := <-ch:
			if !ok {
				return nil
			}
			if f := strings.TrimSpace(req.Msg.Filter); f != "" &&
				!strings.Contains(strings.ToLower(raw), strings.ToLower(f)) {
				continue
			}
			if err := stream.Send(&energymanagementeventsv1.StreamEnergyManagementEventsResponse{
				Id:        fmt.Sprintf("%d", time.Now().UnixNano()),
				Timestamp: time.Now().Unix(),
				Payload:   raw,
			}); err != nil {
				return err
			}
		}
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Traffic-Update live-feed server
// ─────────────────────────────────────────────────────────────────────────────
type trafficUpdateEventsServer struct{}

func (s *trafficUpdateEventsServer) StreamTrafficUpdateEvents(
	ctx context.Context,
	req *connect.Request[trafficupdatereventsv1.StreamTrafficUpdateEventsRequest],
	stream *connect.ServerStream[trafficupdatereventsv1.StreamTrafficUpdateEventsResponse],
) error {
	ch, cancel, err := internal.Subscribe(context.Background(), gcpProjectID, "traffic-update-data-sub")
	if err != nil {
		return err
	}
	defer cancel()

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case raw, ok := <-ch:
			if !ok {
				return nil
			}
			if f := strings.TrimSpace(req.Msg.Filter); f != "" &&
				!strings.Contains(strings.ToLower(raw), strings.ToLower(f)) {
				continue
			}
			if err := stream.Send(&trafficupdatereventsv1.StreamTrafficUpdateEventsResponse{
				Id:        fmt.Sprintf("%d", time.Now().UnixNano()),
				Timestamp: time.Now().Unix(),
				Payload:   raw,
			}); err != nil {
				return err
			}
		}
	}
}

func main() {
	if env := os.Getenv("GCP_PROJECT_ID"); env != "" {
		log.Printf("Using GCP_PROJECT_ID=%s", env)
	}
	if env := os.Getenv("PUBSUB_SUBSCRIPTION_ID"); env != "" {
		log.Printf("Using PUBSUB_SUBSCRIPTION_ID=%s", env)
	}

	mux := http.NewServeMux()

	// Summary service
	sumSrv := &summaryServer{}
	sumPath, sumHandler := summaryv1connect.NewSummaryServiceHandler(sumSrv)
	mux.Handle(sumPath, sumHandler)

	// Energy-Management live-feed service
	energySrv := &energyManagementEventsServer{}
	energyPath, energyHandler := energymanagementeventsv1connect.NewEnergyManagementEventsServiceHandler(energySrv)
	mux.Handle(energyPath, energyHandler)

	// Traffic-Update live-feed service
	trafficSrv := &trafficUpdateEventsServer{}
	trafficPath, trafficHandler := trafficupdatereventsv1connect.NewTrafficUpdateEventsServiceHandler(trafficSrv)
	mux.Handle(trafficPath, trafficHandler)

	// single h2c wrap → then CORS
	h2cHandler := h2c.NewHandler(mux, &http2.Server{})
	corsHandler := withCORS(h2cHandler)

	log.Printf("Serving SummaryService at %s", sumPath)
	log.Printf("Serving EnergyManagementEventsService at %s", energyPath)
	log.Printf("Serving TrafficUpdateEventsService at %s", trafficPath)
	log.Printf("Listening on localhost:8080")
	if err := http.ListenAndServe("localhost:8080", corsHandler); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
