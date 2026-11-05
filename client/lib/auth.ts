import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import type { Role } from "@/lib/nav"
import { createClient } from "@/utils/supabase/server"

export type Profile = {
  id: string
  full_name: string
  email: string
  phone: string
  title: string
  department: string
  avatar_url: string | null
  role: Role
}

export function dashboardPathForRole(role: Role) {
  return `/${role}`
}

export async function getSessionUser() {
  const supabase = createClient(await cookies())
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null
  return user
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient(await cookies())
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return null

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, phone, title, department, avatar_url, role"
    )
    .eq("id", user.id)
    .maybeSingle()

  if (error || !data) return null

  if (
    data.role !== "admin" &&
    data.role !== "supervisor" &&
    data.role !== "intern"
  ) {
    return null
  }

  return data as Profile
}

export async function requireAuth(): Promise<Profile> {
  const profile = await getCurrentProfile()
  if (!profile) redirect("/login")
  return profile
}

export async function requireRole(allowed: Role | Role[]): Promise<Profile> {
  const profile = await requireAuth()
  const roles = Array.isArray(allowed) ? allowed : [allowed]
  if (!roles.includes(profile.role)) {
    redirect(dashboardPathForRole(profile.role))
  }
  return profile
}
