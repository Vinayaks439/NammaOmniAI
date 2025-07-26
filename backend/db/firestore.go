package db

import (
	"context"
	"time"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
)

// Client wraps the Firestore SDK client so that the rest of the codebase
// never touches the SDK directly.
type Client struct {
	fs *firestore.Client
}

// New creates a new Firestore client. The caller is responsible for calling
// Close() when the process shuts down.
func New(ctx context.Context, projectID string) (*Client, error) {
	fs, err := firestore.NewClientWithDatabase(ctx, projectID, "namma-omni-dev")
	if err != nil {
		return nil, err
	}
	return &Client{fs: fs}, nil
}

func (c *Client) Close() error { return c.fs.Close() }

// CreateAlert persists a new report and returns its document ID.
func (c *Client) CreateAlert(ctx context.Context, r *Alerts) (string, error) {
	now := time.Now()
	r.AlertTimestamp = now.Format(time.RFC3339)
	ref, _, err := c.fs.Collection("alerts").Add(ctx, r)
	if err != nil {
		return "", err
	}
	return ref.ID, nil
}

// GetAlert loads a single report by ID.
func (c *Client) GetAlert(ctx context.Context, id string) (*Alerts, error) {
	// fetch the single document whose document-ID is `id`
	docSnap, err := c.fs.Collection("alerts").Where("id", "==", id).Documents(ctx).Next()
	if err != nil {
		return nil, err
	}

	var rpt Alerts
	if err := docSnap.DataTo(&rpt); err != nil {
		return nil, err
	}

	// keep the Firestore document-ID around if you need it later
	rpt.AlertID = docSnap.Ref.ID
	return &rpt, nil
}

// ListAlerts returns the newest N reports for a user (or everyone if
// userID is empty).
func (c *Client) ListAlerts(ctx context.Context, limit int, userID string) ([]*Alerts, error) {
	q := c.fs.Collection("alerts").OrderBy("timestamp", firestore.Desc).Limit(limit)
	iter := q.Documents(ctx)
	defer iter.Stop()

	var out []*Alerts
	for {
		doc, err := iter.Next()
		if err != nil {
			if err == iterator.Done {
				break
			}
			return nil, err
		}
		var rpt Alerts
		if err := doc.DataTo(&rpt); err != nil {
			return nil, err
		}
		rpt.AlertID = doc.Ref.ID
		out = append(out, &rpt)
	}
	return out, nil
}

// UpdateStatus marks a report resolved / changed etc.
func (c *Client) UpdateStatus(ctx context.Context, id string, newStatus string) error {
	updates := []firestore.Update{
		{Path: "status", Value: newStatus},
		{Path: "last_updated_at", Value: time.Now()},
	}
	if newStatus == "resolved" {
		updates = append(updates, firestore.Update{Path: "resolved_at", Value: time.Now()})
	}
	_, err := c.fs.Collection("alerts").Doc(id).Update(ctx, updates)
	return err
}
