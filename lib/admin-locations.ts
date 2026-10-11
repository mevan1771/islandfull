import { supabaseAdmin } from "@/lib/supabase"
import { uniqueLocations } from "@/lib/locations"

export async function fetchExistingLocations() {
  const [tours, hotels] = await Promise.all([
    supabaseAdmin.from("activities").select("location").not("location", "is", null),
    supabaseAdmin.from("hotels").select("location").not("location", "is", null),
  ])

  return uniqueLocations([
    ...(tours.data || []).map((row: any) => row.location),
    ...(hotels.data || []).map((row: any) => row.location),
  ])
}
