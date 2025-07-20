package main

import (
	// … your imports …
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"cloud.google.com/go/pubsub"
	"connectrpc.com/connect"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"

	energymanagementeventsv1 "backend/gen/energymanagementevents/v1"
	energymanagementeventsv1connect "backend/gen/energymanagementevents/v1/energymanagementeventsv1connect"
)

const (
	gcpProjectID         = "namm-omni-dev"
	pubsubSubscriptionID = "energy-management-data-sub"
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

type EventsServiceServer struct{}

func (s *EventsServiceServer) StreamEnergyManagementEvents(
	ctx context.Context,
	req *connect.Request[energymanagementeventsv1.StreamEnergyManagementEventsRequest],
	stream *connect.ServerStream[energymanagementeventsv1.StreamEnergyManagementEventsResponse],
) error {
	log.Printf("▶ StreamEnergyManagementEvents called with filter: %q", req.Msg.Filter)
	client, err := pubsub.NewClient(ctx, gcpProjectID)
	if err != nil {
		return err
	}
	defer client.Close()

	subscription := client.Subscription(pubsubSubscriptionID)
	msgCh := make(chan *pubsub.Message)
	go func() {
		log.Println("🔄 subscription.Receive starting…")
		err := subscription.Receive(ctx, func(_ context.Context, msg *pubsub.Message) {
			log.Printf("🔔 Received Pub/Sub msg ID=%s Data=%q", msg.ID, string(msg.Data))
			msgCh <- msg
		})
		if err != nil {
			log.Printf("🔴 subscription.Receive error: %v", err)
		}
		close(msgCh)
	}()

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case msg, ok := <-msgCh:
			if !ok {
				return nil
			}
			msg.Ack()
			resp := &energymanagementeventsv1.StreamEnergyManagementEventsResponse{
				Id:        msg.ID,
				Timestamp: time.Now().Unix(),
				Payload:   string(msg.Data),
			}
			if err := stream.Send(resp); err != nil {
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

	server := &EventsServiceServer{}
	mux := http.NewServeMux()
	path, handler := energymanagementeventsv1connect.
		NewEnergyManagementEventsServiceHandler(server)
	mux.Handle(path, handler)

	// single h2c wrap → then CORS
	h2cHandler := h2c.NewHandler(mux, &http2.Server{})
	corsHandler := withCORS(h2cHandler)

	log.Printf("Serving RPC at %s", path)
	log.Printf("Listening on localhost:8080")
	if err := http.ListenAndServe("localhost:8080", corsHandler); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
