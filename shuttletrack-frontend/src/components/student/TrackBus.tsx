// src/components/student/TrackBus.tsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { ArrowLeft, MapPin, Clock, Navigation } from "lucide-react";
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

type Bus = { id: number; name?: string; color?: string; route_id?: number };
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
    api
      .get<Bus[]>("/buses")
      .then((r) => {
        const valid = (r.data || []).filter((b) => b.name && b.name !== "Bus 101");
        setBuses(valid);
      })
      .catch((e) => console.error("Failed to fetch buses", e));
  }, []);

  useEffect(() => {
    if (!selectedBus) {
      setStops([]);
      setBusLocation(null);
      setSelectedStop("");
      setIsActive(null);
      setLastUpdated(null);
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }

    setIsActive(false);
    setIsLoading(true);

    api
      .get(`/buses/${selectedBus}`)
      .then((r) => {
        const data = r.data ?? {};
        const stopsArr = Array.isArray(data.stops)
          ? data.stops
          : data.route?.stops ?? [];
        setStops(
          stopsArr.map((s: any, i: number) => ({
            id: s.id ?? i,
            name: s.name ?? `Stop ${i + 1}`,
          }))
        );
      })
      .catch(() => setStops([]))
      .finally(() => setIsLoading(false));

    fetchLatestLocation(selectedBus);

    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    pollRef.current = window.setInterval(
      () => fetchLatestLocation(selectedBus),
      POLL_INTERVAL_MS
    );

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [selectedBus]);

  useBusLocationWs(
    (msg: any) => {
      if (msg?.type !== "location_update") return;
      if (String(msg.bus_id) !== String(selectedBus)) return;

      const lat = msg.lat ?? msg.latitude ?? null;
      const lon = msg.lon ?? msg.longitude ?? null;

      if (lat != null && lon != null) {
        setBusLocation({
          bus_id: msg.bus_id,
          lat: Number(lat),
          lon: Number(lon),
          currentStop: msg.current_stop ?? null,
          nextStop: msg.next_stop ?? null,
          eta: msg.eta ?? null,
          last_seen: msg.last_seen ?? new Date().toISOString(),
        });
        setLastUpdated(new Date());
        setIsActive(true);
      }
    },
    selectedBus || null
  );

  async function fetchLatestLocation(busId: string) {
    try {
      const res = await api.get(`/buses/${busId}/location`);
      const d = res.data ?? {};
      const lat = d.latitude ?? d.lat ?? null;
      const lon = d.longitude ?? d.lon ?? null;

      if (lat != null && lon != null) {
        setBusLocation({
          bus_id: busId,
          lat: Number(lat),
          lon: Number(lon),
          currentStop: d.current_stop ?? null,
          nextStop: d.next_stop ?? null,
          eta: d.eta ?? null,
          last_seen: d.last_seen ?? new Date().toISOString(),
        });
        setLastUpdated(new Date());
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    } catch {
      setIsActive(false);
    }
  }

  const routeName = useMemo(
    () => buses.find((x) => String(x.id) === String(selectedBus))?.name ?? "",
    [buses, selectedBus]
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="hover-glow">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Track My Bus</h1>
            <p className="text-muted-foreground">
              Select bus & stop to see live updates
            </p>
          </div>
        </div>

        <Card className="hover-glow">
          <CardHeader>
            <CardTitle>Select Your Journey</CardTitle>
            <CardDescription>
              Choose your bus and destination stop
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Select Bus</label>
                <Select value={selectedBus} onValueChange={setSelectedBus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your bus" />
                  </SelectTrigger>
                  <SelectContent>
                    {buses.map((bus) => (
                      <SelectItem key={bus.id} value={String(bus.id)}>
                        {bus.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Select Stop</label>
                <Select
                  value={selectedStop}
                  onValueChange={setSelectedStop}
                  disabled={!stops.length}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        stops.length ? "Choose stop" : "Stops unavailable"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {stops.map((stop) => (
                      <SelectItem key={stop.id} value={String(stop.id)}>
                        {stop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedBus && (
              <Button onClick={() => fetchLatestLocation(selectedBus)} disabled={isLoading}>
                {isLoading ? "Tracking..." : <><Navigation className="mr-2 h-4 w-4" />Track Bus</>}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="hover-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-secondary" />
              Map View {routeName ? `— ${routeName}` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg overflow-hidden border p-4 bg-card min-h-[300px]">
              {isActive === null ? (
                <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
                  Please select a bus to view tracking details.
                </div>
              ) : isActive === false ? (
                <div className="flex flex-col items-center justify-center h-64 text-sm text-muted-foreground text-center space-y-2 px-4">
                  <div>Bus inactive. No live coordinates.</div>
                  <div className="text-xs text-muted-foreground max-w-md">
                    The Render free tier does not support persistent WebSocket connections,
                    so real-time map updates are limited; this will be resolved by migrating
                    to a better hosting platform.
                  </div>
                </div>
              ) : (
                typeof busLocation?.lat === "number" &&
                typeof busLocation?.lon === "number" ? (
                  <MapContainer
                    center={[busLocation.lat, busLocation.lon]}
                    zoom={14}
                    style={{ height: "400px", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[busLocation.lat, busLocation.lon]} icon={busIcon}>
                      <Popup>
                        <b>{routeName}</b>
                      </Popup>
                    </Marker>
                    <Recenter lat={busLocation.lat} lon={busLocation.lon} />
                  </MapContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
                    Waiting for coordinates...
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
