import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Sun,
  Cloud,
  Car,
  AlertTriangle,
  Calendar,
  MapPin,
  Clock,
  Thermometer,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PulseData {
  greeting: string;
  weather: {
    condition: string;
    temperature: number;
    icon: string;
  };
  commute: {
    duration: number;
    delays: string[];
    route: string;
  };
  civicIssues: {
    count: number;
    highlighted: string;
  };
  events: {
    title: string;
    location: string;
    cta: string;
  }[];
  lastUpdated: string;
}

export function GeminiPulse() {
  const [pulseData, setPulseData] = useState<PulseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate AI analysis and data fetching
    const generatePulse = () => {
      const currentHour = new Date().getHours();
      let greeting = "Good Morning";
      if (currentHour >= 12 && currentHour < 17) greeting = "Good Afternoon";
      if (currentHour >= 17) greeting = "Good Evening";

      const userData = {
        name: "Vinayak", // In real app, this would come from user profile
        homeLocation: "Koramangala",
        workLocation: "Whitefield",
      };

      const mockPulse: PulseData = {
        greeting: `${greeting} ${userData.name}!`,
        weather: {
          condition: "Bright and sunny",
          temperature: 26,
          icon: "☀️",
        },
        commute: {
          duration: 45,
          delays: ["Metro construction in HSR Layout (+10 mins)"],
          route: `${userData.homeLocation} → ${userData.workLocation}`,
        },
        civicIssues: {
          count: 1,
          highlighted: "Metro construction ongoing in HSR Layout",
        },
        events: [
          {
            title: "Jazz Mataazz",
            location: "Sarjapur Forum Mall",
            cta: "Book Now",
          },
        ],
        lastUpdated: new Date().toLocaleTimeString(),
      };

      setPulseData(mockPulse);
      setIsLoading(false);
    };

    // Simulate loading delay
    setTimeout(generatePulse, 1500);
  }, []);

  if (isLoading) {
    return (
      <Card className="p-6 mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <Brain className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Namma Omni AI Pulse</h2>
            <p className="text-sm text-muted-foreground">
              Generating your daily summary...
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-muted/50 rounded animate-pulse" />
          <div className="h-4 bg-muted/50 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-muted/50 rounded animate-pulse w-1/2" />
        </div>
      </Card>
    );
  }

  if (!pulseData) return null;

  return (
    <Card className="p-6 mb-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Namma Omni AI Pulse</h2>
            <p className="text-xs text-muted-foreground">
              Last updated: {pulseData.lastUpdated}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="bg-primary/10 text-primary border-primary/20"
        >
          AI Generated
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Main Summary */}
        <div className="bg-card/50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <span className="text-2xl">{pulseData.weather.icon}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm leading-relaxed">
                Hey Vinayak,{" "}
                <span className="font-medium text-primary">
                  good afternoon!
                </span>{" "}
                🌞 Your day's shaping up to be a{" "}
                <span className="font-medium">bright and sunny</span> one —
                expect a pleasant{" "}
                <span className="font-medium">
                  {pulseData.weather.temperature}°C
                </span>{" "}
                on average. Your commute looks smooth with an ETA of around{" "}
                <span className="font-medium">
                  {pulseData.commute.duration} minutes
                </span>{" "}
                🚗, though there's a small hiccup —{" "}
                <span className="font-medium text-warning">
                  metro construction in HSR Layout
                </span>{" "}
                might add about{" "}
                <span className="font-medium text-warning">
                  10 extra minutes
                </span>
                . 🏗️
              </p>
              <p className="text-sm leading-relaxed mt-3 pt-3 border-t border-border/50">
                Oh, and just a heads-up! ⚡ There's a planned{" "}
                <span className="font-medium text-warning">
                  power cut from 10 AM to 4 PM
                </span>
                , so you might want to charge up your devices and plan ahead.
              </p>
              <p className="text-sm leading-relaxed mt-3 font-medium text-primary">
                Here's to a productive and awesome day ahead! 💪🎯
              </p>
            </div>
          </div>
        </div>

        {/* Commute Delays Alert */}
        {pulseData.commute.delays.length > 0 && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-warning">
                    Commute Delays Expected
                  </p>
                  <ul className="text-xs text-muted-foreground mt-1">
                    {pulseData.commute.delays.map((delay, index) => (
                      <li key={index}>• {delay}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <Button variant="outline" size="sm" className="ml-4">
                <MapPin className="w-4 h-4 mr-2" />
                View Alternate Routes
              </Button>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Weather */}
          <div className="bg-card/30 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <Thermometer className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Weather</p>
            <p className="text-sm font-medium">
              {pulseData.weather.temperature}°C
            </p>
          </div>

          {/* Commute */}
          <div className="bg-card/30 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <Car className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Commute</p>
            <p className="text-sm font-medium">{pulseData.commute.duration}m</p>
          </div>

          {/* Issues */}
          <div className="bg-card/30 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <AlertTriangle className="w-4 h-4 text-warning" />
            </div>
            <p className="text-xs text-muted-foreground">Issues</p>
            <p className="text-sm font-medium text-warning">
              {pulseData.civicIssues.count}
            </p>
          </div>

          {/* Events */}
          <div className="bg-card/30 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Events</p>
            <p className="text-sm font-medium">{pulseData.events.length}</p>
          </div>
        </div>

        {/* Events Card */}
        {pulseData.events.length > 0 && (
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-primary mb-1">
                    Featured Event
                  </h3>
                  <p className="text-sm mb-2">
                    <span className="font-medium">On other news:</span> Check
                    out{" "}
                    <span className="font-semibold text-primary">
                      {pulseData.events[0].title}
                    </span>{" "}
                    event at{" "}
                    <span className="font-medium">
                      {pulseData.events[0].location}
                    </span>
                    .
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 mt-3">
                    <Button variant="outline" size="sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      View Location
                    </Button>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {pulseData.events[0].cta}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
