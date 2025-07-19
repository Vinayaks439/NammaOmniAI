package main

import (
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
	gcpProjectID         = "namm-omni-dev"       // Replace with your GCP project ID.
	pubsubSubscriptionID = "events-subscription" // Replace with your Pub/Sub subscription ID.
)

// EventsServiceServer implements the Connect interface for our streaming events API.
type EventsServiceServer struct{}

// StreamEnergyManagementEvents connects to a Pub/Sub subscription and streams events to the client.
func (s *EventsServiceServer) StreamEnergyManagementEvents(
	ctx context.Context,
	req *connect.Request[energymanagementeventsv1.StreamEnergyManagementEventsRequest],
	stream *connect.ServerStream[energymanagementeventsv1.StreamEnergyManagementEventsResponse],
) error {
	log.Printf("StreamEnergyManagementEvents called with filter: %q", req.Msg.Filter)

	// Create a Pub/Sub client.
	client, err := pubsub.NewClient(ctx, gcpProjectID)
	if err != nil {
		log.Printf("Failed to create Pub/Sub client: %v", err)
		return err
	}
	defer client.Close()

	subscription := client.Subscription(pubsubSubscriptionID)

	// Create a channel to receive messages.
	msgCh := make(chan *pubsub.Message)

	// Pull messages from Pub/Sub in a separate goroutine.
	go func() {
		err := subscription.Receive(ctx, func(ctx context.Context, msg *pubsub.Message) {
			select {
			case msgCh <- msg:
			case <-ctx.Done():
				return
			}
		})
		if err != nil {
			log.Printf("Error receiving messages: %v", err)
		}
		close(msgCh)
	}()

	// Listen on the channel and stream messages to the client.
	for {
		select {
		case <-ctx.Done():
			log.Println("StreamEvents canceled by client")
			return ctx.Err()
		case msg, ok := <-msgCh:
			if !ok {
				log.Println("No more messages from Pub/Sub")
				return nil
			}

			// Acknowledge the message.
			msg.Ack()

			resp := &energymanagementeventsv1.StreamEnergyManagementEventsResponse{
				Id:        msg.ID,
				Timestamp: time.Now().Unix(),
				// For demonstration, using a fixed event type.
				// You may wish to derive this from msg.Attributes or msg.Data.
				// Type:    energymanagementeventsv1.EventType_EVENT_TYPE_TRAFFIC,
				Payload: string(msg.Data),
			}

			if err := stream.Send(resp); err != nil {
				log.Printf("Failed sending event: %v", err)
				return err
			}
		}
	}
}

func main() {
	// Optionally override configuration from environment variables.
	if proj := os.Getenv("GCP_PROJECT_ID"); proj != "" {
		log.Printf("Using GCP Project ID from env: %s", proj)
	}
	if sub := os.Getenv("PUBSUB_SUBSCRIPTION_ID"); sub != "" {
		log.Printf("Using Pub/Sub Subscription ID from env: %s", sub)
	}

	eventsServer := &EventsServiceServer{}
	mux := http.NewServeMux()
	path, handler := energymanagementeventsv1connect.NewEnergyManagementEventsServiceHandler(eventsServer)
	mux.Handle(path, handler)

	addr := "localhost:8080"
	log.Printf("Starting EventsService server on %s", addr)
	if err := http.ListenAndServe(
		addr,
		// Use h2c so we can serve HTTP/2 without TLS.
		h2c.NewHandler(mux, &http2.Server{}),
	); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
