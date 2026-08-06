"use server"

import { supabaseAdmin } from "@/lib/supabase"

export async function searchLocationsAndTags(query: string) {
  if (!query || query.length < 2) return []

  try {
    const searchTerm = `%${query}%`

    // 1. Search distinct locations in activities table
    const { data: locationData, error: locError } = await supabaseAdmin
      .from('activities')
      .select('location')
      .ilike('location', searchTerm)
      .eq('status', 'published')
      .eq('is_paused_by_host', false)

    if (locError) throw locError

    // Extract unique locations
    const uniqueLocations = Array.from(new Set(locationData.map(d => d.location).filter(Boolean)))

    // 2. Search categories table for matching names
    const { data: categoryData, error: catError } = await supabaseAdmin
      .from('categories')
      .select('name')
      .ilike('name', searchTerm)

    if (catError) throw catError

    // Extract unique category names
    const uniqueCategories = Array.from(new Set(categoryData.map(d => d.name).filter(Boolean)))

    // 3. Combine, deduplicate, and limit
    const combined = Array.from(new Set([...uniqueLocations, ...uniqueCategories]))
    
    // Prioritize exact/starting matches, then fallback to others
    const sorted = combined.sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const qLower = query.toLowerCase();
      
      const aStarts = aLower.startsWith(qLower);
      const bStarts = bLower.startsWith(qLower);
      
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return aLower.localeCompare(bLower);
    });

    return sorted.slice(0, 8)
  } catch (err) {
    console.error("Search Action Error:", err)
    return []
  }
}
