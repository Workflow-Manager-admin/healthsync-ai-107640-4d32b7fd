//// Gemini API Utility Module
// Handles secure requests to Google's Gemini API with provided API key from environment variables.
// All API calls are made through this module.

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

/**
 * Throws if Gemini API key is missing.
 */
function enforceKey() {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key not set in environment variables.");
  }
}

/**
 * PUBLIC_INTERFACE
 * Sends a prompt/messages to Gemini for completion (symptom triage or chat).
 * @param {string|string[]} messages - The prompt or chat history (as strings for plain, or objects for advanced use)
 * @returns {Promise<string>} - The Gemini API text reply
 */
export async function fetchGeminiResponse(messages) {
  enforceKey();

  // Payload structure for Gemini-pro
  let reqPayload = {
    contents: Array.isArray(messages)
      ? messages.map(msg =>
          typeof msg === "string"
            ? { parts: [{ text: msg }] }
            : msg // user may supply objects for advanced use
        )
      : [{ parts: [{ text: String(messages) }] }],
  };

  const url = `${GEMINI_API_BASE_URL}?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  // Always using POST for Gemini-pro
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reqPayload),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Gemini API error: ${resp.status} ${errText}`);
  }
  const data = await resp.json();
  // Defensive: Get reply as string
  const text = (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    data?.candidates?.[0]?.content?.text ||
    "[No response from Gemini API]"
  );
  return text;
}
