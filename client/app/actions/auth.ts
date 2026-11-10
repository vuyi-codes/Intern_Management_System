"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

import {
  dashboardPathForRole,
  getCurrentProfile,
  type Profile,
} from "@/lib/auth"
import type { Role } from "@/lib/nav"
import { createClient } from "@/utils/supabase/server"

export type AuthActionState = {
  error?: string
  success?: string
  redirectTo?: string
}

async function loadProfileRole(userId: string): Promise<Role | null> {
  const supabase = createClient(await cookies())
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle()

  if (error || !data) return null
  if (
    data.role === "admin" ||
    data.role === "supervisor" ||
    data.role === "intern"
  ) {
    return data.role
  }
  return null
}

export async function signInWithPassword(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    return { error: "Email and password are required." }
  }

  const supabase = createClient(await cookies())
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  const role = data.user ? await loadProfileRole(data.user.id) : null
  if (!role) {
    await supabase.auth.signOut()
    return { error: "Your account profile could not be loaded." }
  }

  // Return a path for the client to navigate — redirect() inside
  // useActionState can surface as "unexpected response from the server".
  revalidatePath("/", "layout")
  return { redirectTo: dashboardPathForRole(role) }
}

export async function signInWithGoogle(): Promise<AuthActionState> {
  const supabase = createClient(await cookies())
  const origin = process.env.NEXT_PUBLIC_SITE_URL

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin ?? "http://localhost:3000"}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    return { redirectTo: data.url }
  }

  return { error: "Could not start Google sign-in." }
}

export async function signOut() {
  const supabase = createClient(await cookies())
  const { error } = await supabase.auth.signOut()
  if (error) {
    return { error: error.message }
  }
  revalidatePath("/", "layout")
  return { success: true as const }
}

export async function getViewerProfile(): Promise<Profile | null> {
  return getCurrentProfile()
}
