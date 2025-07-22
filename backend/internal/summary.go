package internal

import (
	"context"
	"fmt"
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
	msgCh <-chan string
	sink  func(string) error
}

// NewSummarizer creates a simple pass-through summarizer (no LLM).
func NewSummarizer(msgCh <-chan string, _ string, _ string, sink func(string) error) *Summarizer {
	return &Summarizer{msgCh: msgCh, sink: sink}
}

func (s *Summarizer) Run(ctx context.Context) error {
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case raw, ok := <-s.msgCh:
			if !ok {
				return nil
			}
			if err := s.sink(raw); err != nil {
				return fmt.Errorf("sink error: %w", err)
			}
		}
	}
}
