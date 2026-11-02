import { headers } from "next/headers"
import { render } from "@react-email/components"
import { IntroIslandFullEmail } from "@/components/emails/IntroIslandFullEmail"

export const metadata = {
  robots: { index: false, follow: false },
  title: "Intro email preview",
}

export default async function IntroEmailPreviewPage() {
  const h = await headers()
  const host = h.get("x-forwarded-host") || h.get("host") || "127.0.0.1:3000"
  const proto = h.get("x-forwarded-proto") || "http"
  const assetBase = `${proto}://${host}`
  const html = await render(
    <IntroIslandFullEmail firstName="Alex" assetBase={assetBase} />
  )

  return (
    <div className="min-h-screen bg-zinc-100 p-4 md:p-8">
      <div className="mx-auto max-w-2xl mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Preview · not sent · not indexed</p>
        <h1 className="mt-1 text-xl font-bold text-zinc-900">One-to-one intro email</h1>
        <p className="mt-2 text-sm text-zinc-600">
          <span className="font-semibold text-zinc-800">Subject:</span> IslandFull — tours and private transport in Sri Lanka
        </p>
        <p className="text-sm text-zinc-600">
          <span className="font-semibold text-zinc-800">From:</span> IslandFull &lt;info@islandfull.com&gt;
        </p>
      </div>
      <iframe
        title="Intro email"
        srcDoc={html}
        className="mx-auto block h-[1900px] w-full max-w-[600px] rounded-2xl border border-zinc-200 bg-white"
      />
    </div>
  )
}
