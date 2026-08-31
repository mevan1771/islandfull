"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { logActivity } from "@/utils/auditLogger"
import { createClient } from "@/utils/supabase/server"

// Cache the external API fetch heavily to prevent rate limits
// Since Next.js fetch cache is persistent, this guarantees minimal external hits
async function fetchLiveLkrRate(): Promise<number> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    const data = await res.json();
    if (data && data.rates && data.rates.LKR) {
      return data.rates.LKR;
    }
    throw new Error("Invalid rate response");
  } catch (err) {
    console.error("Failed to fetch live LKR rate:", err);
    return 300; // Fallback hardcoded safe rate if API goes down
  }
}

export async function getPlatformSettings() {
  const { data, error } = await supabaseAdmin
    .from("platform_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) {
    console.warn("Failed to fetch platform_settings, returning defaults");
    return {
      id: 1,
      use_live_rate: false,
      manual_usd_lkr_rate: 300
    };
  }
  
  return data;
}

export async function getExchangeRate(): Promise<number> {
  const settings = await getPlatformSettings();
  
  if (settings.use_live_rate) {
    return await fetchLiveLkrRate();
  }
  
  return settings.manual_usd_lkr_rate;
}

export async function updateSettings(use_live_rate: boolean, manual_usd_lkr_rate: number) {
  try {
    const { error } = await supabaseAdmin
      .from("platform_settings")
      .upsert({
        id: 1,
        use_live_rate,
        manual_usd_lkr_rate
      });

    if (error) throw error;

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await logActivity(user?.id, `Updated Platform Settings: live_rate=${use_live_rate}, manual_rate=${manual_usd_lkr_rate}`, 'platform_settings', '1')

    // Instantly invalidate the whole app to apply the new rate immediately
    revalidatePath('/', 'layout')
    revalidatePath('/', 'page');
    
    return { success: true };
  } catch (err: any) {
    console.error("Settings update failed:", err);
    return { success: false, error: err.message };
  }
}

export async function updateGlobalSetting(key: string, value: any) {
  try {
    const { error } = await supabaseAdmin
      .from('global_settings')
      .upsert({ 
        key,
        value,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' })
      
    if (error) throw error
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await logActivity(user?.id, `Changed global setting [${key}]`, 'global_settings', key)

    // Revalidate paths that might use this setting
    revalidatePath('/', 'layout')
    
    return { success: true }
  } catch (error: any) {
    console.error(`Failed to update global setting [${key}]:`, error)
    return { success: false, error: error.message || "Failed to save settings" }
  }
}

export async function getGlobalSetting(key: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('global_settings')
      .select('value')
      .eq('key', key)
      .single()
      
    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
      console.error(`Error fetching global setting [${key}]:`, error)
      return null
    }
    
    return data ? data.value : null
  } catch (error) {
    console.error(`Exception fetching global setting [${key}]:`, error)
    return null
  }
}
