"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Bell, ClipboardCheck, ListTodo, NotebookPen } from "lucide-react"

import {
  loadMyNotifications,
  markNotificationRead,
  type NotificationIconKey,
  type NotificationRecord,
} from "@/app/actions/notifications"
import { notifyInboxRefresh } from "@/components/inbox-provider"
import { cn } from "@/lib/utils"
import type { Role } from "@/lib/nav"

const ICON_MAP: Record<
  NotificationIconKey,
  { icon: typeof Bell; className: string }
> = {
  bell: {
    icon: Bell,
    className: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  },
  task: {
    icon: ListTodo,
    className: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  },
  log: {
    icon: NotebookPen,
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  },
  review: {
    icon: ClipboardCheck,
    className: "bg-teal-500/15 text-teal-700 dark:text-teal-400",
  },
}

function formatRelativeTime(iso: string) {
  const then = new Date(iso).getTime()
  const diffMs = Date.now() - then
  if (!Number.isFinite(diffMs) || diffMs < 0) return ""
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
  })
}

export function NotificationsPanel({ role }: { role: Role }) {
  const router = useRouter()
  const [items, setItems] = React.useState<NotificationRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError("")
      const result = await loadMyNotifications()
      if (cancelled) return
      if (result.error) setError(result.error)
      setItems(result.notifications)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [role])

  async function handleClick(item: NotificationRecord) {
    if (item.unread) {
      setItems((prev) =>
        prev.map((row) =>
          row.id === item.id ? { ...row, unread: false } : row
        )
      )
      await markNotificationRead(item.id)
      notifyInboxRefresh()
    }
    if (item.href) {
      router.push(item.href)
    }
  }

  if (loading) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Loading notifications…
      </p>
    )
  }

  if (error) {
    return (
      <p className="px-4 py-8 text-center text-sm text-destructive">{error}</p>
    )
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No notifications yet.
        </p>
      ) : (
        items.map((item) => {
          const meta = ICON_MAP[item.iconKey] ?? ICON_MAP.bell
          const Icon = meta.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClick(item)}
              className={cn(
                "flex gap-3 rounded-sm border border-border p-3 text-left transition-colors hover:bg-muted/30",
                item.unread && "bg-muted/40"
              )}
            >
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-sm",
                  meta.className
                )}
              >
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{item.title}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.detail}
                </p>
              </div>
            </button>
          )
        })
      )}
    </div>
  )
}
