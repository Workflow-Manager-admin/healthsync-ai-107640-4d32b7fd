import React, { useState, useRef, useEffect } from "react";
import { fetchGeminiResponse } from "../utils/geminiApi";

// Simple roles for message
const USER = "user";
const AI = "ai";

/**
 * PUBLIC_INTERFACE
 */
export default function AIChat() {
  const [messages, setMessages] = useState([
    // optional welcome
    {
      role: AI,
      content: "Hello! I'm your healthcare assistant. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState(null);
  const msgEndRef = useRef(null);

  // Scroll to latest message
  useEffect(() => {
    if (msgEndRef.current) {
      msgEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // PUBLIC_INTERFACE
  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setSending(true);
    setErr(null);

    // Add user input to chat immediately (optimistic UI)
    setMessages(prev => [...prev, { role: USER, content: trimmed }]);
    setInput("");

    try {
      // Build Gemini message history
      // Each user/ai exchange becomes [{role, content}]
      // Map to Gemini API format for chat continuity
      const geminiMessages = messages
        .slice(1) // skip initial AI welcome for context clarity to Gemini
        .concat([{ role: USER, content: trimmed }])
        .map(msg => ({
          // In Gemini, user/ai = "user"/"model"
          parts: [{ text: msg.content }],
          role: msg.role === USER ? "user" : "model",
        }));

      const aiReply = await fetchGeminiResponse(geminiMessages);
      setMessages(prev =>
        [
          ...prev,
          { role: USER, content: trimmed },
          { role: AI, content: aiReply }
        ]
      );
    } catch (e) {
      setMessages(prev =>
        [
          ...prev,
          { role: USER, content: trimmed },
          { role: AI, content: "[AI Error: " + (e.message || "Unknown error.") + "]" }
        ]
      );
      setErr(e.message || "Unknown error with Gemini API.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-secondary p-5 my-8 rounded-md max-w-lg mx-auto shadow">
      <h2 className="text-lg font-bold mb-2 text-primary">AI Chat</h2>
      <div
        className="border rounded p-2 mb-2 h-56 overflow-y-auto bg-white text-black"
        style={{ minHeight: 140, fontSize: "1rem" }}
        aria-label="AI chat window"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-2 flex ${m.role === USER ? "justify-end" : "justify-start"}`}
          >
            <span
              className={`inline-block rounded px-3 py-1 ${m.role === USER
                ? "bg-primary text-white ml-auto"
                : "bg-gray-200 text-gray-900 mr-auto"
              }`}
            >
              {m.content}
            </span>
          </div>
        ))}
        <div ref={msgEndRef} />
      </div>
      <form className="flex gap-2" onSubmit={handleSend} autoComplete="off">
        <input
          className="flex-1 border rounded p-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={sending}
          placeholder="Type your health question..."
          aria-label="AI chat input"
        />
        <button className="btn btn-large" disabled={sending || !input.trim()}>
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
      {err && (
        <div className="mt-1 text-red-600 text-sm">{err}</div>
      )}
    </div>
  );
}
