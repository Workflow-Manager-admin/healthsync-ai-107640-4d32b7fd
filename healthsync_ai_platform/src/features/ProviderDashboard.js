import React, { useEffect, useState } from "react";
import { useSupabase } from "../SupabaseContext";

// PUBLIC_INTERFACE
export default function ProviderDashboard() {
  const { supabase, session } = useSupabase();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    // Only run if logged in as provider
    const fetchCases = async () => {
      setLoading(true);
      setErr(null);
      setCases([]);
      try {
        const user = session?.user;
        if (!user?.id) {
          setErr("You must be signed in as a provider.");
          setLoading(false);
          return;
        }

        // 1. Lookup provider id for this user
        const { data: providerRows, error: provErr } = await supabase
          .from("providers")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (provErr) {
          setErr("Failed to look up provider profile: " + provErr.message);
          setLoading(false);
          return;
        }
        if (!providerRows) {
          setErr("This account is not registered as a provider.");
          setLoading(false);
          return;
        }
        const providerId = providerRows.id;

        // 2. Fetch cases assigned to provider, including patient (and patient's user name)
        // SQL equivalent:
        // SELECT c.id, c.symptom_summary, c.status, p.id AS patient_id, u.name AS patient_name
        // FROM cases c
        // JOIN patients p ON c.patient_id = p.id
        // JOIN users u ON p.user_id = u.id
        // WHERE c.provider_id = providerId

        // Supabase: join patient -> users subquery
        // "patient:patients(user_id, id, users(name))"
        const { data: casesRows, error: casesErr } = await supabase
          .from("cases")
          .select(`
            id,
            symptom_summary,
            status,
            patient:patients (
              id,
              user_id,
              users (
                name
              )
            )
          `)
          .eq("provider_id", providerId)
          .order("created_at", { ascending: false });

        if (casesErr) {
          setErr("Failed to fetch cases: " + casesErr.message);
          setLoading(false);
          return;
        }

        setCases(
          (casesRows || []).map((c) => ({
            id: c.id,
            symptom_summary: c.symptom_summary,
            status: c.status,
            patient_name: c.patient?.users?.name || "[Unknown]",
          }))
        );
      } catch (e) {
        setErr(e.message || "Unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
    // Only rerun if session changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <div className="bg-secondary p-5 my-8 rounded-md shadow max-w-2xl mx-auto">
      <h2 className="text-lg font-bold mb-2 text-primary">Provider Dashboard</h2>
      {loading && <div className="text-gray-600">Loading cases...</div>}
      {err && (
        <div className="mb-2 text-red-600 font-medium">{err}</div>
      )}
      {!loading && !err && (
        <>
          {cases.length === 0 ? (
            <div className="text-gray-600 mt-6">
              No cases assigned to you yet.
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {cases.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded shadow p-4 flex flex-col gap-1"
                  style={{ borderLeft: "6px solid var(--primary, #249eeb)" }}
                >
                  <div className="font-semibold text-lg text-primary">
                    Patient: {c.patient_name}
                  </div>
                  <div>
                    <span className="font-medium">Summary:</span>{" "}
                    <span>{c.symptom_summary}</span>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{" "}
                    <span className="uppercase text-xs px-2 py-0.5 rounded bg-gray-200">{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
