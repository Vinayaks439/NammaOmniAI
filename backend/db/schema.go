// schema.go
// This package defines the Go structs that map to the Firestore database schema
// for the Namma Omni AI / Urban Pulse Pothole Reporting System (v2.1).
// These structs are designed for direct use with the official Google Cloud Firestore client for Go.

package db

import (
	"time"
)

// PotholeReport represents the main document in the "pothole_reports" collection.
// It serves as the canonical record for a single, unique pothole issue.
type PotholeReport struct {
	// --- Core Metadata ---
	ReportID      string    `firestore:"-"`                 // The Firestore document ID, handled outside the struct fields.
	UserID        string    `firestore:"user_id,omitempty"` // ID of the user who submitted it. Null for proactive scans.
	CreatedAt     time.Time `firestore:"created_at"`        // Timestamp of the initial report creation.
	LastUpdatedAt time.Time `firestore:"last_updated_at"`   // Timestamp of the last status change.

	// --- Geospatial Information ---
	Location string  `firestore:"location"` // Native GeoPoint for efficient geospatial queries.
	Geohash  string  `firestore:"geohash"`  // Geohash for scalable location-based filtering.
	Address  Address `firestore:"address"`  // Nested struct for human-readable address.

	// --- Issue Classification ---
	IssueType    string `firestore:"issue_type"`     // e.g., "Civic Issue"
	SubIssueType string `firestore:"sub_issue_type"` // e.g., "Pothole"
	ReportType   string `firestore:"report_type"`    // "user_upload" or "proactive_scan"

	// --- Status & Workflow Management ---
	Status        string         `firestore:"status"`                   // "new", "investigating", "resolved", "duplicate"
	Severity      string         `firestore:"severity"`                 // "Critical", "High", "Medium", "Low". Hoisted from the latest analysis for easy querying.
	AssignedTo    string         `firestore:"assigned_to,omitempty"`    // ID of the authority or team it's assigned to.
	ResolvedAt    *time.Time     `firestore:"resolved_at,omitempty"`    // Timestamp when the status was changed to "resolved".
	DuplicateInfo *DuplicateInfo `firestore:"duplicate_info,omitempty"` // Info if this report is a duplicate.

	// --- Media Information ---
	Media Media `firestore:"media"`
}

// Address represents a nested map for human-readable location info.
type Address struct {
	Street      string `firestore:"street"`
	SubLocality string `firestore:"sub_locality"`
	City        string `firestore:"city"`
	PostalCode  string `firestore:"postal_code"`
	State       string `firestore:"state"`
	Country     string `firestore:"country"`
}

// Media represents a nested map for visual evidence paths.
type Media struct {
	ImageType          string `firestore:"image_type,omitempty"`
	UserImagePath      string `firestore:"user_image_path,omitempty"`
	PanoramicImagePath string `firestore:"panoramic_image_path,omitempty"`
	ThumbnailPath      string `firestore:"thumbnail_path,omitempty"`
}

// DuplicateInfo represents a nested map for tracking duplicate reports.
type DuplicateInfo struct {
	IsDuplicate    bool   `firestore:"is_duplicate"`
	MasterReportID string `firestore:"master_report_id"`
}

// Analysis represents a document in the "/pothole_reports/{reportId}/analyses" subcollection.
// It captures a single, complete analysis run by an AI agent.
type Analysis struct {
	AnalysisID     string    `firestore:"-"`
	ReportID       string    `firestore:"report_id"` // Back-reference to the parent PotholeReport.
	Timestamp      time.Time `firestore:"timestamp"` // When this specific analysis was performed.
	AIModelVersion string    `firestore:"ai_model_version"`
	PotholesFound  []Pothole `firestore:"potholes_found"` // Array of potholes found in this analysis.
}

// Pothole represents the detailed assessment of a single pothole found during an analysis.
type Pothole struct {
	Confidence         float64 `firestore:"confidence"`
	BoundingBox        Box     `firestore:"bounding_box"`
	AssessedFactors    Factors `firestore:"assessed_factors"`
	CalculatedSeverity string  `firestore:"calculated_severity"`
	Rationale          string  `firestore:"rationale"`
}

// Box represents the bounding box of a detected pothole.
type Box struct {
	XMin   int `firestore:"x_min"`
	YMin   int `firestore:"y_min"`
	Width  int `firestore:"width"`
	Height int `firestore:"height"`
}

// Factors represents the detailed forensic assessment of a pothole.
type Factors struct {
	DepthIn       float64 `firestore:"depth_in"`
	DiameterIn    float64 `firestore:"diameter_in"`
	EdgeSharpness string  `firestore:"edge_sharpness"`
	DebrisPresent bool    `firestore:"debris_present"`
}

// History represents a document in the "/pothole_reports/{reportId}/history" subcollection.
// It provides a full audit trail for a report.
type History struct {
	HistoryID    string    `firestore:"-"`
	Timestamp    time.Time `firestore:"timestamp"`
	Event        string    `firestore:"event"`         // e.g., "Status Changed", "Report Created"
	ChangedBy    string    `firestore:"changed_by"`    // UserID or "system"
	ChangeDetail string    `firestore:"change_detail"` // e.g., "Changed status from 'new' to 'investigating'"
}

// User represents a document in the "users" collection.
type User struct {
	UserID         string `firestore:"-"`
	DisplayName    string `firestore:"display_name"`
	Email          string `firestore:"email"`
	CommunityLevel string `firestore:"community_level"`
	CivicPoints    int    `firestore:"civic_points"`
	ReportsCount   int    `firestore:"reports_count"`
}
