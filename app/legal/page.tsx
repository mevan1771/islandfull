import type { Metadata } from "next"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { SupportPageShell } from "@/components/support/SupportPageShell"

export const metadata: Metadata = {
  title: "Terms & Privacy | IslandFull",
  description: "Guest terms of use and privacy practices for IslandFull.",
}

const FALLBACK_TERMS = `IslandFull is a marketplace. We introduce travelers to independent hosts who run tours, events, and transport across Sri Lanka.

When you book, you enter an agreement with the host for that experience, and with IslandFull for payment processing and customer support. Activity pages describe duration, group size, meeting points, and what is included. Please read them before you pay.

You must provide accurate guest details. Hosts may refuse service if safety rules, age limits, or fitness notes are ignored. IslandFull may cancel a booking that cannot be fulfilled and will then refund or rebook according to the cancellation policy shown at checkout.

Reviews should be honest and about the experience you took. We may remove content that is unlawful, abusive, or misleading.`

const PRIVACY = `We collect the information you give us to complete a booking: name, email, phone, traveler counts, and payment confirmation from our processor. We share what a host needs to run the trip (guest name, date, group size, and relevant notes).

We use cookies and similar tools to keep you signed in, remember favorites, and understand which pages help people book. We do not sell your personal information.

You can ask us to update or delete account details by emailing info@islandfull.com. Some records are kept where the law or accounting rules require it.

IslandFull is operated for travelers booking Sri Lanka experiences. If you are in a region with extra privacy rights, email us and we will handle the request in line with applicable law.`

export default async function LegalPage() {
  const { data: touristTerms } = await supabase
    .from("platform_policies")
    .select("content, version")
    .eq("type", "tourist_terms")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle()

  const termsText =
    typeof touristTerms?.content === "string" && touristTerms.content.trim().length > 0
      ? touristTerms.content
      : FALLBACK_TERMS

  return (
    <SupportPageShell
      title="Terms & Privacy"
      subtitle="How bookings work, what we collect, and how we look after your information."
      imageSrc="https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?auto=format&fit=crop&w=2000&q=80"
      imageAlt="Blue train on a stone viaduct in the Sri Lankan hills"
    >
      <div className="flex gap-3 mb-8">
        <a
          href="#terms"
          className="rounded-full bg-zinc-900 text-white text-sm font-semibold px-4 py-2"
        >
          Guest terms
        </a>
        <a
          href="#privacy"
          className="rounded-full bg-white border border-zinc-200 text-zinc-700 text-sm font-semibold px-4 py-2"
        >
          Privacy
        </a>
      </div>

      <article id="terms" className="rounded-3xl bg-white border border-zinc-100 p-6 md:p-10 scroll-mt-28">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-500 mb-2">
          For travelers
        </p>
        <h2 className="text-2xl font-black text-zinc-900 mb-6">Guest terms</h2>
        <div className="prose-legal text-zinc-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
          {termsText}
        </div>
        {touristTerms?.version ? (
          <p className="text-xs text-zinc-400 mt-6">Version {touristTerms.version}</p>
        ) : null}
      </article>

      <article id="privacy" className="mt-6 rounded-3xl bg-white border border-zinc-100 p-6 md:p-10 scroll-mt-28">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-500 mb-2">
          Your data
        </p>
        <h2 className="text-2xl font-black text-zinc-900 mb-6">Privacy</h2>
        <div className="text-zinc-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
          {PRIVACY}
        </div>
      </article>

      <p className="mt-8 text-sm text-zinc-500">
        Hosts also agree to an operator agreement inside the partner portal. Questions?{" "}
        <Link href="/contact" className="font-semibold text-rose-500 hover:underline">
          Contact us
        </Link>
        .
      </p>
    </SupportPageShell>
  )
}
