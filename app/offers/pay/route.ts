import { NextRequest, NextResponse } from "next/server"
import { verifyOfferActionToken } from "@/lib/offer-token"
import { createCheckoutForAcceptedOffer } from "@/lib/offer-checkout"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") || ""
  const token = req.nextUrl.searchParams.get("token") || ""
  if (!verifyOfferActionToken(id, "pay", token)) {
    return NextResponse.redirect(new URL("/offers/processed?status=invalid", req.url))
  }
  const result = await createCheckoutForAcceptedOffer(id)
  if (result.url) {
    return NextResponse.redirect(result.url)
  }
  const expired = /expir/i.test(result.error || "")
  return NextResponse.redirect(new URL(`/offers/processed?status=${expired ? "expired" : "invalid"}`, req.url))
}
