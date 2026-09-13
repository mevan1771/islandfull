import type { Metadata } from "next"
import Link from "next/link"
import { CreditCard, CalendarClock, MapPinned, MessageCircle } from "lucide-react"
import { FaqAccordion } from "@/components/activity/FaqAccordion"
import { SupportPageShell } from "@/components/support/SupportPageShell"

export const metadata: Metadata = {
  title: "Help Center | IslandFull",
  description: "Answers for bookings, changes, payments, and traveling with IslandFull in Sri Lanka.",
}

const FAQS = [
  {
    question: "How do I book a tour or activity?",
    answer:
      "Open any experience, pick a date and group size, then complete checkout. You’ll get a confirmation email right away, and your host will follow up with meeting details.",
  },
  {
    question: "Can I change the date after I book?",
    answer:
      "Often yes, if the host still has space. Message us as soon as you know. Date changes follow the same cutoff as the cancellation policy shown on that activity.",
  },
  {
    question: "When will I receive meeting instructions?",
    answer:
      "Most hosts send pickup or meeting-point notes 24–48 hours before the start time. Check the activity page and your confirmation email if you need them sooner.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Card payments are processed securely at checkout. Some experiences also show a local price in LKR. You’ll see the total before you pay.",
  },
  {
    question: "Do prices include park fees and tickets?",
    answer:
      "It depends on the experience. The activity page lists what’s included. Entrance fees, camera permits, or meals are called out when they are extra.",
  },
  {
    question: "What if the weather is bad?",
    answer:
      "Outdoor experiences may be delayed or rescheduled for safety. Hosts will contact you. If a trip is cancelled by the host, you typically receive a full refund or a new date.",
  },
]

export default function HelpCenterPage() {
  return (
    <SupportPageShell
      title="Help Center"
      subtitle="Quick answers for travelers — bookings, changes, and what to expect on the island."
      imageSrc="https://images.pexels.com/photos/2403209/pexels-photo-2403209.jpeg?auto=compress&cs=tinysrgb&w=2000"
      imageAlt="Train crossing the Nine Arch Bridge in Ella, Sri Lanka"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-12">
        {[
          { href: "/cancellation-policy", icon: CalendarClock, label: "Cancellations", hint: "Refund windows" },
          { href: "/contact", icon: MessageCircle, label: "Write to us", hint: "Email & WhatsApp" },
          { href: "/map", icon: MapPinned, label: "Find tours", hint: "Explore the map" },
          { href: "/legal", icon: CreditCard, label: "Policies", hint: "Terms & privacy" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-3xl bg-white border border-zinc-100 p-4 md:p-5 hover:border-rose-200 hover:shadow-md transition-all"
          >
            <item.icon className="w-5 h-5 text-rose-500 mb-3" />
            <p className="font-bold text-zinc-900 text-sm md:text-base">{item.label}</p>
            <p className="text-xs text-zinc-500 mt-1">{item.hint}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-3xl bg-white border border-zinc-100 p-5 md:p-8">
        <FaqAccordion faqs={FAQS} />
      </div>

      <div className="mt-10 rounded-3xl bg-zinc-900 text-white p-6 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Still stuck?</h2>
          <p className="text-zinc-400 mt-2 text-sm md:text-base max-w-md">
            A real person in our team can help with bookings, host questions, and last-minute changes.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex justify-center rounded-full bg-rose-500 hover:bg-rose-600 px-6 py-3 font-bold text-sm transition-colors"
        >
          Contact support
        </Link>
      </div>
    </SupportPageShell>
  )
}
