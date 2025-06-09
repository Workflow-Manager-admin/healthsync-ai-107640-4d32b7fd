import React, { useState } from "react";
import { fetchGeminiResponse } from "../utils/geminiApi";

// PUBLIC_INTERFACE
export default function AITriage() {
  const [symptoms, setSymptoms] = useState("");
  const [triageResult, setTriageResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // PUBLIC_INTERFACE
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTriageResult(null);
    setErr(null);
    try {
      // Prompt design: short role/intent hint for best Gemini output
      const prompt = `Patient describes the following symptoms: ${symptoms}
As a healthcare AI assistant, provide a triage recommendation with possible severity and clear next steps. Reply concisely.`;
      const reply = await fetchGeminiResponse(prompt);
      setTriageResult(reply);
    } catch (e) {
      setErr(e.message || "Unknown error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-secondary p-5 my-8 rounded-md shadow max-w-lg mx-auto">
      <h2 className="text-lg font-bold mb-2 text-primary">AI Symptom Triage</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2 font-medium">
          Describe symptoms
          <textarea
            className="w-full border rounded p-2 mt-1 mb-2"
            rows={3}
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            required
            aria-label="Describe symptoms"
            placeholder="E.g., I have a sore throat and fever for 3 days..."
          />
        </label>
        <button className="btn btn-large w-full" disabled={loading || !symptoms.trim()}>
          {loading ? "Analyzing..." : "Analyze Symptoms"}
        </button>
      </form>
      {err && (
        <div className="mt-2 text-red-600 text-sm">{err}</div>
      )}
      {triageResult && (
        <div className="mt-4 p-3 border rounded bg-white text-black">
          <strong>Triage result:</strong>
          <div className="mt-1 whitespace-pre-line">{triageResult}</div>
        </div>
      )}
    </div>
  );
}
