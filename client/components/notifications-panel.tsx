"use client"

import { Bell, ClipboardCheck, ListTodo, NotebookPen } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Role } from "@/lib/nav"

type Notification = {
  id: string
  title: string
  detail: string
  time: string
  unread?: boolean
  icon: typeof Bell
  className: string
}

const notificationsByRole: Record<Role, Notification[]> = {
  intern: [
    {
      id: "1",
      title: "Task due today",
      detail: "Build intern overview page is due at 17:00.",
      time: "10m ago",
      unread: true,
      icon: ListTodo,
      className: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
    },
    {
      id: "2",
      title: "Daily log reminder",
      detail: "Submit your log before end of day.",
      time: "1h ago",
      unread: true,
      icon: NotebookPen,
      className: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    },
    {
      id: "3",
      title: "Feedback received",
      detail: "Jordan Peters left comments on your last task.",
      time: "Yesterday",
      icon: ClipboardCheck,
      className: "bg-teal-500/15 text-teal-700 dark:text-teal-400",
    },
  ],
  supervisor: [
    {
      id: "1",
      title: "Log awaiting review",
      detail: "Thabo submitted a daily log for review.",
      time: "20m ago",
      unread: true,
      icon: NotebookPen,
      className: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    },
    {
      id: "2",
      title: "Task marked complete",
      detail: "Amina finished “Fix login validation”.",
      time: "2h ago",
      unread: true,
      icon: ListTodo,
      className: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
    },
    {
      id: "3",
      title: "Review due",
      detail: "Mid-programme review for Sipho is due tomorrow.",
      time: "Yesterday",
      icon: ClipboardCheck,
      className: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
    },
  ],
  admin: [
    {
      id: "1",
      title: "New enrolments",
      detail: "4 applicants are waiting for approval.",
      time: "30m ago",
      unread: true,
      icon: Bell,
      className: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
    },
    {
      id: "2",
      title: "Programme checkpoint",
      detail: "Frontend Q4 intake kickoff is today.",
      time: "3h ago",
      unread: true,
      icon: ClipboardCheck,
      className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    },
    {
      id: "3",
      title: "Report ready",
      detail: "October summary can be exported from Reports.",
      time: "Yesterday",
      icon: ListTodo,
      className: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    },
  ],
}

export function NotificationsPanel({ role }: { role: Role }) {
  const items = notificationsByRole[role]

  return (
    <div className="flex flex-col gap-2 p-4">
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No notifications yet.
        </p>
      ) : (
        items.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.id}
              className={cn(
                "flex gap-3 rounded-sm border border-border p-3",
                item.unread && "bg-muted/40"
              )}
            >
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-sm",
                  item.className
                )}
              >
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{item.title}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {item.time}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.detail}
                </p>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
