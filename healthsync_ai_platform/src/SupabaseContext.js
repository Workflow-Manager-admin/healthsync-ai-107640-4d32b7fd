import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

/**
 * Roles: 'patient', 'provider', 'admin'
 */
const SupabaseContext = createContext(null);

// PUBLIC_INTERFACE
export function useSupabase() {
  return useContext(SupabaseContext);
}

// PUBLIC_INTERFACE
export function SupabaseProvider({ children }) {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const initialSession = supabase.auth.session ? supabase.auth.session : supabase.auth.getSession();
    setSession(initialSession);
    supabase.auth.onAuthStateChange((_e, sess) => {
      setSession(sess);
      // You would fetch actual user role from DB/profile here
      // For scaffold, default to null; implement logic as needed
      setRole(sess?.user?.role || null);
    });
  }, []);

  // Helper: is authenticated, current role
  const value = {
    supabase,
    session,
    role,
    setRole,
    signOut: () => supabase.auth.signOut()
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}
