import { useState } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Bell,
  Settings,
  MapPin,
  Clock,
  AlertTriangle,
  Plus,
  Trash2,
} from "lucide-react";

interface Alert {
  id: string;
  type: "critical" | "high" | "medium";
  title: string;
  message: string;
  timestamp: string;
  location: string;
  category: string;
}

interface Subscription {
  id: string;
  name: string;
  location: string;
  radius: number;
  categories: string[];
  severities: string[];
  schedule: string;
  isActive: boolean;
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "critical",
    title: "Emergency: Fire at Commercial Street",
    message:
      "Fire reported at commercial building. Emergency services on site.",
    timestamp: "2024-01-15T14:30:00Z",
    location: "Commercial Street, Shivaji Nagar",
    category: "emergency",
  },
  {
    id: "2",
    type: "high",
    title: "Traffic Congestion on Outer Ring Road",
    message: "Heavy traffic due to metro construction. Expect 30min delays.",
    timestamp: "2024-01-15T13:45:00Z",
    location: "Outer Ring Road, Electronic City",
    category: "traffic",
  },
  {
    id: "3",
    type: "medium",
    title: "Power Cut Scheduled",
    message: "Planned maintenance from 10 AM to 4 PM.",
    timestamp: "2024-01-15T09:00:00Z",
    location: "Indiranagar Area",
    category: "civic",
  },
];

const mockSubscriptions: Subscription[] = [
  {
    id: "1",
    name: "Work Commute Alerts",
    location: "Koramangala to Whitefield",
    radius: 5,
    categories: ["traffic", "civic"],
    severities: ["critical", "high"],
    schedule: "7 AM - 10 PM",
    isActive: true,
  },
  {
    id: "2",
    name: "Emergency Alerts - Citywide",
    location: "All areas",
    radius: 50,
    categories: ["emergency"],
    severities: ["critical"],
    schedule: "24/7",
    isActive: true,
  },
];

export default function Alerts() {
  const [alerts] = useState<Alert[]>(mockAlerts);
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(mockSubscriptions);
  const [showConfig, setShowConfig] = useState(false);

  const toggleSubscription = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.id === id ? { ...sub, isActive: !sub.isActive } : sub,
      ),
    );
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case "critical":
        return "bg-emergency text-emergency-foreground";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />

      <div className="flex-1 overflow-auto">
        <div className="container max-w-7xl py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold mb-2">Alert Center</h1>
              <p className="text-muted-foreground">
                Stay informed about incidents and events in your area
              </p>
            </div>
            <Button
              onClick={() => setShowConfig(!showConfig)}
              variant={showConfig ? "default" : "outline"}
            >
              <Settings className="w-4 h-4 mr-2" />
              {showConfig ? "Hide Config" : "Configure Alerts"}
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Active Alerts */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Active Alerts</h2>
                  <Badge variant="secondary">{alerts.length} active</Badge>
                </div>

                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge className={getAlertTypeColor(alert.type)}>
                                {alert.type.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {alert.category}
                              </Badge>
                            </div>
                            <h3 className="font-medium mb-2">{alert.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {alert.message}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(alert.timestamp).toLocaleString()}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {alert.location}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {alerts.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No active alerts</p>
                      <p className="text-sm">You're all caught up!</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Configuration Panel */}
            <div className="space-y-6">
              {showConfig && (
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Alert Configuration</h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Severity Levels
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="critical" defaultChecked />
                          <label htmlFor="critical" className="text-sm">
                            Critical only
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="high" defaultChecked />
                          <label htmlFor="high" className="text-sm">
                            High & Critical
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="all" />
                          <label htmlFor="all" className="text-sm">
                            All alerts
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Categories</h4>
                      <div className="space-y-2">
                        {["Traffic", "Civic", "Emergency", "Events"].map(
                          (category) => (
                            <div
                              key={category}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={category.toLowerCase()}
                                defaultChecked={category !== "Events"}
                              />
                              <label
                                htmlFor={category.toLowerCase()}
                                className="text-sm"
                              >
                                {category}
                              </label>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    <Button className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Subscription
                    </Button>
                  </div>
                </Card>
              )}

              {/* Active Subscriptions */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Active Subscriptions</h3>
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div
                      key={subscription.id}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">
                          {subscription.name}
                        </h4>
                        <Switch
                          checked={subscription.isActive}
                          onCheckedChange={() =>
                            toggleSubscription(subscription.id)
                          }
                        />
                      </div>

                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {subscription.location} ({subscription.radius}km)
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {subscription.schedule}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {subscription.categories.map((cat) => (
                          <Badge
                            key={cat}
                            variant="outline"
                            className="text-xs"
                          >
                            {cat}
                          </Badge>
                        ))}
                        {subscription.severities.map((sev) => (
                          <Badge
                            key={sev}
                            variant="secondary"
                            className="text-xs"
                          >
                            {sev}
                          </Badge>
                        ))}
                      </div>

                      {showConfig && (
                        <div className="flex space-x-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
