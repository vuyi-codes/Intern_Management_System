"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

import { requireRole } from "@/lib/auth"
import type { DailyLogStatus } from "@/lib/daily-logs"
import type { InternStatus } from "@/lib/interns"
import type { ReviewOutcome, ReviewStatus } from "@/lib/reviews"
import type { TaskPriority, TaskStatus } from "@/lib/tasks"
import { createClient } from "@/utils/supabase/server"

export type ActionResult = {
  error?: string
}

function refreshSupervisor() {
  revalidatePath("/supervisor")
  revalidatePath("/supervisor/interns")
  revalidatePath("/supervisor/tasks")
  revalidatePath("/supervisor/logs")
  revalidatePath("/supervisor/reviews")
}

async function assertOwnsIntern(internId: string, supervisorId: string) {
  const supabase = createClient(await cookies())
  const { data, error } = await supabase
    .from("interns")
    .select("id")
    .eq("id", internId)
    .eq("supervisor_id", supervisorId)
    .maybeSingle()
  if (error) return error.message
  if (!data) return "That intern is not assigned to you."
  return null
}

export async function updateAssignedInternStatus(
  id: string,
  status: InternStatus
): Promise<ActionResult> {
  const profile = await requireRole("supervisor")
  const ownershipError = await assertOwnsIntern(id, profile.id)
  if (ownershipError) return { error: ownershipError }

  const supabase = createClient(await cookies())
  const { error } = await supabase.from("interns").update({ status }).eq("id", id)
  if (error) return { error: error.message }
  refreshSupervisor()
  return {}
}

export async function assignTask(input: {
  title: string
  description: string
  internId: string
  dueDate: string
  priority: TaskPriority
  status: TaskStatus
}): Promise<ActionResult> {
  const profile = await requireRole("supervisor")
  if (!input.title.trim() || !input.internId || !input.dueDate) {
    return { error: "Title, intern, and due date are required." }
  }
  const ownershipError = await assertOwnsIntern(input.internId, profile.id)
  if (ownershipError) return { error: ownershipError }

  const supabase = createClient(await cookies())
  const { error } = await supabase.from("tasks").insert({
    title: input.title.trim(),
    description: input.description.trim(),
    intern_id: input.internId,
    assigned_by: profile.id,
    due_date: input.dueDate,
    priority: input.priority,
    status: input.status,
  })
  if (error) return { error: error.message }
  refreshSupervisor()
  return {}
}

export async function updateTask(input: {
  id: string
  title: string
  description: string
  internId: string
  dueDate: string
  priority: TaskPriority
  status: TaskStatus
}): Promise<ActionResult> {
  const profile = await requireRole("supervisor")
  const ownershipError = await assertOwnsIntern(input.internId, profile.id)
  if (ownershipError) return { error: ownershipError }

  const supabase = createClient(await cookies())
  const { error } = await supabase
    .from("tasks")
    .update({
      title: input.title.trim(),
      description: input.description.trim(),
      intern_id: input.internId,
      due_date: input.dueDate,
      priority: input.priority,
      status: input.status,
    })
    .eq("id", input.id)
  if (error) return { error: error.message }
  refreshSupervisor()
  return {}
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus
): Promise<ActionResult> {
  await requireRole("supervisor")
  const supabase = createClient(await cookies())
  const { error } = await supabase.from("tasks").update({ status }).eq("id", id)
  if (error) return { error: error.message }
  refreshSupervisor()
  return {}
}

export async function deleteTask(id: string): Promise<ActionResult> {
  await requireRole("supervisor")
  const supabase = createClient(await cookies())
  const { error } = await supabase.from("tasks").delete().eq("id", id)
  if (error) return { error: error.message }
  refreshSupervisor()
  return {}
}

export async function updateDailyLogReview(input: {
  id: string
  status: DailyLogStatus
  mentorNote: string
}): Promise<ActionResult> {
  const profile = await requireRole("supervisor")
  const supabase = createClient(await cookies())
  const { error } = await supabase
    .from("daily_logs")
    .update({
      status: input.status,
      mentor_note: input.mentorNote.trim(),
      reviewed_by: profile.id,
    })
    .eq("id", input.id)
  if (error) return { error: error.message }
  refreshSupervisor()
  return {}
}

export async function updateDailyLogStatus(
  id: string,
  status: DailyLogStatus
): Promise<ActionResult> {
  const profile = await requireRole("supervisor")
  const supabase = createClient(await cookies())
  const { error } = await supabase
    .from("daily_logs")
    .update({
      status,
      reviewed_by: profile.id,
    })
    .eq("id", id)
  if (error) return { error: error.message }
  refreshSupervisor()
  return {}
}

export async function updateReviewStatus(
  id: string,
  status: ReviewStatus,
  outcome?: ReviewOutcome
): Promise<ActionResult> {
  await requireRole("supervisor")
  const supabase = createClient(await cookies())
  const patch: { status: ReviewStatus; outcome?: ReviewOutcome } = { status }
  if (outcome) patch.outcome = outcome
  const { error } = await supabase.from("reviews").update(patch).eq("id", id)
  if (error) return { error: error.message }
  refreshSupervisor()
  return {}
}

export async function submitReviewFeedback(input: {
  id: string
  feedback: string
  outcome: ReviewOutcome
}): Promise<ActionResult> {
  const profile = await requireRole("supervisor")
  if (!input.feedback.trim()) return { error: "Feedback is required." }

  const supabase = createClient(await cookies())
  const { error } = await supabase
    .from("reviews")
    .update({
      feedback: input.feedback.trim(),
      outcome: input.outcome,
      status: "Completed",
      reviewer_id: profile.id,
    })
    .eq("id", input.id)
  if (error) return { error: error.message }
  refreshSupervisor()
  return {}
}
