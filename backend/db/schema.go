// schema.go
// This package defines the Go structs that map to the Firestore database schema
// for the Namma Omni AI / Urban Pulse Pothole Reporting System (v2.1).
// These structs are designed for direct use with the official Google Cloud Firestore client for Go.

package db

type Alerts struct {
	AlertID          string  `firestore:"id"          json:"id"`
	AlertTimestamp   string  `firestore:"timestamp"   json:"timestamp"`
	AlertTitle       string  `firestore:"title"       json:"title"`
	AlertDescription string  `firestore:"description" json:"description"`
	AlertSeverity    string  `firestore:"severity"    json:"severity"`
	AlertCategory    string  `firestore:"category"    json:"category"`
	AlertLocation    string  `firestore:"location"    json:"location"`
	AlertLat         float64 `firestore:"lat"         json:"lat"`
	AlertLong        float64 `firestore:"long"        json:"long"`
	AlertSentiment   string  `firestore:"sentiment"   json:"sentiment"`
}
