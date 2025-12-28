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

export function useBusLocation(
  busId?: number | string,
  intervalMs: number = 3000
) {
  const [location, setLocation] = useState<BusLocationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!busId) {
      setLocation(null);
      return;
    }

    let mounted = true;
    let timer: number;

    const fetchLocation = async () => {
      try {
        setLoading(true);
        const res = await api.get<BusLocationResponse>(
          `/buses/${busId}/location`
        );
        if (!mounted) return;
        setLocation(res.data);
      } catch (err) {
        if (!mounted) return;
        console.warn("Failed to fetch bus location", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // initial fetch
    fetchLocation();

    // polling
    timer = window.setInterval(fetchLocation, intervalMs);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [busId, intervalMs]);

  return { location, loading };
}
