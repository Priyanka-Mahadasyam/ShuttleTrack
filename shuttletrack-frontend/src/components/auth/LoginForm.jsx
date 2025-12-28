// src/components/auth/LoginForm.jsx
import { useState } from "react";
import api from "../../services/api";
import { saveAuth } from "../../utils/auth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Bus, Mail, Lock, ArrowLeft, GraduationCap, Settings, Truck } from "lucide-react";

/**
 * Simple login component:
 *  - POST /auth/login with { username, password, role }
 *  - saves token to sessionStorage via saveAuth()
 *  - decodes token to extract user meta and saves via helper
 *  - calls onLoginSuccess() to let parent navigate
 */

function base64UrlToBase64(input) {
  let b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad === 2) b64 += "==";
  else if (pad === 3) b64 += "=";
  else if (pad === 1) b64 += "===";
  return b64;
}
function decodeJwt(token) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payloadB64 = base64UrlToBase64(parts[1]);
    const json = atob(payloadB64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function LoginForm({ role, onLoginSuccess, onBack }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const body = {
        username: usernameOrEmail,
        password,
        role: role ?? "student",
      };

      const resp = await api.post("/auth/login", body);
      const data = resp?.data ?? {};

      const token = data.access_token ?? data.token ?? data.accessToken;
      if (!token) throw new Error("No token returned by server");

      // decode token to build userMeta
      const payload = decodeJwt(token) || {};
      const username = payload.sub ?? payload.username ?? usernameOrEmail;
      const userMeta = {
        username,
        role: payload.role ?? role ?? "student",
        user_id: payload.user_id ?? null,
      };

      // Save token + user meta per-tab (sessionStorage)
      saveAuth(token, userMeta);

      // notify parent to update UI / navigate
      if (typeof onLoginSuccess === "function") onLoginSuccess();
    } catch (err) {
      console.error("Login error", err);
      const msg =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        err?.message ??
        "Login failed";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary p-4 rounded-2xl">
              <Bus className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">ShuttleTrack</h1>
            <p className="text-muted-foreground">Real-Time Campus Shuttle Tracking</p>
          </div>
        </div>

        <Card className="hover-glow">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-3 mb-4">
              <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                {role === "student" && <GraduationCap className="h-5 w-5 text-primary" />}
                {role === "admin" && <Settings className="h-5 w-5 text-secondary" />}
                {role === "driver" && <Truck className="h-5 w-5 text-accent" />}
                <span className="font-medium capitalize">{role ?? "student"} Login</span>
              </div>
            </div>
            <CardTitle className="text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">Sign in as {role ?? "student"} to access ShuttleTrack</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="text-sm text-red-500">{error}</div>}

              <div className="space-y-2">
                <Label htmlFor="username">Username or Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    className="pl-10"
                    placeholder="admin or student1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full hover-glow" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">Need help? Contact your transport admin</p>
        </div>
      </div>
    </div>
  );
}

export { LoginForm };
export default LoginForm;
