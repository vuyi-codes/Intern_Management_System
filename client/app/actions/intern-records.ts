"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

import { requireRole } from "@/lib/auth"
import type { InternProfileDetails } from "@/lib/intern-profile"
import type { TaskStatus } from "@/lib/tasks"
import { createClient } from "@/utils/supabase/server"

export type ActionResult = {
  error?: string
}

function refreshIntern() {
  revalidatePath("/intern")
  revalidatePath("/intern/tasks")
  revalidatePath("/intern/daily-log")
  revalidatePath("/intern/progress")
  revalidatePath("/intern/profile")
}

export async function updateOwnTaskStatus(
  id: string,
  status: TaskStatus
): Promise<ActionResult> {
  const profile = await requireRole("intern")
  const supabase = createClient(await cookies())
  const { error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", id)
    .eq("intern_id", profile.id)
  if (error) return { error: error.message }
  refreshIntern()
  return {}
}

export async function createDailyLog(input: {
  date: string
  hours: number
  summary: string
  blockers: string
  tomorrow: string
}): Promise<ActionResult> {
  const profile = await requireRole("intern")
  if (!input.date || !input.summary.trim() || !(input.hours > 0)) {
    return { error: "Date, summary, and valid hours are required." }
  }

  const supabase = createClient(await cookies())
  const { error } = await supabase.from("daily_logs").insert({
    intern_id: profile.id,
    log_date: input.date,
    hours: input.hours,
    summary: input.summary.trim(),
    blockers: input.blockers.trim() || "None.",
    tomorrow: input.tomorrow.trim(),
    status: "Submitted",
    mentor_note: "",
    reviewed_by: null,
  })
  if (error) return { error: error.message }
  refreshIntern()
  return {}
}

export async function updateDailyLog(input: {
  id: string
  date: string
  hours: number
  summary: string
  blockers: string
  tomorrow: string
}): Promise<ActionResult> {
  const profile = await requireRole("intern")
  if (!input.date || !input.summary.trim() || !(input.hours > 0)) {
    return { error: "Date, summary, and valid hours are required." }
  }

  const supabase = createClient(await cookies())
  const { error } = await supabase
    .from("daily_logs")
    .update({
      log_date: input.date,
      hours: input.hours,
      summary: input.summary.trim(),
      blockers: input.blockers.trim() || "None.",
      tomorrow: input.tomorrow.trim(),
    })
    .eq("id", input.id)
    .eq("intern_id", profile.id)
  if (error) return { error: error.message }
  refreshIntern()
  return {}
}

export async function deleteDailyLog(id: string): Promise<ActionResult> {
  const profile = await requireRole("intern")
  const supabase = createClient(await cookies())
  const { error } = await supabase
    .from("daily_logs")
    .delete()
    .eq("id", id)
    .eq("intern_id", profile.id)
  if (error) return { error: error.message }
  refreshIntern()
  return {}
}

export async function saveInternProfileDetails(
  details: InternProfileDetails
): Promise<ActionResult> {
  const profile = await requireRole("intern")
  const supabase = createClient(await cookies())
  const { error } = await supabase.from("intern_profiles").upsert({
    user_id: profile.id,
    bio: details.bio.trim(),
    skills: details.skills,
    location: details.location.trim(),
    university: details.university.trim(),
    linkedin: details.linkedin.trim(),
    github: details.github.trim(),
    emergency_name: details.emergencyName.trim(),
    emergency_phone: details.emergencyPhone.trim(),
  })
  if (error) return { error: error.message }
  revalidatePath("/intern/profile")
  return {}
}
