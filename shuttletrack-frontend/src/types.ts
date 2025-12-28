// src/types.ts

export type FeedbackStatus = "new" | "reviewed" | "resolved" | "under review";

export interface Feedback {
  id: number;
  bus_id: number;
  user_id: number;
  comments: string;
  rating: "Good" | "Average" | "Bad";
  status: FeedbackStatus;
  created_at?: string;
}

export interface Bus {
  id: number;
  name: string;
  route_id: number;
  driver_id: number;
  current_lat?: number;
  current_lon?: number;
  last_seen?: string;
}
