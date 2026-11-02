import Link from "next/link"
import SendIntroEmailForm from "@/components/admin/SendIntroEmailForm"

export const dynamic = "force-dynamic"

export default function AdminIntroEmailPage() {
  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Intro email</h1>
          <p className="mt-1 text-zinc-500">
            Send the one-to-one IslandFull intro to one person. From info@islandfull.com · replies go to islandfull@gmail.com.
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            <Link href="/email-preview" className="font-semibold text-rose-600 hover:text-rose-700">
              Preview the email
            </Link>
            {" · "}
            Images load from islandfull.com, so push this design live before sending.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm">
          <SendIntroEmailForm />
        </div>
      </div>
    </div>
  )
}
