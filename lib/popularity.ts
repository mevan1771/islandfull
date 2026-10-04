import { supabaseAdmin } from "@/lib/supabase"

export async function bumpPopularity(activityId: string | null | undefined, delta: number) {
  if (!activityId || !delta) return

  const { error } = await supabaseAdmin.rpc("bump_popularity", {
    p_activity_id: activityId,
    p_delta: delta,
  })

  if (!error) return

  const { data } = await supabaseAdmin
    .from("activities")
    .select("popularity_score")
    .eq("id", activityId)
    .single()

  await supabaseAdmin
    .from("activities")
    .update({ popularity_score: Math.max(0, (data?.popularity_score || 0) + delta) })
    .eq("id", activityId)
}

const ALREADY_COUNTED = new Set(["confirmed", "completed", "redeemed"])

export async function bumpPopularityIfNewlyConfirmed(
  bookingId: string,
  previousStatus?: string | null
) {
  const { data: booking } = await supabaseAdmin
    .from("bookings")
    .select("activity_id, status")
    .eq("id", bookingId)
    .single()

  if (!booking?.activity_id) return

  const prior = previousStatus ?? booking.status
  if (ALREADY_COUNTED.has(prior || "")) return

  await bumpPopularity(booking.activity_id, 10)
}
