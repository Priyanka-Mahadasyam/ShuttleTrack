// src/components/student/TrackBus.tsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { ArrowLeft, MapPin, Clock, Navigation, AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import api from "../../services/api";
import useBusLocationWs from "../../hooks/useBusLocationWs";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61205.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function Recenter({ lat, lon }: { lat?: number | null; lon?: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (typeof lat === "number" && typeof lon === "number") {
      try {
        map.setView([lat, lon], map.getZoom());
        map.invalidateSize();
      } catch {}
    }
  }, [lat, lon, map]);
  return null;
}

type Bus = { id: number; name?: string };
type Stop = { id: string | number; name: string };

export default function TrackBus({ onBack }: { onBack: () => void }) {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBus, setSelectedBus] = useState<string>("");
  const [stops, setStops] = useState<Stop[]>([]);
  const [selectedStop, setSelectedStop] = useState<string>("");
  const [busLocation, setBusLocation] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const pollRef = useRef<number | null>(null);

  const POLL_INTERVAL_MS = 5000;

  useEffect(() => {
    api.get<Bus[]>("/buses")
      .then((r) => setBuses((r.data || []).filter((b) => b.name)))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedBus) {
      setStops([]);
      setBusLocation(null);
      setSelectedStop("");
      setIsActive(null);
      setLastUpdated(null);
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    setIsActive(false);
    setIsLoading(true);

    api.get(`/buses/${selectedBus}`)
      .then((r) => {
        const s = r.data?.route?.stops || [];
        setStops(s.map((x: any, i: number) => ({ id: x.id ?? i, name: x.name })));
      })
      .catch(() => setStops([]))
      .finally(() => setIsLoading(false));

    fetchLatestLocation(selectedBus);

    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = window.setInterval(
      () => fetchLatestLocation(selectedBus),
      POLL_INTERVAL_MS
    );

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selectedBus]);

  useBusLocationWs(
    (msg: any) => {
      if (msg?.type !== "location_update") return;
      if (String(msg.bus_id) !== String(selectedBus)) return;

      if (msg.lat != null && msg.lon != null) {
        setBusLocation(msg);
        setLastUpdated(new Date(msg.last_seen ?? Date.now()));
        setIsActive(true);
      }
    },
    selectedBus || null
  );

  async function fetchLatestLocation(busId: string) {
    try {
      const res = await api.get(`/buses/${busId}/location`);
      const d = res.data ?? {};

      if (d.latitude != null && d.longitude != null) {
        setBusLocation({
          lat: Number(d.latitude),
          lon: Number(d.longitude),
          currentStop: d.current_stop,
          nextStop: d.next_stop,
          eta: d.eta,
        });
        setLastUpdated(new Date(d.last_seen ?? Date.now()));
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    } catch {
      setIsActive(false);
    }
  }

  const routeName = useMemo(
    () => buses.find((b) => String(b.id) === selectedBus)?.name ?? "",
    [buses, selectedBus]
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">

        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Track My Bus</CardTitle>
            <CardDescription>Select a bus to start tracking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedBus} onValueChange={setSelectedBus}>
              <SelectTrigger>
                <SelectValue placeholder="Choose bus" />
              </SelectTrigger>
              <SelectContent>
                {buses.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedBus && (
              <Button onClick={() => fetchLatestLocation(selectedBus)}>
                <Navigation className="mr-2 h-4 w-4" /> Start Tracking
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Map View {routeName && `— ${routeName}`}</CardTitle>
            <CardDescription>
              Last updated: {lastUpdated?.toLocaleTimeString() ?? "—"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="min-h-[300px] flex items-center justify-center text-sm text-muted-foreground">

              {isActive === null && "Select a bus to view tracking"}

              {isActive === false && (
                <div className="space-y-3 text-center max-w-md">
                  <div>Bus inactive. No live coordinates.</div>

                  <div className="flex items-start gap-2 text-xs text-yellow-600 bg-yellow-50 border border-yellow-200 p-3 rounded">
                    <AlertTriangle className="h-4 w-4 mt-0.5" />
                    <div>
                      <strong>Infrastructure limitation:</strong><br />
                      The Render free tier does not support persistent WebSocket connections,
                      so real-time map updates are limited. This will be resolved by migrating
                      to a better hosting platform.
                    </div>
                  </div>
                </div>
              )}

              {isActive === true &&
                typeof busLocation?.lat === "number" &&
                typeof busLocation?.lon === "number" && (
                  <MapContainer
                    center={[busLocation.lat, busLocation.lon]}
                    zoom={14}
                    style={{ height: "400px", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[busLocation.lat, busLocation.lon]} icon={busIcon}>
                      <Popup>{routeName}</Popup>
                    </Marker>
                    <Recenter lat={busLocation.lat} lon={busLocation.lon} />
                  </MapContainer>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
