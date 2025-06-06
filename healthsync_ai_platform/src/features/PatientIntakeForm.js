import React, { useState } from "react";
import { useSupabase } from "../SupabaseContext";

/**
 * This component collects intake info from a patient and stores it securely in Supabase,
 * associating it with the logged-in user's UUID from Supabase Auth.
 * For now, "gender" and "phone" are skipped for simplicity and not handled in this basic UI.
 */

// PUBLIC_INTERFACE
export default function PatientIntakeForm() {
  const { supabase, session } = useSupabase();
  const [form, setForm] = useState({
    name: "",
    dob: "",
    insurance: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // PUBLIC_INTERFACE
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.name || !form.dob) return;

    setSubmitting(true);
    setError(null);

    try {
      // Get the logged-in user id from Supabase (should be their UUID)
      const user = session?.user;
      if (!user?.id) {
        setError("You must be signed in to submit the intake form.");
        setSubmitting(false);
        return;
      }

      // Insert into 'patients' table.
      // The required columns are: user_id (uuid), date_of_birth (date), insurance_provider (nullable), name (users table, but we store in patients here), others skipped for simplicity.
      // Note: "gender", "phone" are omitted here for brevity.
      const { error: insertError } = await supabase
        .from("patients")
        .insert([{
          user_id: user.id,
          date_of_birth: form.dob,
          insurance_provider: form.insurance,
        }]);

      if (insertError) {
        setError(insertError.message || "Failed to save intake information.");
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-secondary p-4 rounded shadow text-center">
        <p className="font-semibold text-primary mb-2">Intake complete. Continue to AI triage.</p>
      </div>
    );
  }

  return (
    <form className="bg-secondary p-4 rounded shadow max-w-md mx-auto mt-8" onSubmit={handleSubmit} aria-label="Patient Intake Form">
      <h2 className="text-lg font-bold mb-2 text-primary">Patient Intake Form</h2>
      <div className="mb-2">
        <label className="block text-sm mb-1 font-medium">Full Name</label>
        <input className="w-full border p-2 rounded" name="name" value={form.name} onChange={handleInput} required />
      </div>
      <div className="mb-2">
        <label className="block text-sm mb-1 font-medium">Date of Birth</label>
        <input className="w-full border p-2 rounded" name="dob" type="date" value={form.dob} onChange={handleInput} required />
      </div>
      <div className="mb-2">
        <label className="block text-sm mb-1 font-medium">Insurance Info</label>
        <input className="w-full border p-2 rounded" name="insurance" value={form.insurance} onChange={handleInput} />
      </div>
      <button className="btn btn-large mt-3 w-full" disabled={submitting}>{submitting ? "Submitting..." : "Submit"}</button>
      {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
    </form>
  );
}
