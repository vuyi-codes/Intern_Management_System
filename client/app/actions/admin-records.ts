"use server"

import { randomBytes } from "crypto"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

import { requireRole } from "@/lib/auth"
import type { InternStatus } from "@/lib/interns"
import type { ProgrammeStatus } from "@/lib/programmes"
import type { RoleSettings } from "@/lib/settings"
import type { SupervisorStatus } from "@/lib/supervisors"
import type { Json } from "@/types/database"
import { createAdminClient } from "@/utils/supabase/admin"
import { createClient } from "@/utils/supabase/server"

export type ActionResult = {
  error?: string
  temporaryPassword?: string
}

function refreshAdmin() {
  revalidatePath("/admin")
  revalidatePath("/admin/interns")
  revalidatePath("/admin/supervisors")
  revalidatePath("/admin/programmes")
  revalidatePath("/admin/reports")
}

async function syncAuthEmail(id: string, email: string): Promise<string | undefined> {
  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    return err instanceof Error ? err.message : "Service role key is not configured."
  }
  const { error } = await admin.auth.admin.updateUserById(id, {
    email,
    email_confirm: true,
  })
  return error?.message
}

function temporaryPassword() {
  return randomBytes(9).toString("base64url")
}

export async function enrolIntern(input: {
  name: string
  email: string
  programmeId: string
  supervisorId: string
  startDate: string
  endDate: string
  status: InternStatus
}): Promise<ActionResult> {
  await requireRole("admin")
  const email = input.email.trim().toLowerCase()
  const name = input.name.trim()
  if (!email || !name || !input.startDate) {
    return { error: "Name, email, and start date are required." }
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Service role key is not configured." }
  }

  const password = temporaryPassword()
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  })
  if (error || !data.user) {
    return { error: error?.message ?? "Could not create the intern account." }
  }

  const userId = data.user.id
  const { error: profileError } = await admin
    .from("profiles")
    .update({ full_name: name, email, role: "intern", title: "Intern" })
    .eq("id", userId)
  if (profileError) {
    return { error: profileError.message }
  }

  const { error: internError } = await admin.from("interns").upsert({
    id: userId,
    programme_id: input.programmeId || null,
    supervisor_id: input.supervisorId || null,
    start_date: input.startDate,
    end_date: input.endDate || input.startDate,
    status: input.status,
    progress: 0,
  })
  if (internError) return { error: internError.message }

  refreshAdmin()
  return { temporaryPassword: password }
}

export async function updateIntern(input: {
  id: string
  name: string
  email: string
  programmeId: string
  supervisorId: string
  startDate: string
  endDate: string
  status: InternStatus
}): Promise<ActionResult> {
  await requireRole("admin")
  const supabase = createClient(await cookies())
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: input.name.trim(), email: input.email.trim().toLowerCase() })
    .eq("id", input.id)
  if (profileError) return { error: profileError.message }
  const emailError = await syncAuthEmail(input.id, input.email.trim().toLowerCase())
  if (emailError) return { error: emailError }

  const { error } = await supabase
    .from("interns")
    .update({
      programme_id: input.programmeId || null,
      supervisor_id: input.supervisorId || null,
      start_date: input.startDate,
      end_date: input.endDate || input.startDate,
      status: input.status,
    })
    .eq("id", input.id)
  if (error) return { error: error.message }

  refreshAdmin()
  return {}
}

export async function updateInternStatus(
  id: string,
  status: InternStatus
): Promise<ActionResult> {
  await requireRole("admin")
  const supabase = createClient(await cookies())
  const { error } = await supabase.from("interns").update({ status }).eq("id", id)
  if (error) return { error: error.message }
  refreshAdmin()
  return {}
}

export async function deleteIntern(id: string): Promise<ActionResult> {
  await requireRole("admin")
  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Service role key is not configured." }
  }
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) return { error: error.message }
  refreshAdmin()
  return {}
}

export async function addSupervisor(input: {
  name: string
  email: string
  phone: string
  title: string
  department: string
  programmeIds: string[]
  capacity: number
  startDate: string
  status: SupervisorStatus
}): Promise<ActionResult> {
  await requireRole("admin")
  const email = input.email.trim().toLowerCase()
  const name = input.name.trim()
  if (!email || !name || !input.startDate) {
    return { error: "Name, email, and start date are required." }
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Service role key is not configured." }
  }

  const password = temporaryPassword()
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  })
  if (error || !data.user) {
    return { error: error?.message ?? "Could not create the supervisor account." }
  }

  const userId = data.user.id
  const { error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: name,
      email,
      phone: input.phone.trim(),
      title: input.title.trim() || "Internship Supervisor",
      department: input.department,
      role: "supervisor",
      capacity: input.capacity,
      supervisor_status: input.status,
      supervisor_start_date: input.startDate,
    })
    .eq("id", userId)
  if (profileError) return { error: profileError.message }

  if (input.programmeIds.length > 0) {
    const { error: linkError } = await admin.from("supervisor_programmes").insert(
      input.programmeIds.map((programmeId) => ({
        supervisor_id: userId,
        programme_id: programmeId,
      }))
    )
    if (linkError) return { error: linkError.message }
  }

  refreshAdmin()
  return { temporaryPassword: password }
}

export async function updateSupervisor(input: {
  id: string
  name: string
  email: string
  phone: string
  title: string
  department: string
  programmeIds: string[]
  capacity: number
  startDate: string
  status: SupervisorStatus
}): Promise<ActionResult> {
  await requireRole("admin")
  const supabase = createClient(await cookies())
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      title: input.title.trim(),
      department: input.department,
      capacity: input.capacity,
      supervisor_status: input.status,
      supervisor_start_date: input.startDate,
    })
    .eq("id", input.id)
  if (profileError) return { error: profileError.message }
  const emailError = await syncAuthEmail(input.id, input.email.trim().toLowerCase())
  if (emailError) return { error: emailError }

  const { error: deleteError } = await supabase
    .from("supervisor_programmes")
    .delete()
    .eq("supervisor_id", input.id)
  if (deleteError) return { error: deleteError.message }

  if (input.programmeIds.length > 0) {
    const { error: linkError } = await supabase.from("supervisor_programmes").insert(
      input.programmeIds.map((programmeId) => ({
        supervisor_id: input.id,
        programme_id: programmeId,
      }))
    )
    if (linkError) return { error: linkError.message }
  }

  refreshAdmin()
  return {}
}

export async function updateSupervisorStatus(
  id: string,
  status: SupervisorStatus
): Promise<ActionResult> {
  await requireRole("admin")
  const supabase = createClient(await cookies())
  const { error } = await supabase
    .from("profiles")
    .update({ supervisor_status: status })
    .eq("id", id)
  if (error) return { error: error.message }
  refreshAdmin()
  return {}
}

export async function deleteSupervisor(id: string): Promise<ActionResult> {
  await requireRole("admin")
  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Service role key is not configured." }
  }
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) return { error: error.message }
  refreshAdmin()
  return {}
}

export async function saveProgramme(input: {
  id?: string
  name: string
  cohort: string
  description: string
  leadId: string
  startDate: string
  endDate: string
  capacity: number
  status: ProgrammeStatus
}): Promise<ActionResult> {
  await requireRole("admin")
  if (!input.name.trim() || !input.cohort.trim() || !input.startDate || !input.endDate) {
    return { error: "Name, cohort, and dates are required." }
  }

  const supabase = createClient(await cookies())
  const row = {
    name: input.name.trim(),
    cohort: input.cohort.trim(),
    description: input.description.trim(),
    lead_supervisor_id: input.leadId || null,
    start_date: input.startDate,
    end_date: input.endDate,
    capacity: input.capacity,
    status: input.status,
  }

  const { error } = input.id
    ? await supabase.from("programmes").update(row).eq("id", input.id)
    : await supabase.from("programmes").insert(row)
  if (error) return { error: error.message }
  refreshAdmin()
  return {}
}

export async function updateProgrammeStatus(
  id: string,
  status: ProgrammeStatus
): Promise<ActionResult> {
  await requireRole("admin")
  const supabase = createClient(await cookies())
  const { error } = await supabase.from("programmes").update({ status }).eq("id", id)
  if (error) return { error: error.message }
  refreshAdmin()
  return {}
}

export async function deleteProgramme(id: string): Promise<ActionResult> {
  await requireRole("admin")
  const supabase = createClient(await cookies())
  const { error } = await supabase.from("programmes").delete().eq("id", id)
  if (error) return { error: error.message }
  refreshAdmin()
  return {}
}

export async function saveAdminSettings(
  settings: RoleSettings
): Promise<ActionResult> {
  const profile = await requireRole("admin")
  const supabase = createClient(await cookies())
  const { error: userError } = await supabase.from("user_settings").upsert({
    user_id: profile.id,
    notifications: settings.notifications as Json,
    preferences: settings.preferences as Json,
    privacy: settings.privacy as Json,
  })
  if (userError) return { error: userError.message }

  if (settings.organisation) {
    const org = settings.organisation
    const { error } = await supabase
      .from("org_settings")
      .update({
        organisation_name: org.organisationName,
        default_intern_capacity: org.defaultInternCapacity,
        require_enrolment_approval: org.requireEnrolmentApproval,
        log_reminder_hour: org.logReminderHour,
        report_retention_days: org.reportRetentionDays,
      })
      .eq("id", true)
    if (error) return { error: error.message }
  }

  revalidatePath("/admin/settings")
  return {}
}

