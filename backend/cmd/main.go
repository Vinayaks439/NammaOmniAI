package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"connectrpc.com/connect"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"

	summaryv1 "backend/gen/summary/v1"
	summaryv1connect "backend/gen/summary/v1/summaryv1connect"

	"backend/config"
	"backend/internal"

	"golang.org/x/sync/errgroup"
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

	cfg, err := config.Load()
	if err != nil {
		return err
	}

	log.Printf("StreamSummary request: %v, %v, %v", req.Msg.Areas, req.Msg.Lat, req.Msg.Long)

	// Channel fan-in
	outCh := make(chan *summaryv1.StreamSummaryResponse)

	g, ctx := errgroup.WithContext(ctx)

	// ---- ENERGY summarizer ----
	g.Go(func() error {
		summ := internal.NewSummarizer(
			gcpProjectID,
			"energy-management-data-sub",
			cfg.Model,
			cfg.Prompt,
			func(text string) error {
				select {
				case outCh <- &summaryv1.StreamSummaryResponse{
					EnergyManagmentSummary: text,
				}:
					return nil
				case <-ctx.Done():
					return ctx.Err()
				}
			},
		)
		return summ.Run(ctx)
	})

	// ---- TRAFFIC summarizer ----
	g.Go(func() error {
		summ := internal.NewSummarizer(
			gcpProjectID,
			"traffic-update-data-sub",
			cfg.Model,
			cfg.Prompt,
			func(text string) error {
				select {
				case outCh <- &summaryv1.StreamSummaryResponse{
					TrafficUpdateSummary: text,
				}:
					return nil
				case <-ctx.Done():
					return ctx.Err()
				}
			},
		)
		return summ.Run(ctx)
	})

	// ---- Forwarder (single writer to stream) ----
	g.Go(func() error {
		defer close(outCh)
		for {
			select {
			case resp := <-outCh:
				if resp == nil {
					return nil
				}
				if err := stream.Send(resp); err != nil {
					return err
				}
			case <-ctx.Done():
				return ctx.Err()
			}
		}
	})

	// Wait for any goroutine to error or for ctx cancel.
	return g.Wait()
}

func main() {
	if env := os.Getenv("GCP_PROJECT_ID"); env != "" {
		log.Printf("Using GCP_PROJECT_ID=%s", env)
	}
	if env := os.Getenv("PUBSUB_SUBSCRIPTION_ID"); env != "" {
		log.Printf("Using PUBSUB_SUBSCRIPTION_ID=%s", env)
	}

	mux := http.NewServeMux()

	// Summary service handler
	sumSrv := &summaryServer{}
	sumPath, sumHandler := summaryv1connect.NewSummaryServiceHandler(sumSrv)
	mux.Handle(sumPath, sumHandler)

	// single h2c wrap → then CORS
	h2cHandler := h2c.NewHandler(mux, &http2.Server{})
	corsHandler := withCORS(h2cHandler)

	log.Printf("Serving SummaryService at %s", sumPath)
	log.Printf("Listening on localhost:8080")
	if err := http.ListenAndServe("localhost:8080", corsHandler); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
