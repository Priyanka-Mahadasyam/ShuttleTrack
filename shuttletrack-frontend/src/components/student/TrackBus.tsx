// src/components/student/TrackBus.tsx
import React, { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import api from "../../services/api";
import { useBusLocation } from "../../hooks/useBusLocation";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61205.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

type Bus = { id: number; name?: string };

export default function TrackBus(): JSX.Element {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBus, setSelectedBus] = useState<string>("");

  const location = useBusLocation(selectedBus);

  useEffect(() => {
    api.get<Bus[]>("/buses")
      .then((r) => setBuses(Array.isArray(r.data) ? r.data : []))
      .catch(() => setBuses([]));
  }, []);

  const routeName = useMemo(
    () => buses.find((b) => String(b.id) === String(selectedBus))?.name ?? "",
    [buses, selectedBus]
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Track My Bus</h1>

        <Card>
          <CardHeader>
            <CardTitle>Select Bus</CardTitle>
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

        {!location ? (
          <Card>
            <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
              <MapPin className="mr-2" /> No live location available
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{routeName}</CardTitle>
            </CardHeader>
            <CardContent>
              <MapContainer
                center={[location.latitude, location.longitude]}
                zoom={14}
                style={{ height: "400px", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker
                  position={[location.latitude, location.longitude]}
                  icon={busIcon}
                >
                  <Popup>
                    {location.current_stop ?? "—"} →{" "}
                    {location.next_stop ?? "—"}
                  </Popup>
                </Marker>
              </MapContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
