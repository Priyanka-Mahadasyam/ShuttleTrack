// src/components/admin/BusLocationViewer.tsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useBusLocation } from "../../hooks/useBusLocation";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61205.png",
  iconSize: [30, 30],
});

type Bus = {
  id: number;
  name: string;
};

export default function BusLocationViewer() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [busId, setBusId] = useState<number | null>(null);

  const location = useBusLocation(busId ?? undefined);

  useEffect(() => {
    api.get("/buses")
      .then((res) => setBuses(res.data))
      .catch(() => setBuses([]));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin – Bus Location Viewer</h2>

      <select
        value={busId ?? ""}
        onChange={(e) => setBusId(Number(e.target.value))}
      >
        <option value="">Select Bus</option>
        {buses.map((bus) => (
          <option key={bus.id} value={bus.id}>
            {bus.name}
          </option>
        ))}
      </select>

      {location && (
        <MapContainer
          center={[location.latitude, location.longitude]}
          zoom={14}
          style={{ height: "400px", marginTop: 20 }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker
            position={[location.latitude, location.longitude]}
            icon={busIcon}
          >
            <Popup>Bus Location</Popup>
          </Marker>
        </MapContainer>
      )}

      {!location && busId && (
        <p style={{ marginTop: 20 }}>Bus not sending location</p>
      )}
    </div>
  );
}
