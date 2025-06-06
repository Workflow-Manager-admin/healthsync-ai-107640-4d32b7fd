import React, { useState } from "react";
import { useSupabase } from "../SupabaseContext";

const roles = [
  { value: "patient", label: "Patient" },
  { value: "provider", label: "Provider" },
  { value: "admin", label: "Admin" }
];

// PUBLIC_INTERFACE
export default function RoleAuth() {
  const { session, setRole, role, supabase } = useSupabase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("patient");
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setRole(e.target.value);
  };

  // PUBLIC_INTERFACE
  const handleSignIn = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    // Placeholder: integrate with Supabase Auth signIn
    await new Promise((res) => setTimeout(res, 600));
    setRole(selectedRole);
    setLoading(false);
  };

  if (session) {
    return (
      <div className="bg-secondary p-4 my-8 rounded shadow max-w-xs mx-auto text-center">
        <p className="mb-2">Logged in as <span className="font-semibold">{role}</span></p>
        <button className="btn w-full" onClick={() => { setRole(null); supabase.auth.signOut(); }}>Sign Out</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSignIn} className="bg-secondary p-4 my-8 rounded shadow max-w-xs mx-auto" aria-label="Login Form">
      <h2 className="text-lg font-bold mb-2 text-primary">Sign In</h2>
      <div className="mb-2">
        <label className="block text-sm">Role</label>
        <select className="w-full p-2 rounded border" value={selectedRole} onChange={handleRoleChange}>
          {roles.map(r => (<option key={r.value} value={r.value}>{r.label}</option>))}
        </select>
      </div>
      <div className="mb-2">
        <label className="block text-sm">Email</label>
        <input className="w-full p-2 rounded border" required type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" />
      </div>
      <div className="mb-2">
        <label className="block text-sm">Password</label>
        <input className="w-full p-2 rounded border" required type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
      </div>
      <button className="btn btn-large w-full mt-3" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</button>
    </form>
  );
}
