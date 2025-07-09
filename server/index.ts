import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getEvents, getEventById } from "./routes/events";
import { submitReport, getReportStatus } from "./routes/reports";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Namma Omni AI API v1.0" });
  });

  // Legacy demo route
  app.get("/api/demo", handleDemo);

  // Namma Omni AI API routes
  app.get("/api/events", getEvents);
  app.get("/api/events/:id", getEventById);
  app.post("/api/reports", submitReport);
  app.get("/api/reports/:id/status", getReportStatus);

  return app;
}
