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
  // three-state: null = no bus selected, false = selected but GPS off, true = selected and GPS on
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const pollRef = useRef<number | null>(null);

  const POLL_INTERVAL_MS = 5000;

  // Load buses
  useEffect(() => {
    api
      .get<Bus[]>("/buses")
      .then((r) => {
        const valid = (r.data || []).filter((b) => b.name && b.name !== "Bus 101");
        setBuses(valid);
      })
      .catch((e) => console.error("Failed to fetch buses", e));
  }, []);

  // When selectedBus changes: reset states, set selected-but-not-live, fetch snapshot & authoritative location
  useEffect(() => {
    if (!selectedBus) {
      setStops([]);
      setBusLocation(null);
      setSelectedStop("");
      setIsActive(null); // NO BUS SELECTED
      setLastUpdated(null);
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }

    // selected but not yet confirmed live -> show "inactive" until /location proves otherwise
    setIsActive(false);

    setIsLoading(true);
    api
      .get(`/buses/${selectedBus}`)
      .then((r) => {
        const data = r.data ?? {};
        const stopsArr = Array.isArray(data.stops) ? data.stops : data.route?.stops ?? [];
        setStops(stopsArr.map((s: any, i: number) => ({ id: s.id ?? i, name: s.name ?? `Stop ${i + 1}` })));
      })
      .catch(() => setStops([]))
      .finally(() => setIsLoading(false));

    // fetch authoritative location once and start poll
    fetchLatestLocation(selectedBus);
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    pollRef.current = window.setInterval(() => fetchLatestLocation(selectedBus), POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBus]);

  // WebSocket updates: only accept messages for selected bus
  useBusLocationWs(
    (msg: any) => {
      if (msg?.type !== "location_update") return;
      if (String(msg.bus_id) !== String(selectedBus)) return;
      const nowIso = msg.last_seen ?? new Date().toISOString();
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
          last_seen: nowIso,
        });
        setLastUpdated(new Date(nowIso));
        setIsActive(true);
      }
    },
    selectedBus || null
  );

  // authoritative fetch of /buses/{id}/location
  async function fetchLatestLocation(busId: string) {
    try {
      const res = await api.get(`/buses/${busId}/location`);
      const d = res.data ?? {};
      const lat = d.latitude ?? d.lat ?? d.current_lat ?? null;
      const lon = d.longitude ?? d.lon ?? d.current_lon ?? null;
      const lastSeen = d.last_seen ?? d.timestamp ?? null;

      if (lat != null && lon != null) {
        setBusLocation({
          bus_id: d.bus_id ?? busId,
          lat: Number(lat),
          lon: Number(lon),
          currentStop: d.current_stop ?? null,
          nextStop: d.next_stop ?? null,
          eta: d.eta ?? null,
          last_seen: lastSeen ?? new Date().toISOString(),
        });
        setLastUpdated(lastSeen ? new Date(lastSeen) : new Date());
        setIsActive(true);
      } else {
        // no coords -> selected but not live
        setBusLocation((prev: any) => ({ ...(prev ?? { bus_id: busId }), lat: null, lon: null, last_seen: lastSeen ?? prev?.last_seen ?? null }));
        setLastUpdated(lastSeen ? new Date(lastSeen) : null);
        setIsActive(false);
      }
    } catch (err: any) {
      if (err?.response?.status === 404) {
        // no location stored yet
        setBusLocation({ bus_id: busId, lat: null, lon: null, last_seen: null });
        setLastUpdated(null);
        setIsActive(false);
      } else {
        console.warn("Failed to fetch latest location", err);
      }
    }
  }

  const handleTrack = async () => {
    if (!selectedBus) return;
    setIsLoading(true);
    try {
      await fetchLatestLocation(selectedBus);
    } finally {
      setIsLoading(false);
    }
  };

  const routeName = useMemo(() => buses.find((x) => String(x.id) === String(selectedBus))?.name ?? "", [buses, selectedBus]);

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
            <p className="text-muted-foreground">Select bus & stop to see live updates</p>
          </div>
        </div>

        <Card className="hover-glow">
          <CardHeader>
            <CardTitle>Select Your Journey</CardTitle>
            <CardDescription>Choose your bus and destination stop</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Select Bus</label>
                <Select value={selectedBus} onValueChange={setSelectedBus}>
                  <SelectTrigger><SelectValue placeholder="Choose your bus" /></SelectTrigger>
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
                <Select value={selectedStop} onValueChange={setSelectedStop} disabled={!stops.length}>
                  <SelectTrigger>
                    <SelectValue placeholder={stops.length ? "Choose stop" : "Stops unavailable"} />
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
              <Button onClick={handleTrack} disabled={isLoading}>
                {isLoading ? "Tracking..." : <><Navigation className="mr-2 h-4 w-4" />Track Bus</>}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Live Location
            </CardTitle>
            <CardDescription>
              Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 text-center">
              <div>
                <div className="text-sm text-muted-foreground">Current Stop</div>
                <div>{busLocation?.currentStop ?? "—"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Next Stop</div>
                <div>{busLocation?.nextStop ?? "—"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">ETA</div>
                <div className="flex justify-center items-center gap-1 text-primary">
                  <Clock className="h-4 w-4" />
                  {busLocation?.eta ?? "—"}
                </div>
              </div>
            </div>
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
                <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">Please select a bus to view tracking details.</div>
              ) : isActive === false ? (
                <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">Bus inactive. No live coordinates.</div>
              ) : (
                typeof busLocation?.lat === "number" && typeof busLocation?.lon === "number" ? (
                  <MapContainer center={[busLocation.lat, busLocation.lon]} zoom={14} style={{ height: "400px", width: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[busLocation.lat, busLocation.lon]} icon={busIcon}>
                      <Popup>
                        <b>{routeName}</b><br />
                        {busLocation.currentStop ?? "—"} → {busLocation.nextStop ?? "—"}
                      </Popup>
                    </Marker>
                    <Recenter lat={busLocation.lat} lon={busLocation.lon} />
                  </MapContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">Waiting for coordinates...</div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
