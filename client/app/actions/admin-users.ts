"use server"

import { revalidatePath } from "next/cache"

import { requireRole } from "@/lib/auth"
import { createAdminClient } from "@/utils/supabase/admin"

export type CreateUserState = {
  error?: string
  success?: string
}

export async function createManagedUser(
  _prev: CreateUserState,
  formData: FormData
): Promise<CreateUserState> {
  await requireRole("admin")

  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")
  const fullName = String(formData.get("full_name") ?? "").trim()
  const roleRaw = String(formData.get("role") ?? "intern")
  const phone = String(formData.get("phone") ?? "").trim()
  const title = String(formData.get("title") ?? "").trim()
  const department = String(formData.get("department") ?? "").trim()

  const role =
    roleRaw === "admin" || roleRaw === "supervisor" || roleRaw === "intern"
      ? roleRaw
      : null

  if (!email || !password || !fullName || !role) {
    return { error: "Name, email, password, and role are required." }
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." }
  }

  let admin
  try {
    admin = createAdminClient()
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? err.message
          : "Service role key is not configured.",
    }
  }

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })

  if (createError || !created.user) {
    return {
      error: createError?.message ?? "Failed to create auth user.",
    }
  }

  const userId = created.user.id

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: fullName,
      email,
      phone,
      title,
      department,
      role,
      capacity: role === "supervisor" ? 5 : null,
      supervisor_status: role === "supervisor" ? "Active" : null,
      supervisor_start_date:
        role === "supervisor"
          ? new Date().toISOString().slice(0, 10)
          : null,
    })
    .eq("id", userId)

  if (profileError) {
    return {
      error: `User created but profile update failed: ${profileError.message}`,
    }
  }

  if (role === "intern") {
    const { error: internError } = await admin.from("interns").upsert(
      {
        id: userId,
        status: "Onboarding",
        progress: 0,
      },
      { onConflict: "id" }
    )

    if (internError) {
      return {
        error: `User created but intern record failed: ${internError.message}`,
      }
    }
  }

  const { error: settingsError } = await admin.from("user_settings").upsert(
    { user_id: userId },
    { onConflict: "user_id" }
  )

  if (settingsError) {
    return {
      error: `User created but settings row failed: ${settingsError.message}`,
    }
  }

  revalidatePath("/admin/interns")
  revalidatePath("/admin/supervisors")

  return {
    success: `Created ${role} account for ${email}.`,
  }
}
