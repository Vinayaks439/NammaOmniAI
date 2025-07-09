import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Camera,
  CheckCircle2,
  Loader2,
  MapPin,
  Brain,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EventCategory } from "@shared/types";

interface QuickReportProps {
  onComplete: () => void;
}

const categories: {
  value: EventCategory;
  label: string;
  icon: string;
}[] = [
  { value: "civic", label: "Civic Issues", icon: "🏗️" },
  { value: "traffic", label: "Traffic Problems", icon: "🚗" },
  { value: "emergency", label: "Emergency", icon: "🚨" },
  { value: "event", label: "Public Events", icon: "🎪" },
];

export function QuickReport({ onComplete }: QuickReportProps) {
  const [step, setStep] = useState(1);
  const [capturedImage, setCapturedImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "">(
    "",
  );
  const [description, setDescription] = useState("");
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(
    "Detecting location...",
  );

  // Auto-detect location
  useEffect(() => {
    setTimeout(() => {
      setCurrentLocation("Koramangala 5th Block, Bengaluru");
    }, 1500);
  }, []);

  const handleCameraCapture = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files?.[0]) {
        setCapturedImage(target.files[0]);
        setStep(2);
        analyzeImage(target.files[0]);
      }
    };
    input.click();
  };

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true);

    // Simulate AI analysis with detailed severity assessment
    setTimeout(() => {
      const analysis = {
        detectedObjects: ["pothole", "road", "asphalt"],
        suggestedCategory: "civic",
        aiSeverity: "high",
        severityReason:
          "Large size and depth of pothole poses safety risk to vehicles",
        confidence: 0.94,
        riskAssessment: {
          safetyImpact: "High - potential vehicle damage",
          urgencyLevel: "Requires prompt attention",
          estimatedUsers: "200+ daily commuters affected",
        },
        description:
          "Large pothole detected on road surface causing potential traffic hazard",
      };

      setAiAnalysis(analysis);
      setSelectedCategory(analysis.suggestedCategory as EventCategory);
      setDescription(analysis.description);
      setIsAnalyzing(false);
      setStep(3);
    }, 2000);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      onComplete();
    }, 1500);
  };

  const progressValue = (step / 4) * 100;

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />

      <div className="flex-1 overflow-auto">
        <div className="container max-w-2xl py-8">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span>Quick Report Progress</span>
              <span>Step {step} of 4</span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>

          {/* Step 1: Camera Capture */}
          {step === 1 && (
            <Card className="p-8 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="w-12 h-12 text-primary" />
              </div>

              <h2 className="text-xl font-semibold mb-2">Capture the Issue</h2>
              <p className="text-muted-foreground mb-6">
                Take a photo of the problem you want to report. Our AI will
                automatically analyze and categorize it.
              </p>

              <Button
                size="lg"
                onClick={handleCameraCapture}
                className="w-full sm:w-auto"
              >
                <Camera className="w-5 h-5 mr-2" />
                Open Camera
              </Button>
            </Card>
          )}

          {/* Step 2: AI Analysis */}
          {step === 2 && (
            <Card className="p-8 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Brain className="w-12 h-12 text-primary animate-pulse" />
              </div>

              <h2 className="text-xl font-semibold mb-2">
                AI Analysis in Progress
              </h2>
              <p className="text-muted-foreground mb-6">
                Our AI is analyzing your photo to understand the issue,
                categorize it, and determine the severity level automatically.
              </p>

              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing image content...</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Detecting objects and conditions...</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Assessing severity level...</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Calculating risk impact...</span>
                  </div>
                </div>

                {capturedImage && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm font-medium">
                      📸 {capturedImage.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(capturedImage.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Step 3: Category & Description */}
          {step === 3 && aiAnalysis && (
            <Card className="p-8">
              <h2 className="text-xl font-semibold mb-6">Review AI Analysis</h2>

              {/* AI Analysis Results */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-primary">
                    🤖 AI Analysis Complete
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(aiAnalysis.confidence * 100)}% confidence
                  </Badge>
                </div>
                <p className="text-sm mb-3">{aiAnalysis.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {aiAnalysis.detectedObjects.map((obj: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {obj}
                    </Badge>
                  ))}
                </div>

                {/* AI Severity Assignment */}
                <div className="bg-white/50 rounded-lg p-3 border border-primary/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-primary">
                      🎯 AI Severity Assessment
                    </span>
                    <Badge
                      className={`text-xs ${
                        aiAnalysis.aiSeverity === "critical"
                          ? "bg-red-500 text-white"
                          : aiAnalysis.aiSeverity === "high"
                            ? "bg-orange-500 text-white"
                            : aiAnalysis.aiSeverity === "medium"
                              ? "bg-yellow-500 text-black"
                              : "bg-green-500 text-white"
                      }`}
                    >
                      {aiAnalysis.aiSeverity.toUpperCase()} PRIORITY
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">
                    <strong>Reasoning:</strong> {aiAnalysis.severityReason}
                  </p>

                  {aiAnalysis.riskAssessment && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="bg-red-50 border border-red-200 rounded p-2">
                        <p className="font-medium text-red-700">
                          Safety Impact
                        </p>
                        <p className="text-red-600">
                          {aiAnalysis.riskAssessment.safetyImpact}
                        </p>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded p-2">
                        <p className="font-medium text-orange-700">Urgency</p>
                        <p className="text-orange-600">
                          {aiAnalysis.riskAssessment.urgencyLevel}
                        </p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <p className="font-medium text-blue-700">
                          Impact Scale
                        </p>
                        <p className="text-blue-600">
                          {aiAnalysis.riskAssessment.estimatedUsers}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Selection */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Category (AI suggested)</h3>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <div
                      key={category.value}
                      className={cn(
                        "p-4 rounded-lg border-2 cursor-pointer transition-all",
                        selectedCategory === category.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50",
                      )}
                      onClick={() => setSelectedCategory(category.value)}
                    >
                      <div className="text-center">
                        <span className="text-2xl mb-2 block">
                          {category.icon}
                        </span>
                        <p className="font-medium text-sm">{category.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Description (AI generated)</h3>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Location */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      📍 Auto-detected location
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {currentLocation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Optional Fields Toggle */}
              <div className="mb-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowOptionalFields(!showOptionalFields)}
                  className="w-full flex items-center justify-between"
                >
                  <span>Optional Details</span>
                  {showOptionalFields ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>

                {showOptionalFields && (
                  <div className="mt-4 space-y-4 p-4 bg-muted/30 rounded-lg">
                    <div>
                      <label className="text-sm font-medium">
                        Contact Name (optional)
                      </label>
                      <input
                        type="text"
                        className="w-full mt-1 p-2 border rounded-md text-sm"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Phone Number (optional)
                      </label>
                      <input
                        type="tel"
                        className="w-full mt-1 p-2 border rounded-md text-sm"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={() => setStep(4)}
                className="w-full"
                disabled={!selectedCategory || !description}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          )}

          {/* Step 4: Submit */}
          {step === 4 && (
            <Card className="p-8 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-success" />
              </div>

              <h2 className="text-xl font-semibold mb-2">Ready to Submit</h2>
              <p className="text-muted-foreground mb-6">
                Your report is ready! This will help improve the city for
                everyone.
              </p>

              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Report Summary</span>
                  <div className="flex space-x-2">
                    <Badge
                      className={cn(
                        "text-xs",
                        selectedCategory === "civic"
                          ? "bg-civic"
                          : "bg-traffic",
                      )}
                    >
                      {selectedCategory}
                    </Badge>
                    {aiAnalysis && (
                      <Badge
                        className={`text-xs ${
                          aiAnalysis.aiSeverity === "critical"
                            ? "bg-red-500 text-white"
                            : aiAnalysis.aiSeverity === "high"
                              ? "bg-orange-500 text-white"
                              : aiAnalysis.aiSeverity === "medium"
                                ? "bg-yellow-500 text-black"
                                : "bg-green-500 text-white"
                        }`}
                      >
                        {aiAnalysis.aiSeverity.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {description}
                </p>

                {aiAnalysis && (
                  <div className="bg-primary/10 rounded p-2 mb-2">
                    <p className="text-xs text-primary font-medium">
                      🤖 AI Assessment: {aiAnalysis.aiSeverity.toUpperCase()}{" "}
                      priority
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {aiAnalysis.severityReason}
                    </p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  📍 {currentLocation}
                </p>
              </div>

              <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-6">
                <p className="text-sm">
                  <strong>🎯 Reward:</strong> You'll earn{" "}
                  <strong>5 credit points</strong> for this report!
                </p>
              </div>

              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Report
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
