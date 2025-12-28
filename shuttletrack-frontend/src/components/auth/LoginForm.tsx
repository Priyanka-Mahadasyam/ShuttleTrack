// // src/components/auth/LoginForm.tsx
// import React, { useState } from "react";
// import api from "../../api";
// import { TOKEN_KEY, USER_KEY } from "../../constants";

// type Props = {
//   role?: "student" | "admin" | "driver";
//   onLoginSuccess: () => void; // App will read token+user from localStorage
// };

// export default function LoginForm({ role, onLoginSuccess }: Props) {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);

//     try {
//       // Adjust body fields to match your backend (username or email)
//       const resp = await api.post("/auth/login", {
//         username,
//         password,
//       });

//       const data = resp.data;

//       // Common fastapi-jwt scheme: { access_token: "...", token_type: "bearer" }
//       // If your backend returns different keys, adapt here.
//       const token = data.access_token ?? data.token ?? data.accessToken ?? "";
//       if (!token) {
//         throw new Error("No token returned by server");
//       }

//       // Try to collect user metadata from the response (if provided)
//       const userMeta =
//         data.user ??
//         (data.user_info ? data.user_info : undefined) ??
//         (data.username ? { username: data.username, role: data.role } : undefined) ??
//         (role ? { username, role } : { username });

//       // persist token & user meta
//       localStorage.setItem(TOKEN_KEY, token);
//       if (userMeta) localStorage.setItem(USER_KEY, JSON.stringify(userMeta));

//       // call parent to let it update its UI/state (App reads localStorage)
//       onLoginSuccess();
//     } catch (err: any) {
//       console.error("Login failed:", err);
//       if (err.response && err.response.data) {
//         setError(err.response.data.detail ?? err.response.data.message ?? JSON.stringify(err.response.data));
//       } else {
//         setError(err.message ?? "Login failed");
//       }
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
//       <h2 className="text-xl mb-4">Login {role ? `as ${role}` : ""}</h2>

//       {error && <div className="text-red-400 mb-2">{error}</div>}

//       <div className="mb-3">
//         <label className="block text-sm">Username / Email</label>
//         <input
//           className="input"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           autoComplete="username"
//           required
//         />
//       </div>

//       <div className="mb-3">
//         <label className="block text-sm">Password</label>
//         <input
//           className="input"
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           autoComplete="current-password"
//           required
//         />
//       </div>

//       <div className="flex gap-2 items-center">
//         <button type="submit" disabled={loading} className="btn btn-primary">
//           {loading ? "Logging in…" : "Login"}
//         </button>
//       </div>
//     </form>
//   );
// }
