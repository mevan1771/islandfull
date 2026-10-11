"use server"

import { clerkClient, currentUser } from "@clerk/nextjs/server"

function asIds(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((id): id is string => typeof id === "string") : []
}

export async function getFavoriteIds(): Promise<string[]> {
  const user = await currentUser()
  if (!user) return []
  return asIds(user.unsafeMetadata?.favoriteIds)
}

export async function saveFavoriteIds(ids: string[]): Promise<{ success: boolean }> {
  const user = await currentUser()
  if (!user) return { success: false }
  const unique = [...new Set(ids.filter(Boolean))].slice(0, 200)
  try {
    const client = await clerkClient()
    await client.users.updateUser(user.id, {
      unsafeMetadata: {
        ...user.unsafeMetadata,
        favoriteIds: unique,
      },
    })
    return { success: true }
  } catch (err) {
    console.error("saveFavoriteIds error:", err)
    return { success: false }
  }
}
