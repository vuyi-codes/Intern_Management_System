"use server"

import { cookies } from "next/headers"

import type { ActionResult } from "@/app/actions/account"
import { requireAuth, requireRole } from "@/lib/auth"
import { createClient } from "@/utils/supabase/server"

export type ChatAttachment = {
  name: string
  size: number
}

export type ChatMessageRecord = {
  id: string
  from: "me" | "them"
  text: string
  time: string
  sentAt: number
  edited?: boolean
  attachment?: ChatAttachment
  reactions: string[]
}

export type ConversationRecord = {
  id: string
  peerId: string
  name: string
  roleLabel: string
  preview: string
  messages: ChatMessageRecord[]
}

function formatTime(value: number) {
  return new Date(value).toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function mapMessage(
  row: {
    id: string
    sender_id: string
    body: string
    attachment_name: string | null
    attachment_size: number | null
    reactions: string[] | null
    edited_at: string | null
    created_at: string
  },
  myId: string
): ChatMessageRecord {
  const sentAt = new Date(row.created_at).getTime()
  return {
    id: row.id,
    from: row.sender_id === myId ? "me" : "them",
    text: row.body ?? "",
    time: formatTime(sentAt),
    sentAt,
    edited: Boolean(row.edited_at),
    attachment:
      row.attachment_name != null
        ? {
            name: row.attachment_name,
            size: row.attachment_size ?? 0,
          }
        : undefined,
    reactions: row.reactions ?? [],
  }
}

async function ensureDm(
  supabase: ReturnType<typeof createClient>,
  otherId: string
): Promise<{ id: string | null; error?: string }> {
  const { data, error } = await supabase.rpc("create_or_get_dm", {
    p_other_user_id: otherId,
  })
  if (error) return { id: null, error: error.message }
  if (!data) return { id: null, error: "Could not open conversation." }
  return { id: data as string }
}

async function loadConversationBundle(
  supabase: ReturnType<typeof createClient>,
  myId: string,
  conversationId: string,
  peer: { id: string; full_name: string; role: string }
): Promise<ConversationRecord> {
  const { data: messages } = await supabase
    .from("messages")
    .select(
      "id, sender_id, body, attachment_name, attachment_size, reactions, edited_at, created_at"
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  const mapped = (messages ?? []).map((row) =>
    mapMessage(
      row as {
        id: string
        sender_id: string
        body: string
        attachment_name: string | null
        attachment_size: number | null
        reactions: string[] | null
        edited_at: string | null
        created_at: string
      },
      myId
    )
  )
  const last = mapped[mapped.length - 1]

  return {
    id: conversationId,
    peerId: peer.id,
    name: peer.full_name,
    roleLabel: peer.role === "supervisor" ? "Supervisor" : "Intern",
    preview: last?.text || "No messages yet",
    messages: mapped,
  }
}

export async function loadMyConversations(): Promise<{
  error?: string
  conversations: ConversationRecord[]
}> {
  const profile = await requireRole(["intern", "supervisor"])
  const supabase = createClient(await cookies())
  const peers: { id: string; full_name: string; role: string }[] = []

  if (profile.role === "supervisor") {
    const { data: interns, error } = await supabase
      .from("interns")
      .select("id, profiles!interns_id_fkey(full_name, role)")
      .eq("supervisor_id", profile.id)
    if (error) return { error: error.message, conversations: [] }

    for (const row of interns ?? []) {
      const p = row.profiles as
        | { full_name: string; role: string }
        | { full_name: string; role: string }[]
        | null
      const peerProfile = Array.isArray(p) ? p[0] : p
      if (!peerProfile) continue
      peers.push({
        id: row.id as string,
        full_name: peerProfile.full_name,
        role: peerProfile.role,
      })
    }
  } else {
    const { data: intern, error } = await supabase
      .from("interns")
      .select("supervisor_id")
      .eq("id", profile.id)
      .maybeSingle()
    if (error) return { error: error.message, conversations: [] }
    if (intern?.supervisor_id) {
      const { data: supervisor } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("id", intern.supervisor_id)
        .maybeSingle()
      if (supervisor) {
        peers.push({
          id: supervisor.id as string,
          full_name: supervisor.full_name as string,
          role: supervisor.role as string,
        })
      }
    }
  }

  const conversations: ConversationRecord[] = []
  const ensureErrors: string[] = []
  for (const peer of peers) {
    const ensured = await ensureDm(supabase, peer.id)
    if (!ensured.id) {
      if (ensured.error) ensureErrors.push(`${peer.full_name}: ${ensured.error}`)
      continue
    }
    conversations.push(
      await loadConversationBundle(supabase, profile.id, ensured.id, peer)
    )
  }

  conversations.sort((a, b) => {
    const aTime = a.messages[a.messages.length - 1]?.sentAt ?? 0
    const bTime = b.messages[b.messages.length - 1]?.sentAt ?? 0
    return bTime - aTime
  })

  return {
    conversations,
    error: ensureErrors.length
      ? ensureErrors.join(" ")
      : undefined,
  }
}

export async function sendMessage(input: {
  conversationId: string
  text: string
  attachment?: ChatAttachment | null
}): Promise<ActionResult & { message?: ChatMessageRecord }> {
  const profile = await requireRole(["intern", "supervisor"])
  const text = input.text.trim()
  if (!text && !input.attachment) {
    return { error: "Message cannot be empty." }
  }

  const supabase = createClient(await cookies())
  const body =
    text || (input.attachment ? `Sent ${input.attachment.name}` : "")

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: input.conversationId,
      sender_id: profile.id,
      body,
      attachment_name: input.attachment?.name ?? null,
      attachment_size: input.attachment?.size ?? null,
    })
    .select(
      "id, sender_id, body, attachment_name, attachment_size, reactions, edited_at, created_at"
    )
    .single()

  if (error || !data) return { error: error?.message ?? "Failed to send." }

  return {
    message: mapMessage(
      data as {
        id: string
        sender_id: string
        body: string
        attachment_name: string | null
        attachment_size: number | null
        reactions: string[] | null
        edited_at: string | null
        created_at: string
      },
      profile.id
    ),
  }
}

export async function editMessage(input: {
  messageId: string
  text: string
}): Promise<ActionResult> {
  const profile = await requireRole(["intern", "supervisor"])
  const text = input.text.trim()
  if (!text) return { error: "Message cannot be empty." }

  const supabase = createClient(await cookies())
  const { data: existing, error: loadError } = await supabase
    .from("messages")
    .select("id, sender_id, created_at")
    .eq("id", input.messageId)
    .maybeSingle()
  if (loadError) return { error: loadError.message }
  if (!existing || existing.sender_id !== profile.id) {
    return { error: "Message not found." }
  }

  const age = Date.now() - new Date(existing.created_at as string).getTime()
  if (age > 10 * 60 * 1000) {
    return { error: "Edit window has expired." }
  }

  const { error } = await supabase
    .from("messages")
    .update({ body: text, edited_at: new Date().toISOString() })
    .eq("id", input.messageId)
    .eq("sender_id", profile.id)
  if (error) return { error: error.message }
  return {}
}

export async function deleteMessage(
  messageId: string
): Promise<ActionResult> {
  await requireRole(["intern", "supervisor"])
  const supabase = createClient(await cookies())
  const { error } = await supabase.from("messages").delete().eq("id", messageId)
  if (error) return { error: error.message }
  return {}
}

export async function restoreMessage(input: {
  conversationId: string
  message: ChatMessageRecord
}): Promise<ActionResult & { message?: ChatMessageRecord }> {
  const profile = await requireRole(["intern", "supervisor"])
  if (input.message.from !== "me") {
    return { error: "Can only restore your own messages." }
  }

  const supabase = createClient(await cookies())
  const { data, error } = await supabase
    .from("messages")
    .insert({
      id: input.message.id,
      conversation_id: input.conversationId,
      sender_id: profile.id,
      body: input.message.text,
      attachment_name: input.message.attachment?.name ?? null,
      attachment_size: input.message.attachment?.size ?? null,
      reactions: input.message.reactions,
      edited_at: input.message.edited ? new Date().toISOString() : null,
      created_at: new Date(input.message.sentAt).toISOString(),
    })
    .select(
      "id, sender_id, body, attachment_name, attachment_size, reactions, edited_at, created_at"
    )
    .single()

  if (error || !data) return { error: error?.message ?? "Failed to restore." }

  return {
    message: mapMessage(
      data as {
        id: string
        sender_id: string
        body: string
        attachment_name: string | null
        attachment_size: number | null
        reactions: string[] | null
        edited_at: string | null
        created_at: string
      },
      profile.id
    ),
  }
}

export async function setMessageReactions(input: {
  messageId: string
  reactions: string[]
}): Promise<ActionResult> {
  await requireRole(["intern", "supervisor"])
  const supabase = createClient(await cookies())
  const { error } = await supabase
    .from("messages")
    .update({ reactions: input.reactions })
    .eq("id", input.messageId)
  if (error) return { error: error.message }
  return {}
}

export async function deleteConversation(
  conversationId: string
): Promise<ActionResult> {
  await requireRole(["intern", "supervisor"])
  const supabase = createClient(await cookies())
  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId)
  if (error) return { error: error.message }
  return {}
}
