import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, Search, Settings, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Header() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <div className="h-4 w-4 rounded-full bg-primary-foreground animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none">
                Namma Omni AI
              </span>
              <span className="text-xs text-muted-foreground">
                Smart City Dashboard
              </span>
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              location.pathname === "/"
                ? "text-foreground"
                : "text-muted-foreground",
            )}
          >
            Dashboard
          </Link>
          <Link
            to="/report"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              location.pathname === "/report"
                ? "text-foreground"
                : "text-muted-foreground",
            )}
          >
            Report Issue
          </Link>
          <Link
            to="/alerts"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              location.pathname === "/alerts"
                ? "text-foreground"
                : "text-muted-foreground",
            )}
          >
            Alerts
          </Link>
        </nav>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-emergency text-emergency-foreground">
              3
            </Badge>
          </Button>

          <Button variant="ghost" size="icon">
            <Search className="h-4 w-4" />
          </Button>

          <div className="hidden md:block">
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 shadow-lg"
            >
              <Link to="/report">
                <Plus className="h-4 w-4 mr-2" />
                Report Issue
              </Link>
            </Button>
          </div>

          {/* Mobile Report Button */}
          <div className="md:hidden">
            <Button
              asChild
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              <Link to="/report">
                <Plus className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
