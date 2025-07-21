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

func (s *summaryServer) StreamSummary(ctx context.Context, req *connect.Request[summaryv1.StreamSummaryRequest], stream *connect.ServerStream[summaryv1.StreamSummaryResponse]) error {
	log.Printf("▶ StreamSummary lat=%f long=%f areas=%v", req.Msg.GetLat(), req.Msg.GetLong(), req.Msg.GetAreas())

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config load error: %v", err)
	}
	print(cfg)

	summarizer := internal.NewSummarizer(gcpProjectID, cfg.PubsubSubscriptionIds, cfg.Model, cfg.Prompt, func(text string) error {
		return stream.Send(&summaryv1.StreamSummaryResponse{Summary: text})
	})
	return summarizer.Run(ctx)
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
