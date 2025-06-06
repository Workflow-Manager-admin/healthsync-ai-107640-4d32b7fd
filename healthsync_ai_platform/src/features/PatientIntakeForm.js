import React, { useState } from "react";
import { useSupabase } from "../SupabaseContext";

// PUBLIC_INTERFACE
export default function PatientIntakeForm() {
  const [form, setForm] = useState({
    name: "",
    dob: "",
    insurance: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // PUBLIC_INTERFACE
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Placeholder: Save to Supabase later
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1000);
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
    </form>
  );
}
