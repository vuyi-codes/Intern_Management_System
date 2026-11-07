"use client"

import { OverviewBarChart } from "@/components/overview-bar-chart"
import { OverviewPieChart } from "@/components/overview-pie-chart"
import { type ChartConfig } from "@/components/ui/chart"

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

export function AdminOverviewBarChart({
  data,
}: {
  data: { month: string; interns: number; supervisors: number }[]
}) {
  return (
    <OverviewBarChart
      title="Programme activity"
      description="Intern and supervisor counts over the last 6 months"
      data={data}
      config={adminBarChartConfig}
      series={["interns", "supervisors"]}
    />
  )
}

export function AdminOverviewPieChart({
  data,
}: {
  data: { name: string; value: number }[]
}) {
  const chartData = data.map((item, index) => ({
    name: `p${index}`,
    value: item.value,
    fill: `var(--color-p${index})`,
  }))
  const config = {
    value: { label: "Interns" },
    ...Object.fromEntries(
      data.map((item, index) => [
        `p${index}`,
        {
          label: item.name,
          color: `var(--chart-${(index % 5) + 1})`,
        },
      ])
    ),
  } satisfies ChartConfig

  return (
    <OverviewPieChart
      title="Programme distribution"
      description="Active interns by programme"
      data={chartData}
      config={config}
    />
  )
}

export function SupervisorOverviewBarChart({
  data,
}: {
  data: { month: string; tasks: number; reviews: number }[]
}) {
  return (
    <OverviewBarChart
      title="Team activity"
      description="Tasks and reviews over the last 6 months"
      data={data}
      config={supervisorBarChartConfig}
      series={["tasks", "reviews"]}
    />
  )
}

export function SupervisorOverviewPieChart({
  data,
}: {
  data: { name: string; value: number }[]
}) {
  const chartData = data.map((item, index) => ({
    name: `s${index}`,
    value: item.value,
    fill: `var(--color-s${index})`,
  }))
  const config = {
    value: { label: "Tasks" },
    ...Object.fromEntries(
      data.map((item, index) => [
        `s${index}`,
        {
          label: item.name,
          color: `var(--chart-${(index % 5) + 1})`,
        },
      ])
    ),
  } satisfies ChartConfig

  return (
    <OverviewPieChart
      title="Task status"
      description="Current tasks across your interns"
      data={chartData}
      config={config}
    />
  )
}

export function InternOverviewChart({
  data,
}: {
  data: { name: string; value: number }[]
}) {
  const chartData = data.map((item, index) => ({
    name: `i${index}`,
    value: item.value,
    fill: `var(--color-i${index})`,
  }))
  const config = {
    value: { label: "Tasks" },
    ...Object.fromEntries(
      data.map((item, index) => [
        `i${index}`,
        {
          label: item.name,
          color: `var(--chart-${(index % 5) + 1})`,
        },
      ])
    ),
  } satisfies ChartConfig

  return (
    <OverviewPieChart
      title="Task status"
      description="Breakdown of your current tasks"
      data={chartData}
      config={config}
    />
  )
}
