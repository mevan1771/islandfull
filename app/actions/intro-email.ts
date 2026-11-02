"use server"

import React from "react"
import { Resend } from "resend"
import { render } from "@react-email/components"
import { createClient } from "@/utils/supabase/server"
import { IntroIslandFullEmail } from "@/components/emails/IntroIslandFullEmail"

const LIVE = "https://islandfull.com"
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function requireStaff() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", user.id).single()
  const { data: profileData } = await supabase.from("users").select("role").eq("id", user.id).single()
  const role = (roleData?.role || profileData?.role || "").toLowerCase()
  return ["admin", "staff"].includes(role)
}

export async function sendIntroEmail(input: { firstName: string; toEmail: string }) {
  try {
    const allowed = await requireStaff()
    if (!allowed) return { success: false, error: "Unauthorized" }

    const firstName = (input.firstName || "").trim()
    const toEmail = (input.toEmail || "").trim().toLowerCase()
    if (!firstName) return { success: false, error: "Enter the client's name." }
    if (!EMAIL_RE.test(toEmail)) return { success: false, error: "Enter a valid email." }

    const html = await render(
      React.createElement(IntroIslandFullEmail, {
        firstName,
        assetBase: LIVE,
      })
    )

    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from: "IslandFull <info@islandfull.com>",
      replyTo: "islandfull@gmail.com",
      to: [toEmail],
      subject: "IslandFull — tours and private transport in Sri Lanka",
      html,
    })

    if (error) {
      console.error("Intro email Resend error:", error)
      return { success: false, error: error.message || "Failed to send." }
    }

    return { success: true }
  } catch (err: unknown) {
    console.error("Failed to send intro email:", err)
    return { success: false, error: err instanceof Error ? err.message : "Failed to send." }
  }
}
