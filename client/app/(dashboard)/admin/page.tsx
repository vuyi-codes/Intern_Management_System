import Link from "next/link"
import {
  BarChart3,
  CalendarRange,
  GraduationCap,
  UserCog,
} from "lucide-react"

import { AdminEnrolmentsTable } from "@/components/admin-enrolments-table"
import {
  AdminOverviewBarChart,
  AdminOverviewPieChart,
} from "@/components/dashboard-charts"
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
    title: "Interns",
    value: "24",
    description: "Active in programmes",
    href: "/admin/interns",
    icon: GraduationCap,
  },
  {
    title: "Supervisors",
    value: "6",
    description: "Managing cohorts",
    href: "/admin/supervisors",
    icon: UserCog,
  },
  {
    title: "Programmes",
    value: "3",
    description: "Currently running",
    href: "/admin/programmes",
    icon: CalendarRange,
  },
  {
    title: "Reports",
    value: "12",
    description: "Generated this month",
    href: "/admin/reports",
    icon: BarChart3,
  },
]

const recentActivity = [
  {
    title: "New intern enrolled",
    detail: "Nomsa Khumalo — Software Engineering",
    time: "1h ago",
    href: "/admin/interns",
  },
  {
    title: "Supervisor assigned",
    detail: "Jordan Peters → Frontend cohort",
    time: "3h ago",
    href: "/admin/supervisors",
  },
  {
    title: "Programme updated",
    detail: "Winter 2026 end date extended",
    time: "Yesterday",
    href: "/admin/programmes",
  },
]

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Manage interns, supervisors, programmes, and reports.
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
            <AdminOverviewBarChart />
          </div>
          <div className="min-w-0">
            <AdminOverviewPieChart />
          </div>
        </div>

        <Card className="min-w-0 h-full">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              Latest updates across the programme.
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

      <AdminEnrolmentsTable />
    </div>
  )
}

