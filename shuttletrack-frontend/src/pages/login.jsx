import React, { useState } from "react";
import api from "../services/api";

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { username, password, role });
      const token = res.data.access_token;
      localStorage.setItem("access_token", token);

      // decode token
      const payload = JSON.parse(atob(token.split(".")[1]));
      localStorage.setItem("role", payload.role);
      localStorage.setItem("user_id", payload.user_id);

      onLoginSuccess && onLoginSuccess();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
      <select value={role} onChange={e=>setRole(e.target.value)}>
        <option value="student">Student</option>
        <option value="driver">Driver</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit">Login</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}
