"use server"

import { supabaseAdmin } from "@/lib/supabase"

export type SearchSuggestion = {
  text: string;
  type: 'location' | 'title' | 'category';
};

export async function searchLocationsAndTags(query: string): Promise<SearchSuggestion[]> {
  if (!query || query.length < 2) return []

  try {
    const searchTerm = `%${query}%`

    // 1. Search activities table for matching locations, titles, or descriptions
    const { data: activityData, error: actError } = await supabaseAdmin
      .from('activities')
      .select('location, title')
      .or(`location.ilike.${searchTerm},title.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .eq('status', 'published')
      .eq('is_paused_by_host', false)

    if (actError) throw actError

    // Extract unique locations and titles
    const uniqueLocations = Array.from(new Set(activityData.map(d => d.location).filter(Boolean))).map(text => ({ text, type: 'location' as const }))
    const uniqueTitles = Array.from(new Set(activityData.map(d => d.title).filter(Boolean))).map(text => ({ text, type: 'title' as const }))

    // 2. Search categories table for matching names
    const { data: categoryData, error: catError } = await supabaseAdmin
      .from('categories')
      .select('name')
      .ilike('name', searchTerm)

    if (catError) throw catError

    // Extract unique category names
    const uniqueCategories = Array.from(new Set(categoryData.map(d => d.name).filter(Boolean))).map(text => ({ text, type: 'category' as const }))

    // 3. Combine, deduplicate, and limit
    const all = [...uniqueLocations, ...uniqueTitles, ...uniqueCategories]
    const map = new Map<string, SearchSuggestion>()
    for (const item of all) {
      if (!map.has(item.text)) {
        map.set(item.text, item)
      }
    }
    const combined = Array.from(map.values())
    
    // Prioritize exact/starting matches, then fallback to others
    const sorted = combined.sort((a, b) => {
      const aLower = a.text.toLowerCase();
      const bLower = b.text.toLowerCase();
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
