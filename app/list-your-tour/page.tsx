import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Camera, CalendarCheck, Compass, Handshake } from "lucide-react"
import { InquiryForm } from "@/components/support/InquiryForm"
import { SupportPageShell } from "@/components/support/SupportPageShell"

export const metadata: Metadata = {
  title: "List Your Tour | IslandFull",
  description: "Partner with IslandFull to list tours, events, and transport for travelers in Sri Lanka.",
}

const STEPS = [
  {
    icon: Compass,
    title: "Tell us what you run",
    body: "Safaris, surf, cooking, boats, or a van with a story. We care that it is real, safe, and well hosted.",
  },
  {
    icon: Camera,
    title: "We shape the listing",
    body: "Photos, meeting points, group size, and a clear price. You stay in control of dates and availability.",
  },
  {
    icon: CalendarCheck,
    title: "Travelers book",
    body: "Guests pay on IslandFull. You get the brief, the names, and a simple way to check people in.",
  },
  {
    icon: Handshake,
    title: "You host, we support",
    body: "Our team helps with questions and cancellations so you can focus on the morning start time.",
  },
]

export default function ListYourTourPage() {
  return (
    <SupportPageShell
      title="List your tour"
      subtitle="Independent guides and small operators — this is how travelers find you without giving the whole story to a giant OTA."
      imageSrc="https://images.unsplash.com/photo-1537519646099-335112f03225?auto=format&fit=crop&w=2000&q=80"
      imageAlt="Surfboards at a tropical beach hut"
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-12">
        {[
          {
            src: "https://images.pexels.com/photos/2403209/pexels-photo-2403209.jpeg?auto=compress&cs=tinysrgb&w=1200",
            alt: "Nine Arch Bridge in Ella",
          },
          {
            src: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80",
            alt: "Surfer on a tropical break",
          },
          {
            src: "https://images.unsplash.com/photo-1566296314736-6eaac1ca0cb9?auto=format&fit=crop&w=1200&q=80",
            alt: "Hill-country train on a viaduct",
          },
        ].map((photo, index) => (
          <div
            key={photo.src}
            className={`relative h-36 md:h-52 overflow-hidden rounded-3xl ${index === 2 ? "col-span-2 md:col-span-1" : ""}`}
          >
            <Image src={photo.src} alt={photo.alt} fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-12">
        {STEPS.map((step) => (
          <article key={step.title} className="rounded-3xl bg-white border border-zinc-100 p-6">
            <step.icon className="w-6 h-6 text-rose-500 mb-4" />
            <h2 className="font-black text-zinc-900">{step.title}</h2>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">{step.body}</p>
          </article>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-12">
        <Link
          href="/host/login"
          className="inline-flex justify-center rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-3.5 text-sm transition-colors"
        >
          Partner login
        </Link>
        <a
          href="mailto:info@islandfull.com?subject=List%20a%20tour%20on%20IslandFull"
          className="inline-flex justify-center rounded-full bg-white border border-zinc-200 text-zinc-800 font-bold px-6 py-3.5 text-sm hover:border-rose-200 transition-colors"
        >
          Email the partnerships desk
        </a>
      </div>

      <div className="rounded-3xl bg-white border border-zinc-100 p-6 md:p-10">
        <h2 className="text-2xl font-black text-zinc-900 mb-1">Introduce your experience</h2>
        <p className="text-sm text-zinc-500 mb-8">
          New hosts start here. If you already have an account, use Partner login instead.
        </p>
        <InquiryForm
          fields="partner"
          defaultSubject="List a tour on IslandFull"
          submitLabel="Send introduction"
        />
      </div>
    </SupportPageShell>
  )
}
