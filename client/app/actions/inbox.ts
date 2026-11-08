"use server"

import { cookies } from "next/headers"

import { requireAuth } from "@/lib/auth"
import { createClient } from "@/utils/supabase/server"

export type InboxStatus = {
  unreadNotifications: number
  unreadMessages: number
  latestNotificationTitle: string | null
  latestNotificationDetail: string | null
}

export async function getInboxStatus(input?: {
  messagesAfterIso?: string | null
}): Promise<InboxStatus> {
  const profile = await requireAuth()
  const supabase = createClient(await cookies())

  const { count: unreadNotifications } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", profile.id)
    .eq("unread", true)

  const { data: latestNotification } = await supabase
    .from("notifications")
    .select("title, detail")
    .eq("user_id", profile.id)
    .eq("unread", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  let unreadMessages = 0
  if (profile.role === "intern" || profile.role === "supervisor") {
    const { data: parts } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", profile.id)

    const conversationIds = (parts ?? []).map(
      (row) => row.conversation_id as string
    )

    if (conversationIds.length > 0) {
      const after =
        input?.messagesAfterIso?.trim() ||
        new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .in("conversation_id", conversationIds)
        .neq("sender_id", profile.id)
        .gt("created_at", after)

      unreadMessages = count ?? 0
    }
  }

  return {
    unreadNotifications: unreadNotifications ?? 0,
    unreadMessages,
    latestNotificationTitle: (latestNotification?.title as string) ?? null,
    latestNotificationDetail: (latestNotification?.detail as string) ?? null,
  }
}
