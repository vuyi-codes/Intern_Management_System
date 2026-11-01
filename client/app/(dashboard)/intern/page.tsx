import Link from "next/link"
import {
  ListTodo,
  NotebookPen,
  TrendingUp,
  User,
} from "lucide-react"

import { InternOverviewChart } from "@/components/dashboard-charts"
import { InternTasksTable } from "@/components/intern-tasks-table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const stats = [
  {
    title: "My Tasks",
    value: "7",
    description: "2 due this week",
    href: "/intern/tasks",
    icon: ListTodo,
  },
  {
    title: "Daily Log",
    value: "18",
    description: "Entries this month",
    href: "/intern/daily-log",
    icon: NotebookPen,
  },
  {
    title: "Progress",
    value: "64%",
    description: "Programme completion",
    href: "/intern/progress",
    icon: TrendingUp,
  },
  {
    title: "Profile",
    value: "1",
    description: "Profile to keep updated",
    href: "/intern/profile",
    icon: User,
  },
]

const recentActivity = [
  {
    title: "Task marked in progress",
    detail: "Build intern overview page",
    time: "1h ago",
    href: "/intern/tasks",
  },
  {
    title: "Daily log submitted",
    detail: "Worked on dashboard layout and nav stubs",
    time: "Yesterday",
    href: "/intern/daily-log",
  },
  {
    title: "Progress updated",
    detail: "Frontend module — 64% complete",
    time: "2 days ago",
    href: "/intern/progress",
  },
]

export default function InternPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Intern Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Track your tasks, daily logs, and programme progress.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href} className="block">
            <Card size="sm" className="h-full transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div className="grid gap-1">
                  <CardDescription>{stat.title}</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums">
                    {stat.value}
                  </CardTitle>
                </div>
                <div className="flex size-8 items-center justify-center rounded-sm bg-muted text-muted-foreground">
                  <stat.icon className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[3fr_2fr]">
        <div className="min-w-0">
          <InternOverviewChart />
        </div>

        <Card className="min-w-0 h-full">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              Your latest tasks, logs, and progress updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-0">
            {recentActivity.map((item, index) => (
              <div key={item.title}>
                {index > 0 && <Separator />}
                <div className="flex items-start justify-between gap-4 py-3">
                  <div className="grid gap-0.5">
                    <Link
                      href={item.href}
                      className="text-sm font-medium hover:underline"
                    >
                      {item.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <InternTasksTable />
    </div>
  )
}
