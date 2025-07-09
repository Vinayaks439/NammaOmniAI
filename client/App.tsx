import "./global.css";

import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardSimple from "./pages/DashboardSimple";
import { ReportDashboard } from "./components/ReportDashboard";
import { QuickReport } from "./components/QuickReport";
import { SubmissionSuccess } from "./components/SubmissionSuccess";
import Alerts from "./pages/Alerts";
import NotFound from "./pages/NotFound";
import { useState } from "react";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<DashboardSimple />} />
            <Route path="/report" element={<ReportDashboard />} />
            <Route
              path="/report/new"
              element={
                <QuickReport
                  onComplete={() => {
                    window.location.href = "/report";
                  }}
                />
              }
            />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
