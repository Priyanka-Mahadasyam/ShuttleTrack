// src/hooks/useBusLocation.ts
import { useEffect, useState } from "react";
import api from "../services/api";

export type BusLocationResponse = {
  bus_id: number;
  latitude: number;
  longitude: number;
  is_active?: boolean;
  current_stop?: string | null;
  next_stop?: string | null;
  eta?: string | null;
  timestamp?: string | null;
};

export function useBusLocation(busId?: number | string, intervalMs = 3000) {
  const [location, setLocation] = useState<BusLocationResponse | null>(null);
  useEffect(() => {
    if (!busId) {
      setLocation(null);
      return;
    }
    let mounted = true;
    let handle: number;
    const fetchOnce = async () => {
      try {
        const res = await api.get<BusLocationResponse>(`/buses/${busId}/location`);
        if (!mounted) return;
        setLocation(res.data ?? null);
      } catch (err) {
        // swallow network errors for now
        if (!mounted) return;
        setLocation(null);
      }
    };
    fetchOnce();
    handle = window.setInterval(fetchOnce, intervalMs);
    return () => {
      mounted = false;
      clearInterval(handle);
    };
  }, [busId, intervalMs]);

  return location;
}
