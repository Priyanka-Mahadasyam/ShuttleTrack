import React, { useEffect, useState } from "react";
import api from "../services/api";
import { createWs } from "../services/ws";

export default function TrackTest() {
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    api.get("/buses").then(res => setBuses(res.data)).catch(console.error);

    const ws = createWs((msg) => {
      if (msg.type === "location_update") {
        setBuses(prev =>
          prev.map(b =>
            b.id === msg.bus_id ? { ...b, current_lat: msg.lat, current_lon: msg.lon } : b
          )
        );
      }
    });

    return () => ws.close();
  }, []);

  return (
    <div>
      <h2>Bus Live Feed</h2>
      <ul>
        {buses.map(b => (
          <li key={b.id}>
            {b.name} → lat: {b.current_lat ?? "N/A"}, lon: {b.current_lon ?? "N/A"}
          </li>
        ))}
      </ul>
    </div>
  );
}
