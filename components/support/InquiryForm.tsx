"use client"

import { useState } from "react"
import { CheckCircle2, Loader2, Send } from "lucide-react"

export function InquiryForm({
  to = "info@islandfull.com",
  defaultSubject = "IslandFull inquiry",
  fields = "contact",
  submitLabel = "Send message",
}: {
  to?: string
  defaultSubject?: string
  fields?: "contact" | "partner"
  submitLabel?: string
}) {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const data = new FormData(e.currentTarget)
    const name = String(data.get("name") || "").trim()
    const email = String(data.get("email") || "").trim()
    const phone = String(data.get("phone") || "").trim()
    const subject = String(data.get("subject") || defaultSubject).trim()
    const message = String(data.get("message") || "").trim()
    const tour = String(data.get("tour") || "").trim()
    const location = String(data.get("location") || "").trim()

    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone / WhatsApp: ${phone}` : null,
      tour ? `Tour idea: ${tour}` : null,
      location ? `Base location: ${location}` : null,
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n")

    const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-zinc-900">Your email app should be open</h3>
        <p className="text-sm text-zinc-600 mt-2">
          If nothing appeared, write to{" "}
          <a href={`mailto:${to}`} className="font-semibold text-rose-500 hover:underline">
            {to}
          </a>{" "}
          or WhatsApp us instead.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">Name</span>
          <input
            name="name"
            required
            className="mt-1.5 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            placeholder="Your name"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">Email</span>
          <input
            name="email"
            type="email"
            required
            className="mt-1.5 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            placeholder="you@email.com"
          />
        </label>
      </div>

      {fields === "partner" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">Tour or experience</span>
            <input
              name="tour"
              required
              className="mt-1.5 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              placeholder="Sunrise safari, cooking class…"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">Where you operate</span>
            <input
              name="location"
              required
              className="mt-1.5 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              placeholder="Galle, Ella, Yala…"
            />
          </label>
        </div>
      ) : (
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">Subject</span>
          <input
            name="subject"
            defaultValue={defaultSubject}
            className="mt-1.5 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
        </label>
      )}

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">Phone or WhatsApp</span>
        <input
          name="phone"
          className="mt-1.5 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          placeholder="+94 …"
        />
      </label>

      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">Message</span>
        <textarea
          name="message"
          required
          rows={5}
          className="mt-1.5 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 resize-y"
          placeholder={
            fields === "partner"
              ? "Tell us about your experience, group sizes, and languages you guide in."
              : "How can we help?"
          }
        />
      </label>

      {fields === "partner" && (
        <input type="hidden" name="subject" value={defaultSubject} />
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-3.5 text-sm transition-colors disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {submitLabel}
      </button>
    </form>
  )
}
