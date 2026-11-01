"use client"

import { OverviewBarChart } from "@/components/overview-bar-chart"
import { OverviewPieChart } from "@/components/overview-pie-chart"
import { type ChartConfig } from "@/components/ui/chart"

const adminBarChartData = [
  { month: "January", interns: 18, supervisors: 4 },
  { month: "February", interns: 20, supervisors: 5 },
  { month: "March", interns: 22, supervisors: 5 },
  { month: "April", interns: 21, supervisors: 6 },
  { month: "May", interns: 24, supervisors: 6 },
  { month: "June", interns: 24, supervisors: 6 },
]

const adminBarChartConfig = {
  interns: {
    label: "Interns",
    color: "var(--chart-1)",
  },
  supervisors: {
    label: "Supervisors",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

const adminPieChartData = [
  {
    name: "software",
    value: 10,
    fill: "var(--color-software)",
  },
  {
    name: "frontend",
    value: 6,
    fill: "var(--color-frontend)",
  },
  {
    name: "backend",
    value: 5,
    fill: "var(--color-backend)",
  },
  {
    name: "design",
    value: 3,
    fill: "var(--color-design)",
  },
]

const adminPieChartConfig = {
  value: {
    label: "Interns",
  },
  software: {
    label: "Software Engineering",
    color: "var(--chart-1)",
  },
  frontend: {
    label: "Frontend Development",
    color: "var(--chart-2)",
  },
  backend: {
    label: "Backend Development",
    color: "var(--chart-3)",
  },
  design: {
    label: "UI/UX Design",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

const supervisorBarChartData = [
  { month: "January", tasks: 12, reviews: 4 },
  { month: "February", tasks: 15, reviews: 6 },
  { month: "March", tasks: 18, reviews: 8 },
  { month: "April", tasks: 14, reviews: 5 },
  { month: "May", tasks: 20, reviews: 9 },
  { month: "June", tasks: 16, reviews: 7 },
]

const supervisorBarChartConfig = {
  tasks: {
    label: "Tasks",
    color: "var(--chart-1)",
  },
  reviews: {
    label: "Reviews",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

const supervisorPieChartData = [
  {
    name: "inProgress",
    value: 7,
    fill: "var(--color-inProgress)",
  },
  {
    name: "review",
    value: 3,
    fill: "var(--color-review)",
  },
  {
    name: "overdue",
    value: 2,
    fill: "var(--color-overdue)",
  },
  {
    name: "done",
    value: 2,
    fill: "var(--color-done)",
  },
]

const supervisorPieChartConfig = {
  value: {
    label: "Tasks",
  },
  inProgress: {
    label: "In progress",
    color: "var(--chart-1)",
  },
  review: {
    label: "Review",
    color: "var(--chart-2)",
  },
  overdue: {
    label: "Overdue",
    color: "var(--chart-3)",
  },
  done: {
    label: "Done",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

const internPieChartData = [
  {
    name: "inProgress",
    value: 6,
    fill: "var(--color-inProgress)",
  },
  {
    name: "review",
    value: 2,
    fill: "var(--color-review)",
  },
  {
    name: "overdue",
    value: 1,
    fill: "var(--color-overdue)",
  },
  {
    name: "done",
    value: 3,
    fill: "var(--color-done)",
  },
]

const internPieChartConfig = {
  value: {
    label: "Tasks",
  },
  inProgress: {
    label: "In progress",
    color: "var(--chart-1)",
  },
  review: {
    label: "Review",
    color: "var(--chart-2)",
  },
  overdue: {
    label: "Overdue",
    color: "var(--chart-3)",
  },
  done: {
    label: "Done",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

export function AdminOverviewBarChart() {
  return (
    <OverviewBarChart
      title="Programme activity"
      description="Intern and supervisor counts over the last 6 months"
      data={adminBarChartData}
      config={adminBarChartConfig}
      series={["interns", "supervisors"]}
    />
  )
}

export function AdminOverviewPieChart() {
  return (
    <OverviewPieChart
      title="Programme distribution"
      description="Active interns by programme"
      data={adminPieChartData}
      config={adminPieChartConfig}
    />
  )
}

export function SupervisorOverviewBarChart() {
  return (
    <OverviewBarChart
      title="Team activity"
      description="Tasks and reviews over the last 6 months"
      data={supervisorBarChartData}
      config={supervisorBarChartConfig}
      series={["tasks", "reviews"]}
      horizontal
    />
  )
}

export function SupervisorOverviewPieChart() {
  return (
    <OverviewPieChart
      title="Task status"
      description="Current tasks across your interns"
      data={supervisorPieChartData}
      config={supervisorPieChartConfig}
    />
  )
}

export function InternOverviewChart() {
  return (
    <OverviewPieChart
      title="Task status"
      description="Breakdown of your current tasks"
      data={internPieChartData}
      config={internPieChartConfig}
    />
  )
}
