import { RequestHandler } from "express";
import { Event, EventsResponse } from "@shared/types";

// Mock data storage - in production, this would connect to a database
const mockEvents: Event[] = [
  {
    id: "1",
    title: "Heavy Traffic on Outer Ring Road",
    description:
      "Slow moving traffic reported between Silk Board and Electronic City due to ongoing road construction work.",
    category: "traffic",
    severity: "high",
    source: "user_report",
    location: {
      lat: 12.9279,
      lng: 77.6271,
      address: "Outer Ring Road, Electronic City",
    },
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    verificationCount: 15,
    isVerified: true,
    status: "active",
    aiAnalysis: {
      confidence: 0.92,
      summary:
        "Major traffic congestion confirmed by multiple user reports and AI analysis of traffic patterns.",
      suggestedActions: [
        "Use alternate route via Hosur Road",
        "Allow extra 45 minutes for travel",
      ],
    },
  },
  {
    id: "2",
    title: "Water Logging at Majestic Circle",
    description:
      "Severe water logging reported near Majestic Bus Station. Roads are flooded and vehicles are stranded.",
    category: "civic",
    severity: "critical",
    source: "social_media",
    location: {
      lat: 12.9767,
      lng: 77.5733,
      address: "Majestic Circle, KR Market",
    },
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    verificationCount: 8,
    isVerified: true,
    status: "investigating",
    imageUrl: "/placeholder.svg",
  },
  // Add more mock events as needed
];

export const getEvents: RequestHandler = (req, res) => {
  try {
    const { page = 1, limit = 50, category, severity, status } = req.query;

    let filteredEvents = [...mockEvents];

    // Apply filters
    if (category && typeof category === "string") {
      filteredEvents = filteredEvents.filter(
        (event) => event.category === category,
      );
    }

    if (severity && typeof severity === "string") {
      filteredEvents = filteredEvents.filter(
        (event) => event.severity === severity,
      );
    }

    if (status && typeof status === "string") {
      filteredEvents = filteredEvents.filter(
        (event) => event.status === status,
      );
    }

    // Sort by timestamp (newest first) and then by severity
    filteredEvents.sort((a, b) => {
      const timeSort =
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      if (timeSort !== 0) return timeSort;

      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return (
        (severityOrder[b.severity as keyof typeof severityOrder] || 0) -
        (severityOrder[a.severity as keyof typeof severityOrder] || 0)
      );
    });

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

    const response: EventsResponse = {
      events: paginatedEvents,
      total: filteredEvents.length,
      page: pageNum,
      limit: limitNum,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getEventById: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const event = mockEvents.find((e) => e.id === id);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
