package internal

import (
	"context"
	"fmt"
	"log"
	"os"
	"sync"
	"time"

	"cloud.google.com/go/pubsub"
	genai "google.golang.org/genai"
)

// Summarizer receives raw events from one or more Pub/Sub subscriptions, asks the
// Gemini model to create a textual summary for every event and forwards those
// summaries to the supplied sink (callback). The sink is typically the send
// side of a gRPC streaming method (e.g. stream.Send). It is invoked once per
// successfully-acknowledged message.
//
// A single Summarizer instance is intended to back ONE client stream; create a
// new instance for every call to SummaryService/StreamSummary.
//
// When ctx is cancelled the summariser stops receiving, waits for in-flight
// work to finish and then returns.
//
// Call NewSummarizer and then Run.

type Summarizer struct {
	projectID       string
	subscriptionIDs []string
	modelID         string
	sink            func(summary string) error
	prompt          string
	// internal state
	client      *pubsub.Client
	genaiClient *genai.Client
}

// NewSummarizer constructs a Summarizer. The callback is mandatory. The modelID
// may be empty, in which case "gemini-2.5-pro" is used.
func NewSummarizer(projectID string, subscriptionIDs []string, modelID string, prompt string, sink func(string) error) *Summarizer {
	if modelID == "" {
		modelID = "gemini-2.5-pro"
	}
	return &Summarizer{
		projectID:       projectID,
		subscriptionIDs: subscriptionIDs,
		modelID:         modelID,
		prompt:          prompt,
		sink:            sink,
	}
}

// Run blocks until ctx is done or an unrecoverable error occurs. Any error
// produced by the sink or by Gemini immediately stops the pipeline and is
// returned to the caller.
func (s *Summarizer) Run(ctx context.Context) error {
	// ---------- init Pub/Sub client ----------
	client, err := pubsub.NewClient(ctx, s.projectID)
	if err != nil {
		return fmt.Errorf("create pubsub client: %w", err)
	}
	defer client.Close()
	s.client = client

	// ---------- init Gemini ----------
	// We rely on the GOOGLE_API_KEY env var for authentication. Fail early if it
	// is not set so the caller gets a clear error instead of mysterious 403s.
	apiKey := os.Getenv("GOOGLE_API_KEY")
	if apiKey == "" {
		return fmt.Errorf("GOOGLE_API_KEY environment variable must be set for Gemini access")
	}

	genClient, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		return fmt.Errorf("create genai client: %w", err)
	}
	s.genaiClient = genClient

	// ---------- fan-in all subscriptions ----------
	msgCh := make(chan *pubsub.Message)
	var recvWG sync.WaitGroup

	// launch a receiver goroutine per subscription
	for _, subID := range s.subscriptionIDs {
		sub := client.Subscription(subID)
		recvWG.Add(1)
		go func(sb *pubsub.Subscription) {
			defer recvWG.Done()
			err := sb.Receive(ctx, func(ctx context.Context, m *pubsub.Message) {
				select {
				case msgCh <- m:
				case <-ctx.Done():
					m.Nack()
				}
			})
			if err != nil {
				log.Printf("subscription %s terminated: %v", sb.ID(), err)
			}
		}(sub)
	}

	// close msgCh once all Receive loops have returned
	go func() {
		recvWG.Wait()
		close(msgCh)
	}()

	// ---------- processing loop ----------
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case m, ok := <-msgCh:
			if !ok {
				return nil // normal shutdown, all subscriptions closed
			}

			// summarise and forward (blocking)
			if err := s.handleMessage(ctx, m); err != nil {
				// On sink or gemini error we stop processing. Nack so the message can be retried.
				m.Nack()
				return err
			}
			m.Ack()
		}
	}
}

func (s *Summarizer) handleMessage(ctx context.Context, m *pubsub.Message) error {
	raw := string(m.Data)

	prompt := s.prompt + "\n\n" + raw

	start := time.Now()

	resp, err := s.genaiClient.Models.GenerateContent(ctx, s.modelID, genai.Text(prompt), nil)
	if err != nil {
		return fmt.Errorf("gemini generate: %w", err)
	}
	latency := time.Since(start)

	summary := resp.Text()
	log.Printf("📝 generated summary (%.1f ms): %s", float64(latency.Milliseconds()), summary)

	if err := s.sink(summary); err != nil {
		return fmt.Errorf("sink error: %w", err)
	}
	return nil
}
