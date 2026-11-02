"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { sendIntroEmail } from "@/app/actions/intro-email"

export default function SendIntroEmailForm() {
  const [firstName, setFirstName] = useState("")
  const [toEmail, setToEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setStatus(null)
    const res = await sendIntroEmail({ firstName, toEmail })
    if (res.success) {
      setStatus({ type: "success", msg: `Sent to ${toEmail.trim().toLowerCase()}.` })
      setFirstName("")
      setToEmail("")
    } else {
      setStatus({ type: "error", msg: res.error || "Failed to send." })
    }
    setSending(false)
  }

  return (
    <form onSubmit={handleSend} className="max-w-lg space-y-5">
      <div>
        <label htmlFor="intro-name" className="block text-sm font-semibold text-zinc-800">
          Client name
        </label>
        <input
          id="intro-name"
          type="text"
          autoComplete="name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Alex"
          className="mt-1.5 w-full h-11 rounded-xl border border-zinc-200 bg-white px-3.5 text-sm text-zinc-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
          required
        />
        <p className="mt-1.5 text-xs text-zinc-500">Used in the greeting: Hi Alex,</p>
      </div>

      <div>
        <label htmlFor="intro-email" className="block text-sm font-semibold text-zinc-800">
          Client email
        </label>
        <input
          id="intro-email"
          type="email"
          autoComplete="email"
          value={toEmail}
          onChange={(e) => setToEmail(e.target.value)}
          placeholder="alex@email.com"
          className="mt-1.5 w-full h-11 rounded-xl border border-zinc-200 bg-white px-3.5 text-sm text-zinc-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
          required
        />
      </div>

      <button
        type="submit"
        disabled={sending}
        className="inline-flex h-11 items-center justify-center rounded-xl bg-rose-500 px-5 text-sm font-bold text-white shadow-md shadow-rose-500/25 hover:bg-rose-600 disabled:opacity-60"
      >
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send intro email"}
      </button>

      {status ? (
        <p className={`text-sm font-medium ${status.type === "success" ? "text-emerald-600" : "text-rose-600"}`}>
          {status.msg}
        </p>
      ) : null}
    </form>
  )
}
