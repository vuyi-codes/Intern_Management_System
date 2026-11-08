"use client"

import * as React from "react"
import { Bell, MessageCircle, X } from "lucide-react"

import { getInboxStatus } from "@/app/actions/inbox"
import { cn } from "@/lib/utils"

const MESSAGES_SEEN_KEY = "inkdot-messages-seen-at"
const TOAST_SESSION_KEY = "inkdot-inbox-toast-shown"

type InboxContextValue = {
  unreadNotifications: number
  unreadMessages: number
  refreshInbox: () => Promise<void>
  markMessagesSeen: () => void
}

const InboxContext = React.createContext<InboxContextValue | null>(null)

export function useInbox() {
  const value = React.useContext(InboxContext)
  if (!value) {
    return {
      unreadNotifications: 0,
      unreadMessages: 0,
      refreshInbox: async () => {},
      markMessagesSeen: () => {},
    }
  }
  return value
}

function readMessagesSeenAt() {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(MESSAGES_SEEN_KEY)
  } catch {
    return null
  }
}

function writeMessagesSeenAt(iso: string) {
  try {
    localStorage.setItem(MESSAGES_SEEN_KEY, iso)
  } catch {
    // ignore
  }
}

type ToastState = {
  title: string
  detail: string
  kind: "notification" | "message" | "both"
}

export function InboxProvider({ children }: { children: React.ReactNode }) {
  const [unreadNotifications, setUnreadNotifications] = React.useState(0)
  const [unreadMessages, setUnreadMessages] = React.useState(0)
  const [toast, setToast] = React.useState<ToastState | null>(null)
  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const refreshInbox = React.useCallback(async () => {
    const status = await getInboxStatus({
      messagesAfterIso: readMessagesSeenAt(),
    })
    setUnreadNotifications(status.unreadNotifications)
    setUnreadMessages(status.unreadMessages)

    if (typeof window === "undefined") return
    try {
      if (sessionStorage.getItem(TOAST_SESSION_KEY)) return
    } catch {
      return
    }

    const hasNotifications = status.unreadNotifications > 0
    const hasMessages = status.unreadMessages > 0
    if (!hasNotifications && !hasMessages) return

    try {
      sessionStorage.setItem(TOAST_SESSION_KEY, "1")
    } catch {
      // ignore
    }

    let next: ToastState
    if (hasNotifications && hasMessages) {
      next = {
        kind: "both",
        title: "New activity",
        detail: `${status.unreadNotifications} notification${status.unreadNotifications === 1 ? "" : "s"} · ${status.unreadMessages} message${status.unreadMessages === 1 ? "" : "s"}`,
      }
    } else if (hasNotifications) {
      next = {
        kind: "notification",
        title:
          status.latestNotificationTitle ??
          `${status.unreadNotifications} unread notification${status.unreadNotifications === 1 ? "" : "s"}`,
        detail:
          status.latestNotificationDetail ||
          "Open notifications to catch up.",
      }
    } else {
      next = {
        kind: "message",
        title: "New messages",
        detail: `You have ${status.unreadMessages} unread message${status.unreadMessages === 1 ? "" : "s"}.`,
      }
    }

    setToast(next)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 4500)
  }, [])

  const markMessagesSeen = React.useCallback(() => {
    writeMessagesSeenAt(new Date().toISOString())
    setUnreadMessages(0)
    void refreshInbox()
  }, [refreshInbox])

  React.useEffect(() => {
    void refreshInbox()
    const intervalId = setInterval(() => {
      void refreshInbox()
    }, 30_000)

    function onRefresh() {
      void refreshInbox()
    }
    window.addEventListener("inkdot-inbox-refresh", onRefresh)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener("inkdot-inbox-refresh", onRefresh)
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [refreshInbox])

  const value = React.useMemo(
    () => ({
      unreadNotifications,
      unreadMessages,
      refreshInbox,
      markMessagesSeen,
    }),
    [unreadNotifications, unreadMessages, refreshInbox, markMessagesSeen]
  )

  return (
    <InboxContext.Provider value={value}>
      {children}
      {toast ? (
        <div
          className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
          role="status"
          aria-live="polite"
        >
          <div className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-sm border border-border bg-background px-3 py-3 shadow-lg">
            <div
              className={cn(
                "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-sm",
                toast.kind === "message"
                  ? "bg-sky-500/15 text-sky-700 dark:text-sky-400"
                  : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
              )}
            >
              {toast.kind === "message" ? (
                <MessageCircle className="size-4" />
              ) : (
                <Bell className="size-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{toast.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {toast.detail}
              </p>
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              className="shrink-0 rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setToast(null)}
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      ) : null}
    </InboxContext.Provider>
  )
}

export function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
      {count > 99 ? "99+" : count}
    </span>
  )
}

export function notifyInboxRefresh() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event("inkdot-inbox-refresh"))
}
