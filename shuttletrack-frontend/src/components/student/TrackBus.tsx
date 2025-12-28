// src/components/student/TrackBus.tsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { ArrowLeft, MapPin, Clock, Navigation } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import api from "../../services/api";
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
      map.setView([lat, lon], map.getZoom());
      map.invalidateSize();
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
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const pollRef = useRef<number | null>(null);
  const POLL_INTERVAL_MS = 5000;

  // Load buses
  useEffect(() => {
    api.get("/buses")
      .then((r) => setBuses(r.data ?? []))
      .catch(() => setBuses([]));
  }, []);

  // Fetch location
  async function fetchLocation(busId: string) {
    try {
      const res = await api.get(`/buses/${busId}/location`);
      const d = res.data ?? {};
      if (d.latitude != null && d.longitude != null) {
        setBusLocation({
          lat: d.latitude,
          lon: d.longitude,
          currentStop: d.current_stop ?? null,
          nextStop: d.next_stop ?? null,
          eta: d.eta ?? null,
        });
        setLastUpdated(new Date(d.timestamp ?? Date.now()));
        setIsActive(true);
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
      setBusLocation(null);
      setIsActive(null);
      setLastUpdated(null);
      clearInterval(pollRef.current!);
      return;
    }

    api.get(`/buses/${selectedBus}`)
      .then((r) => setStops(r.data?.stops ?? []))
      .catch(() => setStops([]));

    fetchLocation(selectedBus);

    pollRef.current = window.setInterval(
      () => fetchLocation(selectedBus),
      POLL_INTERVAL_MS
    );

    return () => clearInterval(pollRef.current!);
  }, [selectedBus]);

  const routeName = useMemo(
    () => buses.find((b) => String(b.id) === selectedBus)?.name ?? "",
    [buses, selectedBus]
  );

  return (
    <div className="min-h-screen p-4">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Select Bus</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Live Location</CardTitle>
          <CardDescription>
            Last updated: {lastUpdated?.toLocaleTimeString() ?? "—"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isActive && busLocation ? (
            <MapContainer
              center={[busLocation.lat, busLocation.lon]}
              zoom={14}
              style={{ height: "400px" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[busLocation.lat, busLocation.lon]} icon={busIcon}>
                <Popup>{routeName}</Popup>
              </Marker>
              <Recenter lat={busLocation.lat} lon={busLocation.lon} />
            </MapContainer>
          ) : (
            <div className="text-center text-muted-foreground h-64 flex items-center justify-center">
              Bus inactive or no location available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}