// src/App.jsx
import { useState, useEffect } from "react";
import { Toaster } from "./components/ui/sonner";
import { Header } from "./components/layout/Header";
import { WelcomePage } from "./components/auth/WelcomePage";
import LoginForm from "./components/auth/LoginForm";
import { RoleSelection } from "./components/auth/RoleSelection";
import { StudentDashboard } from "./components/student/StudentDashboard";
import { Feedback } from "./components/student/Feedback";
import { ViewRoutes as StudentViewRoutes } from "./components/student/ViewRoutes";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { DriverDashboard } from "./components/driver/DriverDashboard";
import { About } from "./components/pages/About";
import { Contact } from "./components/pages/Contact";
import { Button } from "./components/ui/button";
import { Bus, Users, Phone, Info, Home } from "lucide-react";
import TrackBus from "./components/student/TrackBus"
import { getToken, getUser, clearAuth } from "./utils/auth";

/**
 * AppState: "welcome" | "role-selection" | "login" | "student" | "admin" | "driver" | "about" | "contact"
 */
export default function App() {
  const [currentState, setCurrentState] = useState("welcome");
  const [currentUser, setCurrentUser] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [studentView, setStudentView] = useState("dashboard");

  // apply dark theme once
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // helpers: decode JWT (base64url) and normalize role
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
      const json = atob(base64UrlToBase64(parts[1]));
      return JSON.parse(json);
    } catch {
      return null;
    }
  }
  function normalizeRoleToState(role) {
    if (typeof role !== "string") return null;
    const r = role.toLowerCase().trim();
    if (r === "student" || r === "admin" || r === "driver") return r;
    return null;
  }

  // Auto-login from sessionStorage token if valid
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    const payload = decodeJwt(token);
    if (!payload) {
      clearAuth();
      return;
    }
    // optional expiry check
    if (typeof payload.exp === "number") {
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        clearAuth();
        return;
      }
    }
    const roleState = normalizeRoleToState(payload.role) || selectedRole || "student";
    const username = payload.sub ?? payload.username ?? (getUser()?.username ?? "");
    setCurrentUser(username);
    setCurrentRole(roleState);
    setCurrentState(roleState);
    if (roleState === "student") setStudentView("dashboard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProceedToLogin = () => setCurrentState("role-selection");
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setCurrentState("login");
  };
  const handleBackToRoleSelection = () => setCurrentState("role-selection");
  const handleBackToWelcome = () => setCurrentState("welcome");
  const handleBackToUserHome = () => {
    if (currentRole) {
      setCurrentState(currentRole);
      if (currentRole === "student") setStudentView("dashboard");
    }
  };

  // **MAIN**: called by LoginForm after successful login.
  // It reads token from sessionStorage and updates UI
  const handleAfterLogin = (resolvedRole) => {
    const token = getToken();
    if (!token) return;
    const payload = decodeJwt(token);

    const roleFromToken = normalizeRoleToState(payload?.role);
    const role = normalizeRoleToState(resolvedRole) ?? roleFromToken ?? normalizeRoleToState(selectedRole) ?? "student";

    const username =
      (payload?.sub ?? payload?.username) || (getUser()?.username) || "";

    setCurrentUser(username || "");
    setCurrentRole(role);
    setCurrentState(role);
    if (role === "student") setStudentView("dashboard");
  };

  const handleLogout = () => {
    clearAuth();
    setCurrentUser("");
    setCurrentRole("");
    setSelectedRole("");
    setCurrentState("welcome");
    setStudentView("dashboard");
  };

  const renderNavigation = () => {
    if (currentState === "welcome" || currentState === "role-selection" || currentState === "login") {
      return (
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setCurrentState("about")} className="hover-glow bg-card/80 backdrop-blur-sm">
            <Info className="h-4 w-4 mr-2" />
            About
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCurrentState("contact")} className="hover-glow bg-card/80 backdrop-blur-sm">
            <Phone className="h-4 w-4 mr-2" />
            Contact
          </Button>
        </div>
      );
    }

    if (currentState === "about" || currentState === "contact") {
      return (
        <div className="fixed top-4 left-4 z-50">
          <Button variant="ghost" size="sm" onClick={currentUser ? handleBackToUserHome : () => setCurrentState("welcome")} className="hover-glow bg-card/80 backdrop-blur-sm">
            {currentUser ? (
              <>
                <Home className="h-4 w-4 mr-2" />
                Back to {currentRole} Dashboard
              </>
            ) : (
              <>
                <Bus className="h-4 w-4 mr-2" />
                Back to ShuttleTrack
              </>
            )}
          </Button>
        </div>
      );
    }
    return null;
  };

  const renderStudentNavigation = () => {
    if (currentState === "student" && studentView !== "dashboard") return null;
    if (currentState === "student") {
      return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-card/80 backdrop-blur-sm border border-border rounded-full p-2">
          <div className="flex gap-2">
            <Button variant={studentView === "dashboard" ? "default" : "ghost"} size="sm" onClick={() => setStudentView("dashboard")} className="rounded-full">
              <Users className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setCurrentState("contact")} className="rounded-full">
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }

    if (currentState === "admin") {
      return (
        <div className="fixed bottom-4 right-4 z-50">
          <Button variant="ghost" size="sm" onClick={() => setCurrentState("contact")} className="hover-glow bg-card/80 backdrop-blur-sm rounded-full">
            <Phone className="h-4 w-4" />
          </Button>
        </div>
      );
    }
    return null;
  };

  const renderContent = () => {
    switch (currentState) {
      case "welcome":
        return <WelcomePage onProceedToLogin={handleProceedToLogin} />;
      case "role-selection":
        return <RoleSelection onRoleSelect={handleRoleSelect} onBack={handleBackToWelcome} />;
      case "login":
        return (
          <LoginForm
            role={selectedRole}
            onLoginSuccess={handleAfterLogin}
            onBack={handleBackToRoleSelection}
          />
        );
      case "student":
        switch (studentView) {
          case "dashboard":
            return (
              <StudentDashboard
                onTrackBus={() => setStudentView("track-bus")}
                onFeedback={() => setStudentView("feedback")}
                onViewRoutes={() => setStudentView("view-routes")}
              />
            );
          case "track-bus":
            return <TrackBus onBack={() => setStudentView("dashboard")} />;
          case "feedback":
            return <Feedback onBack={() => setStudentView("dashboard")} />;
          case "view-routes":
            return <StudentViewRoutes onBack={() => setStudentView("dashboard")} />;
          default:
            return (
              <StudentDashboard
                onTrackBus={() => setStudentView("track-bus")}
                onFeedback={() => setStudentView("feedback")}
                onViewRoutes={() => setStudentView("view-routes")}
              />
            );
        }
      case "admin":
        return <AdminDashboard />;
      case "driver":
        return <DriverDashboard />;
      case "about":
        return <About />;
      case "contact":
        return <Contact />;
      default:
        return <WelcomePage onProceedToLogin={handleProceedToLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {currentUser && !["about", "contact"].includes(currentState) && (
        <Header currentUser={currentUser} currentRole={currentRole} onLogout={handleLogout} showMenu={currentRole === "admin"} />
      )}

      {renderNavigation()}
      {renderStudentNavigation()}

      <main className={currentUser && !["about", "contact"].includes(currentState) ? "pt-0" : ""}>{renderContent()}</main>

      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          },
        }}
      />
    </div>
  );
}
