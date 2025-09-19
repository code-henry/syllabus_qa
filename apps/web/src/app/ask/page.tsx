"use client";
import { useState } from "react";

export default function AskPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAnswer(data.answerMd || JSON.stringify(data));
    } catch (e: any) {
      setError(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Ask</h1>
      <form onSubmit={onSubmit}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={4}
          style={{ width: "100%" }}
          placeholder="質問を入力してください"
        />
        <div style={{ marginTop: 12 }}>
          <button disabled={loading || !question.trim()} type="submit">
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {answer && (
        <section style={{ marginTop: 24 }}>
          <h2>Answer</h2>
          <pre>{answer}</pre>
        </section>
      )}
    </main>
  );
}
