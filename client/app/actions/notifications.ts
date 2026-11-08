"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

import type { ActionResult } from "@/app/actions/account"
import { requireAuth } from "@/lib/auth"
import { createClient } from "@/utils/supabase/server"

export type NotificationIconKey = "bell" | "task" | "log" | "review"

export type NotificationRecord = {
  id: string
  title: string
  detail: string
  href: string
  iconKey: NotificationIconKey
  unread: boolean
  createdAt: string
}

export async function loadMyNotifications(): Promise<{
  error?: string
  notifications: NotificationRecord[]
}> {
  const profile = await requireAuth()
  const supabase = createClient(await cookies())
  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, detail, href, icon_key, unread, created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(40)

  if (error) return { error: error.message, notifications: [] }

  return {
    notifications: (data ?? []).map((row) => ({
      id: row.id as string,
      title: row.title as string,
      detail: (row.detail as string) ?? "",
      href: (row.href as string) ?? "",
      iconKey: (row.icon_key as NotificationIconKey) ?? "bell",
      unread: Boolean(row.unread),
      createdAt: row.created_at as string,
    })),
  }
}

export async function markNotificationRead(
  id: string
): Promise<ActionResult> {
  const profile = await requireAuth()
  const supabase = createClient(await cookies())
  const { error } = await supabase
    .from("notifications")
    .update({ unread: false })
    .eq("id", id)
    .eq("user_id", profile.id)
  if (error) return { error: error.message }
  revalidatePath(`/${profile.role}`)
  return {}
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const profile = await requireAuth()
  const supabase = createClient(await cookies())
  const { error } = await supabase
    .from("notifications")
    .update({ unread: false })
    .eq("user_id", profile.id)
    .eq("unread", true)
  if (error) return { error: error.message }
  revalidatePath(`/${profile.role}`)
  return {}
}
