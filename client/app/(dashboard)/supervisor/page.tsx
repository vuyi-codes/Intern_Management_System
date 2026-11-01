import Link from "next/link"
import {
  ClipboardCheck,
  ListTodo,
  ScrollText,
  Users,
} from "lucide-react"

import {
  SupervisorOverviewBarChart,
  SupervisorOverviewPieChart,
} from "@/components/dashboard-charts"
import { SupervisorTasksTable } from "@/components/supervisor-tasks-table"
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
    title: "My Interns",
    value: "8",
    description: "Assigned to you",
    href: "/supervisor/interns",
    icon: Users,
  },
  {
    title: "Open Tasks",
    value: "14",
    description: "Across your interns",
    href: "/supervisor/tasks",
    icon: ListTodo,
  },
  {
    title: "Pending Reviews",
    value: "5",
    description: "Awaiting your feedback",
    href: "/supervisor/reviews",
    icon: ClipboardCheck,
  },
  {
    title: "Daily Logs",
    value: "3",
    description: "Submitted today",
    href: "/supervisor/logs",
    icon: ScrollText,
  },
]

const recentActivity = [
  {
    title: "Thabo Molefe submitted a daily log",
    detail: "Frontend sprint — component library work",
    time: "2h ago",
    href: "/supervisor/logs",
  },
  {
    title: "Task ready for review",
    detail: "API auth middleware — Lerato Dlamini",
    time: "4h ago",
    href: "/supervisor/reviews",
  },
  {
    title: "New task assigned",
    detail: "Write integration tests — Sipho Nkosi",
    time: "Yesterday",
    href: "/supervisor/tasks",
  },
]

export default function SupervisorPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Supervisor Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Track your interns, tasks, and reviews in one place.
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

      <div className="grid gap-4 xl:grid-cols-[7fr_3fr]">
        <div className="grid min-w-0 gap-4 lg:grid-cols-2">
          <div className="min-w-0">
            <SupervisorOverviewBarChart />
          </div>
          <div className="min-w-0">
            <SupervisorOverviewPieChart />
          </div>
        </div>

        <Card className="min-w-0 h-full">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              Latest updates from your assigned interns.
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

      <SupervisorTasksTable />
    </div>
  )
}
