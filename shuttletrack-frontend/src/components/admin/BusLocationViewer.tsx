import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, MapPin, Navigation } from "lucide-react";
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

  // null = no bus selected | false = inactive | true = active
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const pollRef = useRef<number | null>(null);
  const POLL_INTERVAL_MS = 5000;

  // Load buses
  useEffect(() => {
    api
      .get<Bus[]>("/buses")
      .then((res) => setBuses(Array.isArray(res.data) ? res.data : []))
      .catch(() => setBuses([]));
  }, []);

  async function fetchLocation(busId: string) {
    try {
      const res = await api.get(`/buses/${busId}/location`);
      const d = res.data ?? {};

      const lat = d.latitude ?? null;
      const lon = d.longitude ?? null;

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
        setBusLocation(null);
        setIsActive(false);
      }
    } catch {
      setBusLocation(null);
      setIsActive(false);
    }
  }

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

    api
      .get(`/buses/${selectedBus}`)
      .then((res) => {
        const s = res.data?.stops ?? [];
        setStops(
          s.map((x: any, i: number) => ({
            id: x.id ?? i,
            name: x.name ?? `Stop ${i + 1}`,
          }))
        );
      })
      .catch(() => setStops([]));

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
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Track Any Bus</h1>
            <p className="text-muted-foreground">
              View live bus status & location
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Bus</CardTitle>
            <CardDescription>Choose a bus to track</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedBus} onValueChange={setSelectedBus}>
              <SelectTrigger>
                <SelectValue placeholder="Select a bus" />
              </SelectTrigger>
              <SelectContent>
                {buses.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>
                    {b.name ?? `Bus ${b.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {isActive === null ? (
          <div className="text-center text-muted-foreground">
            Please select a bus.
          </div>
        ) : isActive === false ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <MapPin className="h-5 w-5" />
                Live Location
              </CardTitle>
              <CardDescription>
                Bus inactive — GPS not sending data.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
              No live coordinates available.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <Navigation className="h-5 w-5" />
                Map View — {routeName}
              </CardTitle>
              <CardDescription>
                Last updated:{" "}
                {lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {busLocation ? (
                <MapContainer
                  center={[busLocation.lat, busLocation.lon]}
                  zoom={14}
                  style={{ height: 400 }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker
                    position={[busLocation.lat, busLocation.lon]}
                    icon={busIcon}
                  >
                    <Popup>
                      <b>{routeName}</b>
                      <br />
                      {busLocation.currentStop ?? "—"} →{" "}
                      {busLocation.nextStop ?? "—"}
                    </Popup>
                  </Marker>
                  <Recenter
                    lat={busLocation.lat}
                    lon={busLocation.lon}
                  />
                </MapContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Waiting for location…
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
