"use client"

import * as React from "react"
import Link from "next/link"
import { addDays, format, isSameDay, parseISO, startOfDay } from "date-fns"
import {
  CalendarDays,
  ClipboardCheck,
  Flag,
  ListTodo,
  NotebookPen,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import type { Role } from "@/lib/nav"
import { cn } from "@/lib/utils"

type CalendarEventType = "task" | "meeting" | "log" | "milestone" | "review"

type CalendarEvent = {
  id: string
  title: string
  detail: string
  date: string
  time: string
  type: CalendarEventType
  href: string
}

const eventMeta: Record<
  CalendarEventType,
  { label: string; icon: typeof ListTodo; className: string }
> = {
  task: {
    label: "Task",
    icon: ListTodo,
    className: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  },
  meeting: {
    label: "1:1",
    icon: ClipboardCheck,
    className: "bg-teal-500/15 text-teal-700 dark:text-teal-400",
  },
  log: {
    label: "Daily log",
    icon: NotebookPen,
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  },
  milestone: {
    label: "Milestone",
    icon: Flag,
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  },
  review: {
    label: "Review",
    icon: ClipboardCheck,
    className: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  },
}

const internEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Build intern overview page",
    detail: "Due today · High priority",
    date: "2026-11-02",
    time: "17:00",
    type: "task",
    href: "/intern/tasks",
  },
  {
    id: "2",
    title: "Submit daily log",
    detail: "Reminder before end of day",
    date: "2026-11-02",
    time: "16:30",
    type: "log",
    href: "/intern/daily-log",
  },
  {
    id: "3",
    title: "1:1 with Jordan Peters",
    detail: "Mid-week check-in",
    date: "2026-11-04",
    time: "10:00",
    type: "meeting",
    href: "/intern/messages",
  },
  {
    id: "4",
    title: "Fix login form validation",
    detail: "Overdue follow-up",
    date: "2026-11-03",
    time: "12:00",
    type: "task",
    href: "/intern/tasks",
  },
  {
    id: "5",
    title: "Frontend module quiz",
    detail: "Programme milestone",
    date: "2026-11-06",
    time: "14:00",
    type: "milestone",
    href: "/intern/progress",
  },
  {
    id: "6",
    title: "Submit daily log",
    detail: "Reminder before end of day",
    date: "2026-11-05",
    time: "16:30",
    type: "log",
    href: "/intern/daily-log",
  },
  {
    id: "7",
    title: "Prepare demo walkthrough",
    detail: "Task · Medium priority",
    date: "2026-11-07",
    time: "15:00",
    type: "task",
    href: "/intern/tasks",
  },
]

const supervisorEvents: CalendarEvent[] = [
  {
    id: "s1",
    title: "Review Thabo's daily log",
    detail: "Pending feedback",
    date: "2026-11-02",
    time: "11:00",
    type: "log",
    href: "/supervisor/logs",
  },
  {
    id: "s2",
    title: "1:1 with Amina Ndlovu",
    detail: "Progress check-in",
    date: "2026-11-02",
    time: "14:30",
    type: "meeting",
    href: "/supervisor/messages",
  },
  {
    id: "s3",
    title: "Assign sprint tasks",
    detail: "Frontend cohort",
    date: "2026-11-03",
    time: "09:30",
    type: "task",
    href: "/supervisor/tasks",
  },
  {
    id: "s4",
    title: "Mid-programme review · Sipho",
    detail: "Written feedback due",
    date: "2026-11-04",
    time: "13:00",
    type: "review",
    href: "/supervisor/reviews",
  },
  {
    id: "s5",
    title: "1:1 with Jordan Peters",
    detail: "Mid-week check-in",
    date: "2026-11-04",
    time: "10:00",
    type: "meeting",
    href: "/supervisor/messages",
  },
  {
    id: "s6",
    title: "Approve overdue tasks",
    detail: "3 submissions waiting",
    date: "2026-11-05",
    time: "16:00",
    type: "task",
    href: "/supervisor/tasks",
  },
  {
    id: "s7",
    title: "Cohort milestone sync",
    detail: "Frontend module wrap-up",
    date: "2026-11-06",
    time: "15:00",
    type: "milestone",
    href: "/supervisor/interns",
  },
]

const adminEvents: CalendarEvent[] = [
  {
    id: "a1",
    title: "Enrol new intern cohort",
    detail: "12 applicants pending",
    date: "2026-11-02",
    time: "10:00",
    type: "task",
    href: "/admin/interns",
  },
  {
    id: "a2",
    title: "Programme kickoff · Frontend",
    detail: "Q4 intake starts",
    date: "2026-11-02",
    time: "14:00",
    type: "milestone",
    href: "/admin/programmes",
  },
  {
    id: "a3",
    title: "Assign supervisor coverage",
    detail: "Jordan Peters · 3 interns",
    date: "2026-11-03",
    time: "11:30",
    type: "task",
    href: "/admin/supervisors",
  },
  {
    id: "a4",
    title: "Weekly programme review",
    detail: "Attendance & completion",
    date: "2026-11-04",
    time: "09:00",
    type: "review",
    href: "/admin/reports",
  },
  {
    id: "a5",
    title: "Export monthly report",
    detail: "October summary",
    date: "2026-11-05",
    time: "16:00",
    type: "task",
    href: "/admin/reports",
  },
  {
    id: "a6",
    title: "Update programme settings",
    detail: "Log reminder window",
    date: "2026-11-06",
    time: "13:00",
    type: "task",
    href: "/admin/settings",
  },
  {
    id: "a7",
    title: "Mid-intake checkpoint",
    detail: "Frontend module milestone",
    date: "2026-11-07",
    time: "15:00",
    type: "milestone",
    href: "/admin/programmes",
  },
]

const eventsByRole: Record<Role, CalendarEvent[]> = {
  intern: internEvents,
  supervisor: supervisorEvents,
  admin: adminEvents,
}

export function CalendarDropdown({ role }: { role: Role }) {
  const [open, setOpen] = React.useState(false)
  const [today, setToday] = React.useState<Date | null>(null)
  const [selected, setSelected] = React.useState<Date | undefined>(undefined)
  const [month, setMonth] = React.useState<Date | undefined>(undefined)

  const events = eventsByRole[role]

  React.useEffect(() => {
    const now = startOfDay(new Date())
    setToday(now)
    setSelected(now)
    setMonth(now)
  }, [])

  function selectDate(date: Date) {
    setSelected(date)
    setMonth(date)
  }

  const eventDays = React.useMemo(
    () => events.map((event) => parseISO(event.date)),
    [events]
  )

  const presets = React.useMemo(() => {
    if (!today) return []
    return [
      { label: "Today", date: today },
      { label: "Tomorrow", date: addDays(today, 1) },
      { label: "In 3 days", date: addDays(today, 3) },
      { label: "In a week", date: addDays(today, 7) },
      { label: "In 2 weeks", date: addDays(today, 14) },
    ]
  }, [today])

  const selectedEvents = React.useMemo(() => {
    if (!selected) return []
    return events
      .filter((event) => isSameDay(parseISO(event.date), selected))
      .sort((a, b) => a.time.localeCompare(b.time))
  }, [events, selected])

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        aria-label="Calendar"
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "rounded-sm border border-border"
        )}
      >
        <CalendarDays />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-auto min-w-0 overflow-hidden rounded-sm p-0"
      >
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-row gap-1 overflow-x-auto border-b p-2 sm:w-36 sm:flex-col sm:overflow-visible sm:border-r sm:border-b-0">
            {presets.map((preset) => {
              const isActive =
                selected && isSameDay(selected, preset.date)

              return (
                <button
                  key={preset.label}
                  type="button"
                  className={cn(
                    buttonVariants({
                      variant: isActive ? "secondary" : "ghost",
                      size: "sm",
                    }),
                    "justify-start rounded-sm"
                  )}
                  onClick={() => selectDate(preset.date)}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>

          <div className="p-2">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={(date) => {
                if (date) selectDate(date)
                else setSelected(date)
              }}
              month={month}
              onMonthChange={setMonth}
              modifiers={{
                hasEvent: eventDays,
              }}
              modifiersClassNames={{
                hasEvent:
                  "relative after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-primary",
              }}
              className="rounded-sm"
            />
          </div>
        </div>

        <Separator />

        <div className="max-h-56 w-[min(100vw-2rem,24rem)] overflow-y-auto p-3 sm:w-[28rem]">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-medium">
              {selected ? format(selected, "EEE, d MMM yyyy") : "Select a day"}
            </p>
            <span className="text-xs text-muted-foreground">
              {selectedEvents.length} item
              {selectedEvents.length === 1 ? "" : "s"}
            </span>
          </div>

          {selectedEvents.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Nothing scheduled for this day.
            </p>
          ) : (
            <div className="grid gap-2">
              {selectedEvents.map((event) => {
                const meta = eventMeta[event.type]
                const Icon = meta.icon

                return (
                  <Link
                    key={event.id}
                    href={event.href}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 rounded-sm border border-border p-2.5 transition-colors hover:bg-muted/50"
                  >
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-sm",
                        meta.className
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{event.title}</p>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {event.time}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {meta.label} · {event.detail}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
