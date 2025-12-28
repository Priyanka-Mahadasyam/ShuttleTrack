// src/hooks/useBusLocation.ts
import { useEffect, useState } from "react";
import api from "../services/api";

export type BusLocation = {
  bus_id: number;
  latitude: number;
  longitude: number;
  timestamp?: string;
};

export function useBusLocation(busId?: number | string, intervalMs = 5000) {
  const [location, setLocation] = useState<BusLocation | null>(null);

  useEffect(() => {
    if (!busId) {
      setLocation(null);
      return;
    }

    let active = true;

    const fetchLocation = async () => {
      try {
        const res = await api.get(`/buses/${busId}/location`);
        if (active) {
          setLocation(res.data);
        }
      } catch {
        if (active) {
          setLocation(null);
        }
      }
    };

    fetchLocation();
    const id = setInterval(fetchLocation, intervalMs);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, [busId, intervalMs]);

  return location;
}
