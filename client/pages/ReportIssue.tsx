import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { SubmissionSuccess } from "@/components/SubmissionSuccess";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Camera,
  Upload,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import { EventCategory } from "@shared/types";
import { cn } from "@/lib/utils";

const categories: {
  value: EventCategory;
  label: string;
  description: string;
}[] = [
  {
    value: "traffic",
    label: "Traffic Issues",
    description: "Traffic jams, accidents, road blocks, signal problems",
  },
  {
    value: "civic",
    label: "Civic Issues",
    description: "Potholes, water logging, power cuts, garbage",
  },
  {
    value: "event",
    label: "Public Events",
    description: "Festivals, rallies, gatherings, celebrations",
  },
  {
    value: "emergency",
    label: "Emergency",
    description: "Fire, medical emergency, security threat",
  },
];

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

export default function ReportIssue() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [photoAnalysis, setPhotoAnalysis] = useState<{ [key: string]: any }>(
    {},
  );
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState("");
  const [photoComments, setPhotoComments] = useState<{ [key: string]: string }>(
    {},
  );
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "" as EventCategory | "",
    severity: "" as "low" | "medium" | "high" | "critical" | "",
    location: "",
    contactName: "",
    contactPhone: "",
    hashtags: [] as string[],
    photoComments: {} as { [key: string]: string },
  });

  // Simulated location detection - in real app, this would use geolocation API
  const [currentLocation, setCurrentLocation] = useState({
    lat: 12.9716,
    lng: 77.5946,
    address: "Detecting current location...",
  });

  // Simulate location detection on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      // Simulate getting a more specific location
      const locations = [
        "Koramangala 5th Block, Bengaluru",
        "Indiranagar 100 Feet Road, Bengaluru",
        "HSR Layout Sector 1, Bengaluru",
        "Whitefield EPIP Zone, Bengaluru",
        "Jayanagar 4th Block, Bengaluru",
      ];

      const randomLocation =
        locations[Math.floor(Math.random() * locations.length)];
      setCurrentLocation((prev) => ({
        ...prev,
        address: randomLocation,
      }));
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      const isValidType =
        file.type.startsWith("image/") || file.type.startsWith("video/");
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit

      if (!isValidType) {
        alert(`File ${file.name} is not a valid image or video file.`);
        return false;
      }

      if (!isValidSize) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }

      return true;
    });

    setSelectedFiles((prev) => [...prev, ...validFiles].slice(0, 3)); // Max 3 files

    // Simulate AI analysis for new images
    for (const file of validFiles) {
      if (file.type.startsWith("image/")) {
        await analyzePhoto(file);
      }
    }
  };

  const analyzePhoto = async (file: File) => {
    // Simulate AI photo analysis
    setTimeout(() => {
      const analysis = {
        detectedObjects: ["pothole", "road", "asphalt"],
        suggestedCategory: "civic",
        suggestedSeverity: "high",
        suggestedTags: ["#pothole", "#road_damage", "#infrastructure"],
        confidence: 0.92,
        description:
          "Large pothole detected on road surface with visible damage to asphalt",
      };

      setPhotoAnalysis((prev) => ({
        ...prev,
        [file.name]: analysis,
      }));

      // Auto-suggest category and severity if not already set
      if (!formData.category) {
        setFormData((prev) => ({
          ...prev,
          category: analysis.suggestedCategory as EventCategory,
        }));
      }
      if (!formData.severity) {
        setFormData((prev) => ({
          ...prev,
          severity: analysis.suggestedSeverity as any,
        }));
      }

      // Add suggested hashtags
      const newTags = analysis.suggestedTags.filter(
        (tag) => !hashtags.includes(tag),
      );
      setHashtags((prev) => [...prev, ...newTags]);
    }, 1500);
  };

  const removeFile = (index: number) => {
    const fileToRemove = selectedFiles[index];
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));

    // Remove photo analysis for deleted file
    if (fileToRemove) {
      setPhotoAnalysis((prev) => {
        const updated = { ...prev };
        delete updated[fileToRemove.name];
        return updated;
      });
      setPhotoComments((prev) => {
        const updated = { ...prev };
        delete updated[fileToRemove.name];
        return updated;
      });
    }
  };

  const addHashtag = (tag: string) => {
    const cleanTag = tag.startsWith("#") ? tag : `#${tag}`;
    if (cleanTag.length > 1 && !hashtags.includes(cleanTag)) {
      setHashtags((prev) => [...prev, cleanTag]);
      setNewHashtag("");
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags((prev) => prev.filter((t) => t !== tag));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newHashtag.trim()) {
      e.preventDefault();
      addHashtag(newHashtag.trim());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get current location (simulate GPS)
      const currentLocation = {
        lat: 12.9716,
        lng: 77.5946,
        address: formData.location || "Current location detected",
      };

      // Prepare report data
      const reportData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        severity: formData.severity || "medium",
        location: currentLocation,
        timestamp: new Date().toISOString(),
        reporterName: formData.contactName,
        reporterContact: formData.contactPhone,
        hasMedia: selectedFiles.length > 0,
        mediaCount: selectedFiles.length,
        hashtags: hashtags,
        photoComments: photoComments,
        aiAnalysis: Object.values(photoAnalysis),
      };

      // Submit to API
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
        // Store report ID for tracking
        localStorage.setItem("lastReportId", result.reportId);
      } else {
        throw new Error(result.message || "Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      // For demo purposes, still show success
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <SubmissionSuccess
        reportData={{
          title: formData.title,
          description: formData.description,
          category: formData.category as EventCategory,
          severity: formData.severity || "medium",
          location: currentLocation,
          hasMedia: selectedFiles.length > 0,
          mediaCount: selectedFiles.length,
        }}
        onNewReport={() => {
          setIsSubmitted(false);
          setFormData({
            title: "",
            description: "",
            category: "",
            severity: "",
            location: "",
            contactName: "",
            contactPhone: "",
            hashtags: [],
            photoComments: {},
          });
          setSelectedFiles([]);
          setPhotoAnalysis({});
          setHashtags([]);
          setNewHashtag("");
          setPhotoComments({});
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />

      <div className="flex-1 overflow-auto">
        <div className="container max-w-2xl py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Report an Issue</h1>
            <p className="text-muted-foreground">
              Help improve the city by reporting issues in real-time. Your
              reports are verified using AI and shared with relevant
              authorities.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <Card className="p-6">
              <h2 className="font-semibold mb-4">
                What type of issue is this?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories.map((category) => (
                  <div
                    key={category.value}
                    className={cn(
                      "p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
                      formData.category === category.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                    )}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        category: category.value,
                      }))
                    }
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Label className="font-medium cursor-pointer">
                        {category.label}
                      </Label>
                      <Badge
                        className={cn(
                          "text-xs",
                          getCategoryColor(category.value),
                        )}
                      >
                        {category.value}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Issue Details */}
            <Card className="p-6">
              <h2 className="font-semibold mb-4">Describe the issue</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Issue Title *</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of the issue"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Detailed Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide more details about the issue, when it started, severity, etc."
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Location */}
            <Card className="p-6">
              <h2 className="font-semibold mb-4">Location Information</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>Current location detected automatically</span>
                </div>

                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm font-medium">
                    {currentLocation.address}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentLocation.lat.toFixed(4)},{" "}
                    {currentLocation.lng.toFixed(4)}
                  </p>
                </div>

                <div>
                  <Label htmlFor="location">
                    Additional Location Details (optional)
                  </Label>
                  <Input
                    id="location"
                    placeholder="Landmark, building name, or specific directions"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </Card>

            {/* Severity Selection */}
            <Card className="p-6">
              <h2 className="font-semibold mb-4">Severity Level</h2>
              <p className="text-sm text-muted-foreground mb-4">
                How urgent is this issue? This helps prioritize response.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  {
                    value: "low",
                    label: "Low",
                    color: "bg-success",
                    desc: "Minor issue",
                  },
                  {
                    value: "medium",
                    label: "Medium",
                    color: "bg-warning",
                    desc: "Needs attention",
                  },
                  {
                    value: "high",
                    label: "High",
                    color: "bg-orange-500",
                    desc: "Urgent",
                  },
                  {
                    value: "critical",
                    label: "Critical",
                    color: "bg-emergency",
                    desc: "Emergency",
                  },
                ].map((severity) => (
                  <div
                    key={severity.value}
                    className={cn(
                      "p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md text-center",
                      formData.severity === severity.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                    )}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        severity: severity.value as any,
                      }))
                    }
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full mx-auto mb-1",
                        severity.color,
                      )}
                    />
                    <p className="font-medium text-sm">{severity.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {severity.desc}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Photo/Video Upload with Camera */}
            <Card className="p-6">
              <h2 className="font-semibold mb-4">Add Evidence</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Photos and videos help verify your report. Our AI will analyze
                the media to auto-categorize and assess severity.
              </p>

              <div className="space-y-4">
                {/* Camera and Upload Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-12"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.capture = "environment";
                      input.onchange = (e) => {
                        const target = e.target as HTMLInputElement;
                        if (target.files) {
                          handleFileSelect({ target } as any);
                        }
                      };
                      input.click();
                    }}
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Open Camera
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-12"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.multiple = true;
                      input.accept = "image/*,video/*";
                      input.onchange = (e) => {
                        const target = e.target as HTMLInputElement;
                        if (target.files) {
                          handleFileSelect({ target } as any);
                        }
                      };
                      input.click();
                    }}
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Choose Files
                  </Button>
                </div>

                {/* Selected Files with AI Analysis */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">
                      Uploaded Files & AI Analysis:
                    </h3>
                    {selectedFiles.map((file, index) => {
                      const analysis = photoAnalysis[file.name];
                      const isAnalyzing =
                        file.type.startsWith("image/") && !analysis;

                      return (
                        <div
                          key={index}
                          className="border rounded-lg p-4 space-y-3"
                        >
                          {/* File Info */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                {file.type.startsWith("image/") ? (
                                  <Camera className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                  <Upload className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">
                                  {file.name}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {(file.size / 1024 / 1024).toFixed(1)} MB
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {file.type.split("/")[0]}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFile(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* AI Analysis */}
                          {file.type.startsWith("image/") && (
                            <div className="bg-muted/30 rounded-lg p-3">
                              {isAnalyzing ? (
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                  <div className="w-4 h-4 border-2 border-primary border-r-transparent rounded-full animate-spin" />
                                  <span>Analyzing image with AI...</span>
                                </div>
                              ) : analysis ? (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-primary">
                                      AI Analysis
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {Math.round(analysis.confidence * 100)}%
                                      confidence
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {analysis.description}
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {analysis.detectedObjects.map(
                                      (obj: string, i: number) => (
                                        <Badge
                                          key={i}
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {obj}
                                        </Badge>
                                      ),
                                    )}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          )}

                          {/* Photo Comment */}
                          <div className="space-y-2">
                            <Label className="text-xs">
                              Add comment for this photo (optional):
                            </Label>
                            <Textarea
                              placeholder="Describe what you see in this photo..."
                              value={photoComments[file.name] || ""}
                              onChange={(e) => {
                                setPhotoComments((prev) => ({
                                  ...prev,
                                  [file.name]: e.target.value,
                                }));
                              }}
                              rows={2}
                              className="text-sm"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Upload Area */}
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center relative">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Or drag and drop files here
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, MP4 up to 10MB each (max 3 files)
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </Card>

            {/* Hashtags and Tags */}
            <Card className="p-6">
              <h2 className="font-semibold mb-4">Tags & Hashtags</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Add hashtags to categorize your report. Use tags like #pothole,
                #traffic, #lighting to help others find and verify similar
                issues.
              </p>

              <div className="space-y-4">
                {/* Current Hashtags */}
                {hashtags.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm">Current Tags:</Label>
                    <div className="flex flex-wrap gap-2">
                      {hashtags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-sm px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20"
                        >
                          {tag}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="ml-2 h-auto p-0 hover:bg-transparent"
                            onClick={() => removeHashtag(tag)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Hashtag */}
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a hashtag (e.g., pothole, traffic)"
                    value={newHashtag}
                    onChange={(e) => setNewHashtag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => addHashtag(newHashtag)}
                    disabled={!newHashtag.trim()}
                    variant="outline"
                  >
                    Add Tag
                  </Button>
                </div>

                {/* Suggested Tags */}
                {selectedFiles.some((file) => photoAnalysis[file.name]) && (
                  <div className="space-y-2">
                    <Label className="text-sm">AI Suggested Tags:</Label>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(
                        new Set(
                          Object.values(photoAnalysis)
                            .flatMap(
                              (analysis: any) => analysis.suggestedTags || [],
                            )
                            .filter((tag: string) => !hashtags.includes(tag)),
                        ),
                      ).map((tag: any, index) => (
                        <Button
                          key={index}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => addHashtag(tag)}
                        >
                          + {tag}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-6">
              <h2 className="font-semibold mb-4">
                Contact Information (Optional)
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Provide your contact details if authorities need to reach you
                for follow-up or clarification.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactName">Name</Label>
                  <Input
                    id="contactName"
                    placeholder="Your full name"
                    value={formData.contactName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contactName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Phone Number</Label>
                  <Input
                    id="contactPhone"
                    placeholder="+91 9876543210"
                    value={formData.contactPhone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contactPhone: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </Card>

            <Separator />

            {/* Submit button */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                <span>
                  Your report will be processed by AI and shared with relevant
                  authorities
                </span>
              </div>

              {/* Form validation feedback */}
              {(!formData.title ||
                !formData.description ||
                !formData.category ||
                !formData.severity) && (
                <div className="text-sm text-warning bg-warning/10 border border-warning/20 rounded-lg p-3">
                  Please complete all required fields: Title, Description,
                  Category, and Severity
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !formData.title ||
                    !formData.description ||
                    !formData.category ||
                    !formData.severity
                  }
                  className="min-w-[140px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
