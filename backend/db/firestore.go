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
	fs, err := firestore.NewClient(ctx, projectID)
	if err != nil {
		return nil, err
	}
	return &Client{fs: fs}, nil
}

func (c *Client) Close() error { return c.fs.Close() }

// CreatePotholeReport persists a new report and returns its document ID.
func (c *Client) CreatePotholeReport(ctx context.Context, r *PotholeReport) (string, error) {
	now := time.Now()
	r.CreatedAt = now
	r.LastUpdatedAt = now
	ref, _, err := c.fs.Collection("pothole_reports").Add(ctx, r)
	if err != nil {
		return "", err
	}
	return ref.ID, nil
}

// GetPotholeReport loads a single report by ID.
func (c *Client) GetPotholeReport(ctx context.Context, id string) (*PotholeReport, error) {
	doc, err := c.fs.Collection("pothole_reports").Doc(id).Get(ctx)
	if err != nil {
		return nil, err
	}
	var rpt PotholeReport
	if err := doc.DataTo(&rpt); err != nil {
		return nil, err
	}
	rpt.ReportID = doc.Ref.ID
	return &rpt, nil
}

// ListPotholeReports returns the newest N reports for a user (or everyone if
// userID is empty).
func (c *Client) ListPotholeReports(ctx context.Context, limit int, userID string) ([]*PotholeReport, error) {
	q := c.fs.Collection("pothole_reports").OrderBy("created_at", firestore.Desc).Limit(limit)
	if userID != "" {
		q = q.Where("user_id", "==", userID)
	}
	iter := q.Documents(ctx)
	defer iter.Stop()

	var out []*PotholeReport
	for {
		doc, err := iter.Next()
		if err != nil {
			if err == iterator.Done {
				break
			}
			return nil, err
		}
		var rpt PotholeReport
		if err := doc.DataTo(&rpt); err != nil {
			return nil, err
		}
		rpt.ReportID = doc.Ref.ID
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
	_, err := c.fs.Collection("pothole_reports").Doc(id).Update(ctx, updates)
	return err
}
