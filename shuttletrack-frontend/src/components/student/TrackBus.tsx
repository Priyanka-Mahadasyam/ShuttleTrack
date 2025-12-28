// src/components/student/TrackBus.tsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { ArrowLeft, MapPin, Clock, Navigation } from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import api from "../../services/api";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61205.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function Recenter({
  lat,
  lon,
}: {
  lat?: number | null;
  lon?: number | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (typeof lat === "number" && typeof lon === "number") {
      map.setView([lat, lon], map.getZoom());
      map.invalidateSize();
    }
  }, [lat, lon, map]);
  return null;
}

type Bus = { id: number; name?: string };
type Stop = { id: number | string; name: string };

export default function TrackBus({ onBack }: { onBack: () => void }) {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBus, setSelectedBus] = useState<string>("");
  const [stops, setStops] = useState<Stop[]>([]);
  const [selectedStop, setSelectedStop] = useState<string>("");

  const [busLocation, setBusLocation] = useState<any | null>(null);
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const pollRef = useRef<number | null>(null);
  const POLL_INTERVAL_MS = 5000;

  // Load buses
  useEffect(() => {
    api
      .get<Bus[]>("/buses")
      .then((r) => setBuses(r.data ?? []))
      .catch(() => setBuses([]));
  }, []);

  // Fetch latest location (REST)
  async function fetchLocation(busId: string) {
    try {
      const res = await api.get(`/buses/${busId}/location`);
      const d = res.data ?? {};

      const lat = d.latitude ?? d.lat ?? null;
      const lon = d.longitude ?? d.lon ?? null;

      if (lat != null && lon != null) {
        setBusLocation({
          lat: Number(lat),
          lon: Number(lon),
          currentStop: d.current_stop ?? null,
          nextStop: d.next_stop ?? null,
          eta: d.eta ?? null,
        });
        setIsActive(true);
        setLastUpdated(new Date());
      } else {
        setIsActive(false);
      }
    } catch {
      setIsActive(false);
    }
  }

  // When bus changes
  useEffect(() => {
    if (!selectedBus) {
      setStops([]);
      setBusLocation(null);
      setIsActive(null);
      setLastUpdated(null);
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    setIsActive(false);

    // Fetch stops
    api
      .get(`/buses/${selectedBus}`)
      .then((r) => {
        const s =
          r.data?.stops ??
          r.data?.route?.stops ??
          [];
        setStops(
          s.map((x: any, i: number) => ({
            id: x.id ?? i,
            name: x.name ?? `Stop ${i + 1}`,
          }))
        );
      })
      .catch(() => setStops([]));

    // Initial fetch + polling
    fetchLocation(selectedBus);
    pollRef.current = window.setInterval(
      () => fetchLocation(selectedBus),
      POLL_INTERVAL_MS
    );

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selectedBus]);

  const routeName = useMemo(
    () => buses.find((b) => String(b.id) === selectedBus)?.name ?? "",
    [buses, selectedBus]
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Select Bus</CardTitle>
            <CardDescription>Choose bus and stop</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Select value={selectedBus} onValueChange={setSelectedBus}>
              <SelectTrigger>
                <SelectValue placeholder="Select Bus" />
              </SelectTrigger>
              <SelectContent>
                {buses.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>
                    {b.name ?? `Bus ${b.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedStop}
              onValueChange={setSelectedStop}
              disabled={!stops.length}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Stop" />
              </SelectTrigger>
              <SelectContent>
                {stops.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" /> Live Location
            </CardTitle>
            <CardDescription>
              Last updated: {lastUpdated?.toLocaleTimeString() ?? "—"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isActive === null ? (
              <p>Select a bus to view tracking.</p>
            ) : isActive === false ? (
              <p>Bus inactive. No GPS data.</p>
            ) : busLocation ? (
              <MapContainer
                center={[busLocation.lat, busLocation.lon]}
                zoom={14}
                style={{ height: "400px", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker
                  position={[busLocation.lat, busLocation.lon]}
                  icon={busIcon}
                >
                  <Popup>
                    <b>{routeName}</b>
                    <br />
                    {busLocation.currentStop} → {busLocation.nextStop}
                  </Popup>
                </Marker>
                <Recenter
                  lat={busLocation.lat}
                  lon={busLocation.lon}
                />
              </MapContainer>
            ) : (
              <p>Waiting for coordinates…</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
