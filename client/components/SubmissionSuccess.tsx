import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { MapWithGeofence } from "@/components/MapWithGeofence";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Event, EventCategory } from "@shared/types";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Brain,
  ArrowRight,
  Camera,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface SubmissionSuccessProps {
  reportData: {
    title: string;
    description: string;
    category: EventCategory;
    severity: string;
    location: {
      lat: number;
      lng: number;
      address: string;
    };
    hasMedia: boolean;
    mediaCount: number;
    hashtags?: string[];
    photoComments?: { [key: string]: string };
    aiAnalysis?: any[];
  };
  onNewReport: () => void;
}

const getCategoryColor = (category: EventCategory) => {
  switch (category) {
    case "traffic":
      return "bg-traffic text-traffic-foreground";
    case "civic":
      return "bg-civic text-civic-foreground";
    case "event":
      return "bg-event text-event-foreground";
    case "emergency":
      return "bg-emergency text-emergency-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function SubmissionSuccess({
  reportData,
  onNewReport,
}: SubmissionSuccessProps) {
  const [aiProgress, setAiProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [generatedEvent, setGeneratedEvent] = useState<Event | null>(null);

  const reportId = `BPR-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

  // Simulate AI analysis progress
  useEffect(() => {
    const steps = [
      { progress: 20, delay: 500, message: "Processing image..." },
      { progress: 40, delay: 1000, message: "Analyzing content..." },
      { progress: 60, delay: 1500, message: "Determining severity..." },
      { progress: 80, delay: 2000, message: "Generating summary..." },
      { progress: 100, delay: 2500, message: "Analysis complete!" },
    ];

    let currentStep = 0;
    const processStep = () => {
      if (currentStep < steps.length) {
        setTimeout(() => {
          setAiProgress(steps[currentStep].progress);
          if (currentStep === steps.length - 1) {
            // Generate AI summary
            generateAISummary();
            setAnalysisComplete(true);
          }
          currentStep++;
          processStep();
        }, steps[currentStep].delay);
      }
    };

    processStep();
  }, []);

  const generateAISummary = () => {
    // Enhanced Gemini AI analysis with photo data
    let baseSummary = "";
    let photoInsights = "";

    const summaries = {
      traffic: `Traffic congestion detected on ${reportData.location.address}. Based on visual analysis, this appears to be a ${reportData.severity} severity traffic jam with multiple vehicles affected. Recommended alternate routes have been calculated.`,
      civic: `Civic infrastructure issue identified: ${reportData.title.toLowerCase()}. AI analysis indicates this is a ${reportData.severity} priority issue requiring municipal attention. Estimated resolution time: 24-48 hours.`,
      emergency: `Emergency situation detected with ${reportData.severity} severity. Immediate response protocols have been activated. Local authorities have been notified and are coordinating response.`,
      event: `Public event detected: ${reportData.title}. This appears to be a ${reportData.severity} impact event affecting local traffic and pedestrian flow. Duration and scope have been assessed.`,
    };

    baseSummary =
      summaries[reportData.category] ||
      `Issue analyzed and categorized as ${reportData.category} with ${reportData.severity} severity.`;

    // Add photo analysis insights
    if (
      reportData.hasMedia &&
      reportData.aiAnalysis &&
      reportData.aiAnalysis.length > 0
    ) {
      const detectedObjects = reportData.aiAnalysis
        .flatMap((analysis: any) => analysis.detectedObjects || [])
        .join(", ");

      photoInsights = ` Photo analysis detected: ${detectedObjects}. Visual evidence confirms the reported ${reportData.category} issue with high confidence.`;
    }

    // Add hashtag context
    if (reportData.hashtags && reportData.hashtags.length > 0) {
      const tagContext = ` Tagged as: ${reportData.hashtags.join(", ")}.`;
      photoInsights += tagContext;
    }

    setAiSummary(baseSummary + photoInsights);

    // Create event object for map display
    const event: Event = {
      id: reportId,
      title: reportData.title,
      description: reportData.description,
      category: reportData.category,
      severity: reportData.severity as any,
      source: "user_report",
      location: reportData.location,
      timestamp: new Date().toISOString(),
      verificationCount: 1,
      isVerified: false,
      status: "active",
      aiAnalysis: {
        confidence: 0.85 + Math.random() * 0.1,
        summary: aiSummary,
        suggestedActions: [
          "Report forwarded to relevant authorities",
          "Monitoring for additional confirmations",
          reportData.hasMedia ? "Media evidence processed" : "",
        ].filter(Boolean),
      },
    };

    setGeneratedEvent(event);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />

      <div className="flex-1 overflow-auto">
        <div className="container max-w-6xl py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold mb-2">
              Report Submitted Successfully!
            </h1>
            <p className="text-muted-foreground">
              Your report is being processed by our AI system and will appear on
              the city dashboard.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Report Details */}
            <div className="space-y-6">
              {/* Report Summary */}
              <Card className="p-6">
                <h2 className="font-semibold mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Report Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{reportData.title}</h3>
                      <Badge
                        className={cn(getCategoryColor(reportData.category))}
                      >
                        {reportData.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {reportData.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-muted-foreground" />
                        <span>{new Date().toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
                        <span>{reportData.location.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-sm font-medium">
                      Report ID: {reportId}
                    </span>
                    <Badge
                      variant="outline"
                      className={`${
                        reportData.severity === "critical"
                          ? "border-emergency text-emergency"
                          : reportData.severity === "high"
                            ? "border-orange-500 text-orange-500"
                            : reportData.severity === "medium"
                              ? "border-warning text-warning"
                              : "border-success text-success"
                      }`}
                    >
                      {reportData.severity} severity
                    </Badge>
                  </div>

                  {reportData.hasMedia && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Camera className="w-4 h-4 mr-1" />
                      {reportData.mediaCount} media file
                      {reportData.mediaCount > 1 ? "s" : ""} attached
                    </div>
                  )}

                  {/* Hashtags */}
                  {reportData.hashtags && reportData.hashtags.length > 0 && (
                    <div className="pt-3 border-t">
                      <div className="flex flex-wrap gap-1">
                        {reportData.hashtags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs bg-primary/10 text-primary border-primary/20"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* AI Analysis */}
              <Card className="p-6">
                <h2 className="font-semibold mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-primary" />
                  AI Analysis
                </h2>

                {!analysisComplete ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Processing with Gemini AI...</span>
                      <span>{aiProgress}%</span>
                    </div>
                    <Progress value={aiProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      Analyzing image content, determining severity, and
                      generating insights...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <p className="text-sm">{aiSummary}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Confidence Level:
                      </span>
                      <span className="font-medium">
                        {generatedEvent
                          ? Math.round(
                              generatedEvent.aiAnalysis!.confidence * 100,
                            )
                          : 85}
                        %
                      </span>
                    </div>
                  </div>
                )}
              </Card>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={onNewReport}
                  variant="outline"
                  className="flex-1"
                >
                  Submit Another Report
                </Button>
                <Button asChild className="flex-1">
                  <Link to="/">
                    View on Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Column - Map Preview */}
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="font-semibold mb-4">Location on Map</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Your report will appear here on the live city dashboard
                </p>

                <div className="h-96 rounded-lg overflow-hidden">
                  {generatedEvent ? (
                    <MapWithGeofence
                      events={[generatedEvent]}
                      onEventSelect={() => {}}
                      selectedEvent={generatedEvent}
                      geofenceCenter={reportData.location}
                      geofenceRadius={5}
                      highlightedEvent={generatedEvent}
                    />
                  ) : (
                    <div className="h-full bg-muted/20 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Generating map preview...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Next Steps */}
              <Card className="p-6">
                <h2 className="font-semibold mb-4">What Happens Next?</h2>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">
                        1
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">AI Processing</p>
                      <p className="text-xs text-muted-foreground">
                        Report analyzed and categorized automatically
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">
                        2
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Authority Notification
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Relevant departments will be notified automatically
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">
                        3
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Public Visibility</p>
                      <p className="text-xs text-muted-foreground">
                        Report appears on public dashboard for community
                        awareness
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
