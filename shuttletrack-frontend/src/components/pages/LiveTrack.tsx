// src/components/LiveTrack.tsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import api from "../../services/api";
import { createWs } from "../../services/ws";
import type { Bus } from "../../types";
import "leaflet/dist/leaflet.css";

const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61205.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function LiveTrack() {
  const [buses, setBuses] = useState<Bus[]>([]);

  useEffect(() => {
    let mounted = true;
    api.get<Bus[]>("/buses")
      .then(res => { if (!mounted) return; setBuses(res.data ?? []); })
      .catch(err => console.error("Failed to fetch buses", err));

    const ws = createWs((msg) => {
      if (msg?.type === "location_update") {
        setBuses(prev => {
          // if bus exists update it; otherwise ignore (or add if you prefer)
          return prev.map(b =>
            String(b.id) === String(msg.bus_id) ? { ...b, current_lat: msg.lat ?? msg.current_lat, current_lon: msg.lon ?? msg.current_lon, last_seen: msg.last_seen ?? b.last_seen } : b
          );
        });
      }
    });

    return () => {
      mounted = false;
      try { ws.close(); } catch {}
    };
  }, []);

  // filter out any buses without coordinates
  const visible = buses.filter(b => b.current_lat != null && b.current_lon != null);

  return (
    <div className="h-screen w-full">
      <MapContainer center={visible.length ? [visible[0].current_lat!, visible[0].current_lon!] : [12.9716, 77.5946]} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
        {visible.map(bus => (
          <Marker key={bus.id} position={[bus.current_lat!, bus.current_lon!]} icon={busIcon}>
            <Popup><b>{bus.name}</b><br/>Route: {bus.route_id}<br/>Last seen: {bus.last_seen}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
