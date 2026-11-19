"use client";
import { useState } from "react";

export default function ReviewForm() {
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("sending");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          message: form.get("message"),
          website: form.get("website"), // honeypot
          rating,
        }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return <p className="text-center text-white">Thank you for your review!</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4">
      <input name="name" placeholder="Your name" required
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-white" />

      <input name="email" type="email" placeholder="Email (optional)"
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-white" />

      {/* Honeypot - hidden from real users */}
      <input name="website" tabIndex={-1} autoComplete="off"
        className="hidden" aria-hidden="true" />

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} onClick={() => setRating(n)}
            aria-label={`${n} star`}
            className={`text-3xl ${n <= rating ? "text-yellow-400" : "text-zinc-600"}`}>
            ★
          </button>
        ))}
      </div>

      <textarea name="message" placeholder="Write your review" required rows={4}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-white" />

      <button disabled={status === "sending" || rating === 0}
        className="w-full rounded-lg bg-white py-3 font-medium text-black disabled:opacity-50">
        {status === "sending" ? "Sending..." : "Submit review"}
      </button>

      {status === "error" && (
        <p className="text-red-400">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}