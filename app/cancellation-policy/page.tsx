import type { Metadata } from "next"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { SupportPageShell } from "@/components/support/SupportPageShell"

export const metadata: Metadata = {
  title: "Cancellation Policy | IslandFull",
  description: "How refunds work on IslandFull tours, events, and transport in Sri Lanka.",
}

function formatCutoff(hours: number) {
  if (!hours || hours <= 0) return "Anytime after booking"
  if (hours % 24 === 0) {
    const days = hours / 24
    return `${days} day${days === 1 ? "" : "s"} before start`
  }
  return `${hours} hours before start`
}

export default async function CancellationPolicyPage() {
  const { data: tiers } = await supabase
    .from("cancellation_tiers")
    .select("id, name, cutoff_hours, refund_percentage")
    .order("cutoff_hours", { ascending: true })
  const visibleTiers = (tiers || []).filter(Boolean)

  return (
    <SupportPageShell
      title="Cancellation Policy"
      subtitle="Each experience shows its own refund window at checkout. This page explains how those windows work."
      imageSrc="https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=2000"
      imageAlt="Tropical beach at sunset"
    >
      <p className="text-zinc-600 leading-relaxed mb-10 max-w-3xl">
        IslandFull hosts set a cancellation tier on every tour. You will always see the exact cutoff
        for your date before you pay. If a host cancels, you receive a full refund or a new date —
        your choice when both are possible.
      </p>

      {visibleTiers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {visibleTiers.map((tier: { id: string; name: string; cutoff_hours: number; refund_percentage: number }) => {
            const nonRefundable =
              tier.id === "NON_REFUNDABLE" || tier.refund_percentage === 0
            return (
              <article
                key={tier.id}
                className="rounded-3xl bg-white border border-zinc-100 p-6 md:p-7 shadow-sm"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-500 mb-2">
                  {nonRefundable ? "Strict" : `${tier.refund_percentage}% refund`}
                </p>
                <h2 className="text-xl font-black text-zinc-900">{tier.name}</h2>
                <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
                  {nonRefundable
                    ? "Bookings on this tier are non-refundable once confirmed, except when the host cancels or we cannot deliver the experience."
                    : `Cancel at least ${formatCutoff(tier.cutoff_hours).toLowerCase()} to receive a ${tier.refund_percentage}% refund of the activity price.`}
                </p>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              name: "Flexible",
              body: "Full refund if you cancel at least 48 hours before the start time.",
            },
            {
              name: "Moderate",
              body: "Partial or full refund depending on the host’s cutoff, shown on the activity page.",
            },
            {
              name: "Non-refundable",
              body: "Used for peak dates and small-group departures that cannot be resold in time.",
            },
          ].map((item) => (
            <article key={item.name} className="rounded-3xl bg-white border border-zinc-100 p-6">
              <h2 className="font-black text-zinc-900">{item.name}</h2>
              <p className="text-sm text-zinc-600 mt-2 leading-relaxed">{item.body}</p>
            </article>
          ))}
        </div>
      )}

      <div className="mt-12 space-y-6 text-sm md:text-base text-zinc-600 leading-relaxed">
        <section className="rounded-3xl bg-white border border-zinc-100 p-6 md:p-8">
          <h2 className="text-lg font-black text-zinc-900 mb-3">How to cancel</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Open the confirmation email or contact us with your booking name and date.</li>
            <li>We confirm the cutoff against the activity’s cancellation tier.</li>
            <li>Approved refunds return to the original payment method. Card refunds can take a few business days.</li>
          </ol>
        </section>
        <section className="rounded-3xl bg-white border border-zinc-100 p-6 md:p-8">
          <h2 className="text-lg font-black text-zinc-900 mb-3">No-shows and weather</h2>
          <p>
            Missing the meeting time without notice is treated as a no-show and is not refunded.
            Weather, park closures, or safety calls by the host are different — we will help you
            rebook or refund when the experience cannot run.
          </p>
        </section>
      </div>

      <p className="mt-10 text-sm text-zinc-500">
        Need us to look at a booking?{" "}
        <Link href="/contact" className="font-semibold text-rose-500 hover:underline">
          Contact support
        </Link>
        .
      </p>
    </SupportPageShell>
  )
}
