import { getInternsForSupervisor } from "@/lib/interns"

export type DailyLogStatus = "Submitted" | "Reviewed" | "Flagged"

export type DailyLog = {
  id: string
  intern: string
  date: string
  hours: number
  summary: string
  blockers: string
  tomorrow: string
  status: DailyLogStatus
  mentorNote: string
}

export const DAILY_LOG_STATUS_STYLES: Record<DailyLogStatus, string> = {
  Submitted: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  Reviewed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  Flagged: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
}

export const dailyLogs: DailyLog[] = [
  {
    id: "log-001",
    intern: "Nomsa Khumalo",
    date: "2026-04-03",
    hours: 7.5,
    summary:
      "Finished overview stats cards and started wiring the activity feed.",
    blockers: "Need final copy for empty activity states.",
    tomorrow: "Complete activity feed and open a PR for review.",
    status: "Submitted",
    mentorNote: "",
  },
  {
    id: "log-002",
    intern: "Ethan Jacobs",
    date: "2026-04-03",
    hours: 8,
    summary:
      "Polished shared button spacing and documented token usage examples.",
    blockers: "Waiting on design confirmation for dense table rows.",
    tomorrow: "Apply the same spacing pass to form fields.",
    status: "Submitted",
    mentorNote: "",
  },
  {
    id: "log-003",
    intern: "Lerato Dlamini",
    date: "2026-04-02",
    hours: 6.5,
    summary:
      "Documented auth middleware usage and prepared the review package.",
    blockers: "None.",
    tomorrow: "Respond to mentor feedback on the middleware PR.",
    status: "Reviewed",
    mentorNote: "Clear write-up. Add one sequence diagram next time.",
  },
  {
    id: "log-004",
    intern: "Zanele Botha",
    date: "2026-04-02",
    hours: 7,
    summary: "Extended seed fixtures for programmes and sample tasks.",
    blockers: "Seed script still fails on duplicate emails in local resets.",
    tomorrow: "Fix duplicate-key handling and cover with a test.",
    status: "Flagged",
    mentorNote: "Flagged until the seed reset issue is resolved.",
  },
  {
    id: "log-005",
    intern: "Nomsa Khumalo",
    date: "2026-04-02",
    hours: 7,
    summary: "Implemented responsive chart layout and cleaned unused imports.",
    blockers: "Pie chart legend overlaps on narrow widths.",
    tomorrow: "Fix legend wrap and push a preview build.",
    status: "Reviewed",
    mentorNote: "Good progress. Keep screenshots in the next log.",
  },
  {
    id: "log-006",
    intern: "Zanele Botha",
    date: "2026-04-01",
    hours: 8,
    summary: "Wrote integration tests for enrolment edge cases.",
    blockers: "One flaky test around date parsing.",
    tomorrow: "Stabilize the flaky test and submit for review.",
    status: "Submitted",
    mentorNote: "",
  },
  {
    id: "log-007",
    intern: "Ethan Jacobs",
    date: "2026-04-01",
    hours: 6,
    summary: "Started login validation improvements and error messaging.",
    blockers: "Need product wording for invalid credentials.",
    tomorrow: "Finish validation states and request review.",
    status: "Reviewed",
    mentorNote: "Nice pacing. Ship the wording draft with the PR.",
  },
  {
    id: "log-008",
    intern: "Lerato Dlamini",
    date: "2026-03-31",
    hours: 7.5,
    summary: "Completed onboarding checklist and first-week reflection.",
    blockers: "None.",
    tomorrow: "Start auth middleware implementation.",
    status: "Reviewed",
    mentorNote: "Strong first-week log. Keep this format.",
  },
  {
    id: "log-009",
    intern: "Amina Ndlovu",
    date: "2026-03-20",
    hours: 5,
    summary: "Wrapped frontend module notes and prepared final quiz review.",
    blockers: "None.",
    tomorrow: "Submit final module package.",
    status: "Reviewed",
    mentorNote: "Good close-out log for the completed track.",
  },
  {
    id: "log-010",
    intern: "Nomsa Khumalo",
    date: "2026-04-03",
    hours: 1.5,
    summary: "Short afternoon sync notes after standup.",
    blockers: "Blocked on design copy.",
    tomorrow: "Continue activity feed once copy arrives.",
    status: "Flagged",
    mentorNote: "Hours look low — confirm if this was a partial day.",
  },
]

export function formatLogDate(value: string) {
  return new Date(value).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function getDailyLogsForSupervisor(supervisorName: string) {
  const assignedNames = new Set(
    getInternsForSupervisor(supervisorName).map((intern) => intern.name)
  )
  return dailyLogs
    .filter((log) => assignedNames.has(log.intern))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function isSameLogDay(value: string, reference = new Date()) {
  const date = new Date(value)
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  )
}
