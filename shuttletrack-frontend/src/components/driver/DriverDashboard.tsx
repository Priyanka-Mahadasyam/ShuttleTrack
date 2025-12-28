// src/components/driver/DriverDashboard.tsx
import React, { useEffect, useRef, useState } from "react";
import { MapPin, Square, Play, Pause, Route } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ViewRoutes } from "./ViewRoutes";
import { toast } from "sonner";
import api from "../../services/api";

type Bus = { id: number; name?: string; color?: string };

export function DriverDashboard(): JSX.Element {
  const [isLocationSharing, setIsLocationSharing] = useState<boolean>(false);
  const [currentTrip, setCurrentTrip] = useState<string | null>(null);
  const [showRoutes, setShowRoutes] = useState(false);

  const [buses, setBuses] = useState<Bus[]>([]);
  const [busy, setBusy] = useState(false);
  const [selectedBusId, setSelectedBusId] = useState<string>("");

  const watchIdRef = useRef<number | null>(null);
  // small throttle to avoid spamming the user with many identical error toasts
  const lastErrorAtRef = useRef<number>(0);
  const ERROR_TOAST_THROTTLE_MS = 10_000; // 10 seconds

  useEffect(() => {
    let mounted = true;
    api
      .get<Bus[]>("/buses")
      .then((r) => {
        if (!mounted) return;
        setBuses(Array.isArray(r.data) ? r.data : []);
      })
      .catch((e) => {
        console.error("Could not load buses", e);
        toast.error("Could not load buses. Try again later.");
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (isLocationSharing && selectedBusId) {
      if (!("geolocation" in navigator)) {
        toast.error("Geolocation not supported in this browser");
        setIsLocationSharing(false);
        return;
      }

      const success = async (pos: GeolocationPosition) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;

        // payload includes both short and long names to match backend examples
        const payload = {
          bus_id: selectedBusId,
          latitude,
          longitude,
          lat: latitude,
          lon: longitude,
          timestamp: new Date().toISOString(),
          ts: new Date().toISOString(),
          accuracy: pos.coords.accuracy ?? null,
          speed: pos.coords.speed ?? null,
          heading: pos.coords.heading ?? null,
        };

        try {
          // correct endpoint per Swagger: POST /buses/{id}/location
          await api.post(`/buses/${selectedBusId}/location`, payload);
          // debug log - can remove later
          // console.log("Location update sent:", payload);
        } catch (err) {
          console.error("Failed to send location", err);
          const now = Date.now();
          if (now - lastErrorAtRef.current > ERROR_TOAST_THROTTLE_MS) {
            toast.error("Failed to send location update to server");
            lastErrorAtRef.current = now;
          }
        }
      };

      const error = (err: GeolocationPositionError) => {
        console.error("Geolocation error", err);
        toast.error(`Geolocation error: ${err.message}`);
      };

      const wid = navigator.geolocation.watchPosition(success, error, {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      });
      watchIdRef.current = wid;
      console.info("Started geolocation watcher:", wid);

      return () => {
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
          console.info("Cleared geolocation watcher on cleanup");
        }
      };
    } else {
      // ensure watcher stopped
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        console.info("Cleared geolocation watcher (stopped sharing)");
      }
    }
    // only rerun when sharing state or selected bus changes
  }, [isLocationSharing, selectedBusId]);

  const startSharing = () => {
    if (!selectedBusId) {
      toast.error("Select a bus to share location for");
      return;
    }
    setBusy(true);
    setCurrentTrip(`Trip-${Date.now().toString(36).slice(-6).toUpperCase()}`);
    setIsLocationSharing(true);
    toast.success("Location sharing started — allow location permission if prompted");
    setBusy(false);
  };

  const stopSharing = () => {
    setIsLocationSharing(false);
    setCurrentTrip(null);
    toast.info("Location sharing stopped");
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const handleToggle = () => {
    if (isLocationSharing) stopSharing();
    else startSharing();
  };

  if (showRoutes) return <ViewRoutes onBack={() => setShowRoutes(false)} />;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Driver Dashboard</h1>
          <p className="text-muted-foreground">Share your location with students</p>
        </div>

        <Card className="hover-glow">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              Location Sharing
            </CardTitle>
            <CardDescription>Start sharing your location to help students track your bus</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Bus to Share</label>
              <div className="relative">
                <select
                  value={selectedBusId}
                  onChange={(e) => setSelectedBusId(e.target.value)}
                  className="w-full rounded-md px-3 py-2 bg-card border border-border"
                >
                  <option value="">-- Choose bus --</option>
                  {buses.map((b) => (
                    <option key={b.id} value={String(b.id)}>
                      {b.name ?? `Bus ${b.id}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isLocationSharing ? "bg-green-500" : "bg-red-500"}`} />
                <div>
                  <div className="font-medium">GPS Status</div>
                  <div className="text-sm text-muted-foreground">
                    {isLocationSharing ? "Broadcasting location" : "Location sharing disabled"}
                  </div>
                </div>
              </div>
              <Badge variant={isLocationSharing ? "default" : "secondary"}>
                {isLocationSharing ? "ON" : "OFF"}
              </Badge>
            </div>

            {currentTrip && (
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-primary">Active Trip</div>
                    <div className="text-sm text-muted-foreground">{currentTrip}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Started</div>
                    <div className="font-medium">{new Date().toLocaleTimeString()}</div>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleToggle}
              className={`w-full h-16 text-lg hover-glow ${
                isLocationSharing ? "bg-red-500 hover:bg-red-600 text-white" : "bg-primary hover:bg-primary/90"
              }`}
              disabled={busy || !selectedBusId}
            >
              {isLocationSharing ? (
                <>
                  <Pause className="mr-3 h-6 w-6" />
                  Stop Sharing Location
                </>
              ) : (
                <>
                  <Play className="mr-3 h-6 w-6" />
                  Start Sharing Location
                </>
              )}
            </Button>

            {isLocationSharing && (
              <Button
                onClick={() => {
                  setIsLocationSharing(false);
                  setCurrentTrip(null);
                }}
                variant="outline"
                className="w-full hover-glow"
              >
                <Square className="mr-2 h-4 w-4" />
                End Trip
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access important driver tools and information</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowRoutes(true)} variant="outline" className="w-full hover-glow">
              <Route className="mr-2 h-4 w-4" />
              View My Route
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DriverDashboard;
