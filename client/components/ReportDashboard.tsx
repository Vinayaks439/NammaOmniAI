import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Camera,
  Trophy,
  Star,
  Gift,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Award,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface UserReport {
  id: string;
  title: string;
  category: string;
  severity: string;
  status: "pending" | "investigating" | "resolved";
  timestamp: string;
  aiAssigned: boolean;
  location: string;
  imageUrl?: string;
}

interface UserStats {
  totalReports: number;
  creditScore: number;
  level: number;
  scratchCardsEarned: number;
  resolvedIssues: number;
}

const mockReports: UserReport[] = [
  {
    id: "1",
    title: "Large pothole on 12th Main Road",
    category: "civic",
    severity: "high",
    status: "investigating",
    timestamp: "2024-01-15T10:30:00Z",
    aiAssigned: true,
    location: "Koramangala 5th Block",
    imageUrl: "/placeholder.svg",
  },
  {
    id: "2",
    title: "Traffic signal malfunction",
    category: "traffic",
    severity: "critical",
    status: "resolved",
    timestamp: "2024-01-14T15:45:00Z",
    aiAssigned: true,
    location: "Indiranagar 100 Feet Road",
  },
  {
    id: "3",
    title: "Street light not working",
    category: "civic",
    severity: "medium",
    status: "pending",
    timestamp: "2024-01-13T20:15:00Z",
    aiAssigned: true,
    location: "HSR Layout Sector 2",
  },
];

const mockStats: UserStats = {
  totalReports: 12,
  creditScore: 65,
  level: 3,
  scratchCardsEarned: 3,
  resolvedIssues: 8,
};

const getCategoryColor = (category: string) => {
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

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "text-emergency";
    case "high":
      return "text-orange-500";
    case "medium":
      return "text-warning";
    case "low":
      return "text-success";
    default:
      return "text-muted-foreground";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "resolved":
      return <CheckCircle2 className="w-4 h-4 text-success" />;
    case "investigating":
      return <Clock className="w-4 h-4 text-warning" />;
    case "pending":
      return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
    default:
      return null;
  }
};

export function ReportDashboard() {
  const [reports, setReports] = useState<UserReport[]>(mockReports);
  const [stats, setStats] = useState<UserStats>(mockStats);
  const [showCelebration, setShowCelebration] = useState(false);

  const progressToNextLevel = (stats.creditScore % 20) * 5; // Every 20 points = new level
  const pointsToNextScratch = 20 - (stats.creditScore % 20);

  const handleMarkResolved = (reportId: string) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId ? { ...report, status: "resolved" } : report,
      ),
    );
    setStats((prev) => ({ ...prev, resolvedIssues: prev.resolvedIssues + 1 }));
  };

  const simulateNewReport = () => {
    const newStats = {
      ...stats,
      creditScore: stats.creditScore + 5,
      totalReports: stats.totalReports + 1,
    };

    // Check for level up or scratch card
    if (newStats.creditScore % 20 === 0) {
      newStats.scratchCardsEarned += 1;
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }

    setStats(newStats);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />

      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-8 text-center max-w-md mx-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            <Gift className="w-16 h-16 mx-auto mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold mb-2">Congratulations! 🎉</h2>
            <p className="mb-4">You've earned a scratch card!</p>
            <Button
              onClick={() => setShowCelebration(false)}
              className="bg-white text-orange-500 hover:bg-gray-100"
            >
              Awesome!
            </Button>
          </Card>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <div className="container max-w-6xl py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold mb-2">My Report Dashboard</h1>
              <p className="text-muted-foreground">
                Track your contributions to making the city better
              </p>
            </div>

            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 shadow-lg"
              onClick={simulateNewReport}
            >
              <Link to="/report/new">
                <Camera className="w-5 h-5 mr-2" />
                Report New Issue
              </Link>
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Stats & Gamification */}
            <div className="space-y-6">
              {/* User Level Card */}
              <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Community Hero</h3>
                      <p className="text-sm text-muted-foreground">
                        Level {stats.level}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-primary text-primary-foreground">
                    {stats.creditScore} pts
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress to next level</span>
                      <span>{progressToNextLevel}%</span>
                    </div>
                    <Progress value={progressToNextLevel} className="h-2" />
                  </div>

                  <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Gift className="w-4 h-4 text-warning" />
                      <span className="text-sm font-medium">
                        {pointsToNextScratch} points to next scratch card!
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 text-center">
                  <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{stats.totalReports}</p>
                  <p className="text-xs text-muted-foreground">Total Reports</p>
                </Card>

                <Card className="p-4 text-center">
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-success" />
                  <p className="text-2xl font-bold">{stats.resolvedIssues}</p>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                </Card>

                <Card className="p-4 text-center">
                  <Award className="w-6 h-6 mx-auto mb-2 text-warning" />
                  <p className="text-2xl font-bold">
                    {stats.scratchCardsEarned}
                  </p>
                  <p className="text-xs text-muted-foreground">Scratch Cards</p>
                </Card>

                <Card className="p-4 text-center">
                  <Star className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{stats.level}</p>
                  <p className="text-xs text-muted-foreground">Level</p>
                </Card>
              </div>

              {/* Rewards */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Available Rewards</h3>
                <div className="space-y-3">
                  {Array.from({ length: stats.scratchCardsEarned }, (_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border border-yellow-200"
                    >
                      <div className="flex items-center space-x-2">
                        <Gift className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium">
                          Scratch Card #{i + 1}
                        </span>
                      </div>
                      <Button size="sm" variant="outline">
                        Scratch Now
                      </Button>
                    </div>
                  ))}

                  {stats.scratchCardsEarned === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Complete more reports to earn rewards!
                    </p>
                  )}
                </div>
              </Card>
            </div>

            {/* Reports List */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Recent Reports</h3>

                <div className="space-y-4">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3">
                          {report.imageUrl && (
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <Camera className="w-full h-full p-3 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium text-sm mb-1">
                              {report.title}
                            </h4>
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge
                                className={cn(
                                  "text-xs",
                                  getCategoryColor(report.category),
                                )}
                              >
                                {report.category}
                              </Badge>
                              <span
                                className={cn(
                                  "text-xs font-medium",
                                  getSeverityColor(report.severity),
                                )}
                              >
                                {report.severity.toUpperCase()}
                              </span>
                              {report.aiAssigned && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-primary/10 text-primary"
                                >
                                  AI Assigned
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              📍 {report.location} •{" "}
                              {new Date(report.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {getStatusIcon(report.status)}
                          <span className="text-xs capitalize">
                            {report.status}
                          </span>
                        </div>
                      </div>

                      {report.status === "investigating" && (
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkResolved(report.id)}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Mark as Resolved
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {reports.length === 0 && (
                  <div className="text-center py-8">
                    <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="font-medium mb-2">No reports yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start contributing to your community by reporting issues
                    </p>
                    <Button asChild>
                      <Link to="/report/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Report Your First Issue
                      </Link>
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
