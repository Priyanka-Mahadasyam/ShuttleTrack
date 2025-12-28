// src/components/auth/RegisterForm.tsx
import React, { useState } from "react";
import api from "../../api";

export default function RegisterForm({ onRegistered }: { onRegistered?: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "driver" | "admin">("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const resp = await api.post("/auth/register", { username, password, role });
      setSuccess("Registered successfully");
      onRegistered?.();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail ?? err.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h2 className="text-xl mb-4">Register</h2>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      {success && <div className="text-green-400 mb-2">{success}</div>}
      <label className="block">Username</label>
      <input value={username} onChange={(e) => setUsername(e.target.value)} className="input mb-2" required />
      <label className="block">Password</label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input mb-2" required />
      <label className="block">Role</label>
      <select value={role} onChange={(e) => setRole(e.target.value as any)} className="input mb-4">
        <option value="student">Student</option>
        <option value="driver">Driver</option>
        <option value="admin">Admin</option>
      </select>
      <div>
        <button type="submit" disabled={loading} className="btn btn-primary">{loading ? "Registering…" : "Register"}</button>
      </div>
    </form>
  );
}
