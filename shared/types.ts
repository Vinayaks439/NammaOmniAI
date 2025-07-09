export type EventCategory = "traffic" | "civic" | "event" | "emergency";

export type EventSeverity = "low" | "medium" | "high" | "critical";

export type EventSource =
  | "user_report"
  | "social_media"
  | "official"
  | "ai_detected";

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  severity: EventSeverity;
  source: EventSource;
  location: Location;
  timestamp: string;
  imageUrl?: string;
  videoUrl?: string;
  verificationCount: number;
  isVerified: boolean;
  reporterId?: string;
  status: "active" | "resolved" | "investigating";
  aiAnalysis?: {
    confidence: number;
    summary: string;
    suggestedActions?: string[];
  };
}

export interface UserReport {
  id?: string;
  title: string;
  description: string;
  category: EventCategory;
  location: Location;
  imageFile?: File;
  videoFile?: File;
  timestamp: string;
  reporterName?: string;
  reporterContact?: string;
}

export interface EventFilter {
  categories: EventCategory[];
  severities: EventSeverity[];
  sources: EventSource[];
  timeRange: {
    start: string;
    end: string;
  };
  location?: {
    center: Location;
    radius: number; // in kilometers
  };
}

// API Response types
export interface EventsResponse {
  events: Event[];
  total: number;
  page: number;
  limit: number;
}

export interface ReportResponse {
  success: boolean;
  reportId: string;
  message: string;
  event?: Event;
}

export interface AlertSubscription {
  id: string;
  userId: string;
  categories: EventCategory[];
  locations: Location[];
  radius: number;
  isActive: boolean;
}
