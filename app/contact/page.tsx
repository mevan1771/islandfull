import type { Metadata } from "next"
import { Mail, MessageCircle } from "lucide-react"
import { InquiryForm } from "@/components/support/InquiryForm"
import { SupportPageShell } from "@/components/support/SupportPageShell"

export const metadata: Metadata = {
  title: "Contact Us | IslandFull",
  description: "Email or WhatsApp IslandFull for booking help, partnerships, and traveler support.",
}

export default function ContactPage() {
  return (
    <SupportPageShell
      title="Contact us"
      subtitle="We reply to travelers and hosts on email and WhatsApp. Tell us your booking name if you have one."
      imageSrc="https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?auto=format&fit=crop&w=2000&q=80"
      imageAlt="Palm trees along a tropical coast"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-10">
        <a
          href="mailto:info@islandfull.com"
          className="rounded-3xl bg-white border border-zinc-100 p-6 hover:border-rose-200 hover:shadow-md transition-all"
        >
          <Mail className="w-6 h-6 text-rose-500 mb-4" />
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Email</p>
          <p className="text-lg font-black text-zinc-900 mt-1">info@islandfull.com</p>
          <p className="text-sm text-zinc-500 mt-2">Best for bookings, invoices, and longer questions.</p>
        </a>
        <a
          href="https://wa.me/447342573235"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-3xl bg-white border border-zinc-100 p-6 hover:border-rose-200 hover:shadow-md transition-all"
        >
          <MessageCircle className="w-6 h-6 text-rose-500 mb-4" />
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">WhatsApp</p>
          <p className="text-lg font-black text-zinc-900 mt-1">+44 7342 573235</p>
          <p className="text-sm text-zinc-500 mt-2">Fastest for same-day changes while you are on the island.</p>
        </a>
      </div>

      <div className="rounded-3xl bg-white border border-zinc-100 p-6 md:p-10">
        <h2 className="text-2xl font-black text-zinc-900 mb-1">Send a note</h2>
        <p className="text-sm text-zinc-500 mb-8">
          This opens your email app with the details filled in. Nothing is stored on this page.
        </p>
        <InquiryForm defaultSubject="IslandFull support" />
      </div>
    </SupportPageShell>
  )
}
