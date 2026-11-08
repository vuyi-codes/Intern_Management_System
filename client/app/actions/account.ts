"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

import { requireAuth } from "@/lib/auth"
import type { RoleSettings } from "@/lib/settings"
import type { Json } from "@/types/database"
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
    notifications: settings.notifications as Json,
    preferences: settings.preferences as Json,
    privacy: settings.privacy as Json,
  })
  if (error) return { error: error.message }
  revalidatePath(`/${profile.role}/settings`)
  return {}
}

export async function setAvatarUrl(
  url: string | null
): Promise<ActionResult & { url?: string | null }> {
  const profile = await requireAuth()
  const supabase = createClient(await cookies())
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: url })
    .eq("id", profile.id)
  if (error) return { error: error.message }

  revalidatePath(`/${profile.role}`)
  revalidatePath(`/${profile.role}/account`)
  return { url }
}

export async function uploadAvatar(
  formData: FormData
): Promise<ActionResult & { url?: string }> {
  const profile = await requireAuth()
  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image to upload." }
  }
  if (!file.type.startsWith("image/")) {
    return { error: "Avatar must be an image file." }
  }
  if (file.size > 2 * 1024 * 1024) {
    return { error: "Avatar must be under 2 MB." }
  }

  const ext =
    file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
    "png"
  const path = `${profile.id}/${Date.now()}.${ext}`
  const supabase = createClient(await cookies())

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    })
  if (uploadError) return { error: uploadError.message }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path)

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", profile.id)
  if (error) return { error: error.message }

  revalidatePath(`/${profile.role}`)
  revalidatePath(`/${profile.role}/account`)
  return { url: publicUrl }
}
