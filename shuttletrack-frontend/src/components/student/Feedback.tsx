// src/components/student/Feedback.tsx
import React, { useEffect, useState } from "react";
import { ArrowLeft, ThumbsUp, Meh, ThumbsDown, Send } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import api from "../../services/api";
import { toast } from "sonner";
import type { Bus } from "../../types";

interface FeedbackProps {
  onBack: () => void;
}

type Rating = "good" | "average" | "bad";

export function Feedback({ onBack }: FeedbackProps) {
  const [selectedBus, setSelectedBus] = useState<string>(""); // keep empty for placeholder
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [buses, setBuses] = useState<Bus[]>([]);
  const [busesLoading, setBusesLoading] = useState(false);

  const ratings = [
    { id: "good" as const, label: "Good", icon: ThumbsUp, color: "text-green-500", bgColor: "bg-green-500/10 hover:bg-green-500/20", borderColor: "border-green-500/50" },
    { id: "average" as const, label: "Average", icon: Meh, color: "text-yellow-500", bgColor: "bg-yellow-500/10 hover:bg-yellow-500/20", borderColor: "border-yellow-500/50" },
    { id: "bad" as const, label: "Bad", icon: ThumbsDown, color: "text-red-500", bgColor: "bg-red-500/10 hover:bg-red-500/20", borderColor: "border-red-500/50" },
  ];

  useEffect(() => {
    let mounted = true;
    setBusesLoading(true);
    api.get<Bus[]>("/buses")
      .then((res) => {
        if (!mounted) return;
        const data = Array.isArray(res.data) ? res.data : [];
        setBuses(data);
      })
      .catch((err) => {
        console.error("Failed to fetch buses", err);
        toast.error("Cannot load buses. Try again later.");
        setBuses([]);
      })
      .finally(() => {
        if (mounted) setBusesLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const handleSubmit = async () => {
    if (!selectedBus || selectedBus === "none" || !selectedRating) {
      toast.error("Please select a bus and rating");
      return;
    }

    setIsSubmitting(true);
    try {
      const body = {
        bus_id: Number(selectedBus),
        rating: selectedRating === "good" ? "Good" : selectedRating === "average" ? "Average" : "Bad",
        comments: comment || "",
      };

      await api.post("/feedback", body);
      toast.success("Feedback submitted. Thank you!");
      setSelectedBus("");
      setSelectedRating(null);
      setComment("");
    } catch (err: any) {
      console.error("Feedback submit failed", err?.response || err);
      const msg = err?.response?.data?.detail || "Failed to send feedback. Try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="hover-glow">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Give Feedback</h1>
            <p className="text-muted-foreground">Help us improve our shuttle service</p>
          </div>
        </div>

        <Card className="hover-glow">
          <CardHeader>
            <CardTitle>Share Your Experience</CardTitle>
            <CardDescription>Your feedback helps us provide better service</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Bus</label>

              <Select value={selectedBus} onValueChange={(val) => setSelectedBus(val)}>
                <SelectTrigger>
                  <SelectValue placeholder={busesLoading ? "Loading buses..." : "Choose the bus you traveled on"} />
                </SelectTrigger>

                <SelectContent>
                  {/* If there are no buses, render a disabled item with a non-empty value */}
                  {buses.length === 0 && !busesLoading && (
                    <SelectItem value="none" disabled>
                      No buses found
                    </SelectItem>
                  )}

                  {buses.map((bus) => (
                    bus?.id != null ? (
                      <SelectItem key={bus.id} value={String(bus.id)}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: (bus as any).color ?? "#666" }} />
                          {bus.name ?? `Bus ${bus.id}`}
                        </div>
                      </SelectItem>
                    ) : null
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">How was your experience?</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {ratings.map((rating) => {
                  const IconComponent = rating.icon;
                  const isSelected = selectedRating === rating.id;
                  return (
                    <Card
                      key={rating.id}
                      className={`cursor-pointer transition-all duration-300 hover:scale-105 hover-glow ${isSelected ? `${rating.bgColor} ${rating.borderColor} border-2` : "hover:bg-muted/50"}`}
                      onClick={() => setSelectedRating(rating.id)}
                    >
                      <CardContent className="p-6 text-center space-y-3">
                        <div className={`w-12 h-12 ${rating.bgColor} rounded-full flex items-center justify-center mx-auto`}>
                          <IconComponent className={`h-6 w-6 ${rating.color}`} />
                        </div>
                        <div className={`font-medium ${isSelected ? rating.color : "text-foreground"}`}>{rating.label}</div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Comments (Optional)</label>
              <Textarea value={comment} onChange={(e) => setComment((e.target as HTMLTextAreaElement).value)} placeholder="Tell us more about your experience..." className="min-h-[100px] resize-none" />
            </div>

            <Button onClick={handleSubmit} className="w-full hover-glow" disabled={!selectedBus || !selectedRating || isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Feedback;
