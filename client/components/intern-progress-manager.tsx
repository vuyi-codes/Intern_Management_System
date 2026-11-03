"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  formatProgressDate,
  getMilestonesForIntern,
  getProgressSummary,
  MODULE_STATUS_STYLES,
  progressTrend,
} from "@/lib/progress"
import { getTasksForIntern, TASK_STATUS_STYLES } from "@/lib/tasks"
import { getUserForRole } from "@/lib/users"
import { cn } from "@/lib/utils"
import { OverviewPieChart } from "@/components/overview-pie-chart"

const trendConfig = {
  completion: {
    label: "Completion %",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}

export function InternProgressManager() {
  const user = getUserForRole("intern")
  const summary = React.useMemo(
    () => getProgressSummary(user.name),
    [user.name]
  )
  const milestones = React.useMemo(
    () => getMilestonesForIntern(user.name),
    [user.name]
  )
  const tasks = React.useMemo(
    () => getTasksForIntern(user.name),
    [user.name]
  )

  const taskPieData = React.useMemo(() => {
    const counts = {
      inProgress: tasks.filter((task) => task.status === "In progress").length,
      review: tasks.filter((task) => task.status === "Review").length,
      overdue: tasks.filter((task) => task.status === "Overdue").length,
      done: tasks.filter((task) => task.status === "Done").length,
    }
    return [
      {
        name: "inProgress",
        value: counts.inProgress,
        fill: "var(--color-inProgress)",
      },
      {
        name: "review",
        value: counts.review,
        fill: "var(--color-review)",
      },
      {
        name: "overdue",
        value: counts.overdue,
        fill: "var(--color-overdue)",
      },
      {
        name: "done",
        value: counts.done,
        fill: "var(--color-done)",
      },
    ]
  }, [tasks])

  const taskPieConfig = {
    value: { label: "Tasks" },
    inProgress: { label: "In progress", color: "var(--chart-1)" },
    review: { label: "Review", color: "var(--chart-2)" },
    overdue: { label: "Overdue", color: "var(--chart-3)" },
    done: { label: "Done", color: "var(--chart-4)" },
  } satisfies ChartConfig

  const intern = summary.intern

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-2xl font-semibold">Progress</h1>
        <p className="text-sm text-muted-foreground">
          Track programme completion, modules, and recent milestones.
        </p>
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Overall"
          value={`${summary.overall}%`}
          hint={intern?.programme ?? "Programme"}
        />
        <StatCard
          label="Modules done"
          value={`${summary.completedModules}/${summary.moduleCount}`}
          hint={`${summary.activeModules} in progress`}
        />
        <StatCard
          label="Tasks done"
          value={`${summary.tasksDone}/${summary.tasksTotal}`}
          hint="Across your assignments"
        />
        <StatCard
          label="Reviews done"
          value={`${summary.reviewsDone}/${summary.reviewsTotal}`}
          hint="Supervisor checkpoints"
        />
      </div>

      {intern && (
        <Card className="min-w-0">
          <CardHeader className="gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              <CardTitle>Programme overview</CardTitle>
              <CardDescription>
                {intern.programme} with {intern.supervisor}
              </CardDescription>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-medium tabular-nums">
                  {summary.overall}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-sm bg-muted">
                <div
                  className="h-full rounded-sm bg-primary transition-[width]"
                  style={{ width: `${summary.overall}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>
                  Start {formatProgressDate(intern.startDate)}
                </span>
                <span>
                  End {formatProgressDate(intern.endDate)}
                </span>
                <span>Status {intern.status}</span>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="grid min-w-0 gap-4 xl:grid-cols-[3fr_2fr]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>Completion trend</CardTitle>
            <CardDescription>
              Programme progress across the internship months.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={trendConfig}
              className="aspect-auto h-[280px] w-full min-w-0"
            >
              <BarChart
                accessibilityLayer
                data={progressTrend}
                margin={{ left: 8, right: 12 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  domain={[0, 100]}
                  width={32}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => `${value}%`}
                    />
                  }
                />
                <Bar
                  dataKey="completion"
                  fill="var(--color-completion)"
                  radius={3}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="min-w-0">
          <OverviewPieChart
            title="Task mix"
            description="Current status of your assigned tasks"
            data={taskPieData}
            config={taskPieConfig}
          />
        </div>
      </div>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Modules</CardTitle>
          <CardDescription>
            Programme modules and how far each one has moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-w-0 px-0 sm:px-(--card-spacing)">
          <Table className="min-w-[36rem]">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-44 pl-4 sm:pl-0">Module</TableHead>
                <TableHead className="hidden sm:table-cell">Due</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.modules.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-28 text-center text-muted-foreground"
                  >
                    No modules configured for your programme yet.
                  </TableCell>
                </TableRow>
              ) : (
                summary.modules.map((module) => (
                  <TableRow key={module.id}>
                    <TableCell className="max-w-[18rem] pl-4 sm:pl-0">
                      <div className="min-w-0 overflow-hidden">
                        <p className="truncate font-medium">{module.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {module.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap sm:table-cell">
                      {formatProgressDate(module.dueDate)}
                    </TableCell>
                    <TableCell className="min-w-36">
                      <div className="grid gap-1.5">
                        <div className="h-1.5 overflow-hidden rounded-sm bg-muted">
                          <div
                            className="h-full rounded-sm bg-primary"
                            style={{ width: `${module.progress}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {module.progress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex rounded-sm px-2 py-0.5 text-xs font-medium",
                          MODULE_STATUS_STYLES[module.status]
                        )}
                      >
                        {module.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Recent milestones</CardTitle>
            <CardDescription>
              Latest module, review, and task checkpoints.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-0">
            {milestones.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No milestones yet.
              </p>
            ) : (
              milestones.map((item, index) => (
                <div key={`${item.kind}-${item.id}`}>
                  {index > 0 && <Separator />}
                  <div className="flex items-start justify-between gap-4 py-3">
                    <div className="grid min-w-0 gap-0.5">
                      <p className="truncate text-sm font-medium">
                        {item.title}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {item.detail}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatProgressDate(item.date)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Open tasks snapshot</CardTitle>
            <CardDescription>
              Remaining work that still affects your progress.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-0">
            {tasks.filter((task) => task.status !== "Done").length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No open tasks.
              </p>
            ) : (
              tasks
                .filter((task) => task.status !== "Done")
                .slice(0, 6)
                .map((task, index) => (
                  <div key={task.id}>
                    {index > 0 && <Separator />}
                    <div className="flex items-start justify-between gap-4 py-3">
                      <div className="grid min-w-0 gap-0.5">
                        <p className="truncate text-sm font-medium">
                          {task.title}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          Due {formatProgressDate(task.dueDate)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 inline-flex rounded-sm px-2 py-0.5 text-xs font-medium",
                          TASK_STATUS_STYLES[task.status]
                        )}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
