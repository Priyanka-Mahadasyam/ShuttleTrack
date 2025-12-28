// src/hooks/useDriverLocation.ts
import { useEffect, useRef } from "react";
import api from "../services/api";

export default function useDriverLocation(busId: string | number | null, enabled: boolean) {
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!busId || !enabled) {
      if (watchId.current !== null) {
        try {
          navigator.geolocation.clearWatch(watchId.current);
        } catch {}
        watchId.current = null;
      }
      return;
    }
    if (!("geolocation" in navigator)) {
      console.warn("Geolocation not supported");
      return;
    }

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const payload = {
          latitude: Number(pos.coords.latitude),
          longitude: Number(pos.coords.longitude),
          accuracy: pos.coords.accuracy ?? null,
          speed: pos.coords.speed ?? null,
          heading: pos.coords.heading ?? null,
          timestamp: new Date().toISOString(),
        };
        const urlBusId = String(busId);
        api.post(`/buses/${urlBusId}/location`, payload).catch((err) => {
          console.error("Failed to post location:", err);
        });
      },
      (err) => {
        console.error("Geolocation error:", err);
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
    );

    return () => {
      if (watchId.current !== null) {
        try {
          navigator.geolocation.clearWatch(watchId.current);
        } catch {}
        watchId.current = null;
      }
    };
  }, [busId, enabled]);
}
