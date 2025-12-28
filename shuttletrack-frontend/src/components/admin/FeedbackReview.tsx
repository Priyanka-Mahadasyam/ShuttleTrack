// src/components/admin/FeedbackReview.tsx
import React, { useEffect, useState } from "react";
import { MessageSquare, Star, User, Calendar, Bus as BusIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import api from "../../services/api";
import type { Feedback } from "../../types";

type FeedbackRow = Feedback & {
  bus_name?: string | null;
  user_name?: string | null;
};

export default function FeedbackReview(): JSX.Element {
  const [filter, setFilter] = useState<"all" | "new" | "under review" | "resolved">("all");
  const [feedbacks, setFeedbacks] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // small helper to map textual rating -> number of stars
  const ratingToStars = (rating: any) => {
    if (!rating) return 0;
    const r = String(rating).toLowerCase();
    if (r.includes("good")) return 5;
    if (r.includes("average")) return 3;
    if (r.includes("bad")) return 1;
    // if it's numeric already
    const n = Number(rating);
    if (!Number.isNaN(n)) return Math.max(0, Math.min(5, Math.floor(n)));
    return 0;
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    // fetch feedbacks
    api.get<Feedback[]>("/feedback")
      .then(async (res) => {
        if (!mounted) return;
        const rows = Array.isArray(res.data) ? res.data : [];

        // try fetching buses and users in parallel to resolve names (optional)
        const busIds = Array.from(new Set(rows.map((r) => r.bus_id).filter(Boolean)));
        const userIds = Array.from(new Set(rows.map((r) => r.user_id).filter(Boolean)));

        // fetch mapping if endpoints exist; ignore failures
        const [busesResp, usersResp] = await Promise.allSettled([
          api.get("/buses"),
          api.get("/users"),
        ]);

        let busMap = new Map<number, string>();
        if (busesResp.status === "fulfilled" && Array.isArray(busesResp.value.data)) {
          for (const b of busesResp.value.data) {
            if (b?.id != null) busMap.set(Number(b.id), b.name ?? String(b.id));
          }
        }

        let userMap = new Map<number, string>();
        if (usersResp.status === "fulfilled" && Array.isArray(usersResp.value.data)) {
          for (const u of usersResp.value.data) {
            if (u?.id != null) userMap.set(Number(u.id), u.username ?? u.email ?? String(u.id));
          }
        }

        const enriched: FeedbackRow[] = rows.map((r) => ({
          ...r,
          bus_name: r.bus_id != null ? (busMap.get(Number(r.bus_id)) ?? `Bus ${r.bus_id}`) : undefined,
          user_name: r.user_id != null ? (userMap.get(Number(r.user_id)) ?? `User ${r.user_id}`) : undefined,
        }));

        setFeedbacks(enriched);
      })
      .catch((err) => {
        console.error("Failed to fetch feedback", err);
        setFeedbacks([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const filteredFeedbacks = feedbacks.filter((fb) => filter === "all" || fb.status === filter);

  const updateFeedbackStatus = async (id: number, newStatus: Feedback["status"]) => {
    try {
      await api.put(`/feedback/${id}/status`, { status: newStatus });
      setFeedbacks((prev) => prev.map((fb) => (fb.id === id ? { ...fb, status: newStatus } : fb)));
    } catch (err) {
      console.error("Failed to update feedback status", err);
      alert("Could not update feedback status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-red-500/20 text-red-400";
      case "under review": return "bg-yellow-500/20 text-yellow-400";
      case "resolved": return "bg-green-500/20 text-green-400";
      default: return "bg-muted";
    }
  };

  const renderStars = (rating: string | number) => {
    const num = ratingToStars(rating);
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < num ? "text-yellow-400 fill-current" : "text-gray-600"}`} />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Student Feedback</h2>
          <p className="text-muted-foreground">Review and manage student feedback submissions</p>
        </div>

        <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="under review">Under Review</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {loading && <div>Loading feedback…</div>}

        {!loading && filteredFeedbacks.map((fb) => (
          <Card key={fb.id} className="hover-glow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {fb.bus_name ? fb.bus_name : `Bus ${fb.bus_id}`} — {fb.user_name ? fb.user_name : `Student ${fb.user_id}`}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BusIcon className="h-4 w-4" />
                      <Calendar className="h-4 w-4 ml-2" />
                      {fb.created_at ?? "Unknown date"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(fb.status)} variant="secondary">
                    {fb.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-1">
                {renderStars(fb.rating)}
                <span className="text-sm text-muted-foreground ml-2">({fb.rating})</span>
              </div>

              <p className="text-foreground">{fb.comments}</p>

              {fb.status === "new" && (
                <div className="flex gap-2 pt-4">
                  <Button size="sm" variant="secondary" onClick={() => updateFeedbackStatus(fb.id, "under review")}>
                    Mark as Under Review
                  </Button>
                  <Button size="sm" onClick={() => updateFeedbackStatus(fb.id, "resolved")}>
                    Mark as Resolved
                  </Button>
                </div>
              )}

              {fb.status === "under review" && (
                <div className="flex gap-2 pt-4">
                  <Button size="sm" onClick={() => updateFeedbackStatus(fb.id, "resolved")}>
                    Mark as Resolved
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {!loading && filteredFeedbacks.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No feedback found</h3>
              <p className="text-muted-foreground">No feedback matches your current filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
