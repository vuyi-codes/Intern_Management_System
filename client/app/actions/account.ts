"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

import { requireAuth } from "@/lib/auth"
import type { RoleSettings } from "@/lib/settings"
import { createClient } from "@/utils/supabase/server"

export type ActionResult = {
  error?: string
}

export async function updateAccountProfile(input: {
  name: string
  email: string
  phone: string
  title: string
  department: string
}): Promise<ActionResult> {
  const profile = await requireAuth()
  const supabase = createClient(await cookies())
  const email = input.email.trim().toLowerCase()

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: input.name.trim(),
      email,
      phone: input.phone.trim(),
      title: input.title.trim(),
      department: input.department.trim(),
    })
    .eq("id", profile.id)
  if (error) return { error: error.message }

  if (email !== profile.email) {
    const { error: authError } = await supabase.auth.updateUser({ email })
    if (authError) return { error: authError.message }
  }

  revalidatePath(`/${profile.role}/account`)
  revalidatePath(`/${profile.role}`)
  return {}
}

export async function updateAccountPassword(
  password: string
): Promise<ActionResult> {
  await requireAuth()
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." }
  }
  const supabase = createClient(await cookies())
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }
  return {}
}

export async function saveUserSettings(
  settings: RoleSettings
): Promise<ActionResult> {
  const profile = await requireAuth()
  const supabase = createClient(await cookies())
  const { error } = await supabase.from("user_settings").upsert({
    user_id: profile.id,
    notifications: settings.notifications,
    preferences: settings.preferences,
    privacy: settings.privacy,
  })
  if (error) return { error: error.message }
  revalidatePath(`/${profile.role}/settings`)
  return {}
}
