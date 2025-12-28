// src/components/admin/BusLocationViewer.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, MapPin, Navigation } from "lucide-react";
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

export default function BusLocationViewer(): JSX.Element {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBus, setSelectedBus] = useState<string>("");
  const [stops, setStops] = useState<Stop[]>([]);
  const [busLocation, setBusLocation] = useState<{
    lat: number;
    lon: number;
    currentStop?: string | null;
    nextStop?: string | null;
    eta?: string | null;
  } | null>(null);
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const pollRef = useRef<number | null>(null);

  const POLL_INTERVAL_MS = 5000;

  useEffect(() => {
    api.get<Bus[]>("/buses")
      .then((r) => setBuses(Array.isArray(r.data) ? r.data : []))
      .catch((e) => {
        console.error("Failed to fetch buses", e);
        setBuses([]);
      });
  }, []);

  async function fetchLocationRecord(busId: string) {
    try {
      const res = await api.get(`/buses/${busId}/location`);
      const d = res.data ?? {};
      const lat = d.latitude ?? d.lat ?? d.current_lat ?? null;
      const lon = d.longitude ?? d.lon ?? d.current_lon ?? null;
      const lastSeen = d.last_seen ?? d.timestamp ?? null;

      if (lat != null && lon != null) {
        setBusLocation({
          lat: Number(lat),
          lon: Number(lon),
          currentStop: d.current_stop ?? null,
          nextStop: d.next_stop ?? null,
          eta: d.eta ?? null,
        });
        setIsActive(true);
        setLastUpdated(lastSeen ? new Date(lastSeen) : new Date());
        return true;
      } else {
        setBusLocation(null);
        setIsActive(false);
        setLastUpdated(lastSeen ? new Date(lastSeen) : null);
        return false;
      }
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setBusLocation(null);
        setIsActive(false);
        setLastUpdated(null);
        return false;
      }
      console.warn("fetchLocationRecord error", err);
      return false;
    }
  }

  useEffect(() => {
    if (!selectedBus) {
      setStops([]);
      setBusLocation(null);
      setIsActive(null);
      setLastUpdated(null);
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }

    setIsActive(false);

    api.get(`/buses/${selectedBus}`)
      .then((r) => {
        const data = r.data ?? {};
        const stopsArr = Array.isArray(data.stops)
          ? data.stops
          : data.route?.stops ?? [];
        setStops(
          stopsArr.map((s: any, i: number) => ({
            id: s.id ?? i,
            name: s.name ?? s.label ?? `Stop ${i + 1}`,
          }))
        );
      })
      .catch(() => setStops([]));

    fetchLocationRecord(selectedBus);

    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = window.setInterval(
      () => fetchLocationRecord(selectedBus),
      POLL_INTERVAL_MS
    );

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selectedBus]);

  useBusLocationWs(
    (msg: any) => {
      if (!msg) return;
      if (msg.type !== "location_update") return;
      if (!selectedBus) return;
      if (String(msg.bus_id) !== String(selectedBus)) return;

      const lat = msg.lat ?? msg.latitude ?? null;
      const lon = msg.lon ?? msg.longitude ?? null;
      const lastSeen = msg.last_seen ?? null;

      if (lat != null && lon != null) {
        setBusLocation({
          lat: Number(lat),
          lon: Number(lon),
          currentStop: msg.current_stop ?? null,
          nextStop: msg.next_stop ?? null,
          eta: msg.eta ?? null,
        });
        setIsActive(true);
        setLastUpdated(lastSeen ? new Date(lastSeen) : new Date());
      }
    },
    selectedBus || null
  );

  const routeName = useMemo(
    () => buses.find((b) => String(b.id) === String(selectedBus))?.name ?? "",
    [buses, selectedBus]
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hover-glow" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Track Any Bus</h1>
            <p className="text-muted-foreground">View live bus status & location</p>
          </div>
        </div>

        <Card className="hover-glow">
          <CardHeader>
            <CardTitle>Select Bus</CardTitle>
            <CardDescription>Choose a bus to view its live location</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedBus} onValueChange={setSelectedBus}>
              <SelectTrigger>
                <SelectValue placeholder="Select a bus" />
              </SelectTrigger>
              <SelectContent>
                {buses.map((bus) => (
                  <SelectItem key={bus.id} value={String(bus.id)}>
                    {bus.name ?? `Bus ${bus.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {isActive === null ? (
          <div className="text-center text-muted-foreground mt-10">
            Please select a bus to view tracking details.
          </div>
        ) : isActive === false ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Live Location
              </CardTitle>
              <CardDescription>
                Bus inactive — driver GPS not currently sending location.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-64 text-sm text-muted-foreground text-center space-y-2 px-4">
                <div>Bus inactive. No live coordinates available.</div>
                <div className="text-xs text-muted-foreground max-w-md">
                  The Render free tier does not support persistent WebSocket connections,
                  so real-time map updates are limited; this will be resolved by migrating
                  to a better hosting platform.
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="hover-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-secondary" />
                Map View — {routeName}
              </CardTitle>
              <CardDescription>
                Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {busLocation ? (
                <MapContainer
                  center={[busLocation.lat, busLocation.lon]}
                  zoom={14}
                  style={{ height: "400px", width: "100%" }}
                >
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
                <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
                  Waiting for coordinates...
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
