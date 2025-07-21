package internal

import (
	"context"
	"log"
	"sync"

	"cloud.google.com/go/pubsub"
)

// PubSubRouter multiplexes a Pub/Sub subscription to multiple local listeners (channels).
// For every unique subscriptionID only one Receive loop is started, which ACKs every
// message and broadcasts the payload (as string) to all currently registered listeners.
//
// Listeners receive their own copy of the message data so they can process events
// independently. If a listener channel is full, the message is dropped for that listener
// to avoid blocking the entire Receive loop.
//
// The router is *not* intended to provide at-least-once semantics to the listeners –
// messages are ACKed once received from Pub/Sub. Listeners must tolerate occasional
// drops and use their own persistence if stronger guarantees are required.

// NOTE: A single router instance is shared across the process via getRouter().

//
// ──────────────────────────────────────────────────────────────────────────────
// Internal types
// ──────────────────────────────────────────────────────────────────────────────

type subscriptionFanout struct {
	mu        sync.RWMutex
	listeners map[chan string]struct{}
}

type router struct {
	client *pubsub.Client
	mu     sync.RWMutex                   // protects subs map
	subs   map[string]*subscriptionFanout // key: subscriptionID
}

var (
	defaultRouter *router
	once          sync.Once
)

// getRouter returns (and lazily initialises) a process-wide router instance.
// A single pubsub.Client is reused for efficiency.
func getRouter(ctx context.Context, projectID string) (*router, error) {
	var err error
	once.Do(func() {
		client, e := pubsub.NewClient(ctx, projectID)
		if e != nil {
			err = e
			return
		}
		defaultRouter = &router{
			client: client,
			subs:   make(map[string]*subscriptionFanout),
		}
	})
	return defaultRouter, err
}

// Subscribe returns a channel that will receive the *data* of every message from
// the given subscription. The returned cancel function should be called by the
// caller when it no longer wishes to receive events – it will deregister the
// channel and close it.
func Subscribe(ctx context.Context, projectID, subscriptionID string) (<-chan string, func(), error) {
	r, err := getRouter(ctx, projectID)
	if err != nil {
		return nil, nil, err
	}

	// obtain (or create) fan-out struct for this subscriptionID
	r.mu.Lock()
	fan, ok := r.subs[subscriptionID]
	if !ok {
		fan = &subscriptionFanout{listeners: make(map[chan string]struct{})}
		r.subs[subscriptionID] = fan
		// start a single Receive loop for this subscriptionID
		go r.receiveLoop(ctx, subscriptionID, fan)
	}
	r.mu.Unlock()

	// register new listener channel
	ch := make(chan string, 32) // small buffer to accommodate burst traffic
	fan.mu.Lock()
	fan.listeners[ch] = struct{}{}
	fan.mu.Unlock()

	cancel := func() {
		fan.mu.Lock()
		if _, ok := fan.listeners[ch]; ok {
			delete(fan.listeners, ch)
			close(ch)
		}
		fan.mu.Unlock()
	}
	return ch, cancel, nil
}

// receiveLoop runs Subscription.Receive and broadcasts payloads to listeners.
func (r *router) receiveLoop(ctx context.Context, subscriptionID string, fan *subscriptionFanout) {
	sub := r.client.Subscription(subscriptionID)

	// Receive blocks until ctx is done or an unrecoverable error occurs.
	err := sub.Receive(ctx, func(ctx context.Context, m *pubsub.Message) {
		data := string(m.Data)

		// broadcast to all listeners (non-blocking)
		fan.mu.RLock()
		for ch := range fan.listeners {
			select {
			case ch <- data:
				// delivered
			default:
				// listener is slow/full – drop the message for that listener
			}
		}
		fan.mu.RUnlock()

		m.Ack()
	})

	if err != nil && ctx.Err() == nil { // log only if not due to context cancellation
		log.Printf("pubsub receive loop for %s terminated: %v", subscriptionID, err)
	}
}
