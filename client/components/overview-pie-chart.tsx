"use client"

import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

type PieDataPoint = {
  name: string
  value: number
  fill: string
}

type OverviewPieChartProps = {
  title: string
  description: string
  data: PieDataPoint[]
  config: ChartConfig
  nameKey?: string
}

export function OverviewPieChart({
  title,
  description,
  data,
  config,
  nameKey = "name",
}: OverviewPieChartProps) {
  return (
    <Card className="h-full min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={config}
          className="mx-auto aspect-auto h-[280px] w-full min-w-0"
        >
          <PieChart margin={{ top: 8, bottom: 8 }}>
            <ChartTooltip
              content={<ChartTooltipContent nameKey={nameKey} hideLabel />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey={nameKey}
              innerRadius={0}
              outerRadius="70%"
            />
            <ChartLegend
              verticalAlign="bottom"
              content={<ChartLegendContent nameKey={nameKey} />}
              className="flex flex-wrap justify-center gap-2 pt-4"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
