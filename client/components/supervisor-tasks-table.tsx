"use client"

import * as React from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 5

type TaskStatus = "In progress" | "Review" | "Overdue" | "Done"

const statusStyles: Record<TaskStatus, string> = {
  "In progress": "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  Review: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  Overdue: "bg-red-500/15 text-red-700 dark:text-red-400",
  Done: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
}

const tasks: {
  task: string
  intern: string
  dueDate: string
  priority: "High" | "Medium" | "Low"
  status: TaskStatus
}[] = [
  {
    task: "API auth middleware",
    intern: "Lerato Dlamini",
    dueDate: "2026-04-02",
    priority: "High",
    status: "Review",
  },
  {
    task: "Component library polish",
    intern: "Thabo Molefe",
    dueDate: "2026-04-03",
    priority: "Medium",
    status: "In progress",
  },
  {
    task: "Write integration tests",
    intern: "Sipho Nkosi",
    dueDate: "2026-04-04",
    priority: "High",
    status: "In progress",
  },
  {
    task: "Daily log summary report",
    intern: "Ayanda Mokoena",
    dueDate: "2026-03-28",
    priority: "Low",
    status: "Overdue",
  },
  {
    task: "Onboarding checklist",
    intern: "Dominic van Wyk",
    dueDate: "2026-04-05",
    priority: "Medium",
    status: "In progress",
  },
  {
    task: "Fix sidebar nav states",
    intern: "Nomsa Khumalo",
    dueDate: "2026-04-01",
    priority: "High",
    status: "Done",
  },
  {
    task: "Design system tokens",
    intern: "Refilwe Sithole",
    dueDate: "2026-04-06",
    priority: "Medium",
    status: "In progress",
  },
  {
    task: "Database seed script",
    intern: "Zanele Botha",
    dueDate: "2026-03-30",
    priority: "High",
    status: "Overdue",
  },
  {
    task: "Login form validation",
    intern: "Ethan Jacobs",
    dueDate: "2026-04-07",
    priority: "Low",
    status: "Review",
  },
  {
    task: "Profile page layout",
    intern: "Palesa Moeketsi",
    dueDate: "2026-04-08",
    priority: "Medium",
    status: "In progress",
  },
  {
    task: "Task board filters",
    intern: "Connor Naicker",
    dueDate: "2026-04-09",
    priority: "Low",
    status: "In progress",
  },
  {
    task: "Weekly progress notes",
    intern: "Kagiso Petersen",
    dueDate: "2026-04-03",
    priority: "Medium",
    status: "Review",
  },
]

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function SupervisorTasksTable() {
  const [page, setPage] = React.useState(1)
  const totalPages = Math.ceil(tasks.length / PAGE_SIZE)
  const startIndex = (page - 1) * PAGE_SIZE
  const pageRows = tasks.slice(startIndex, startIndex + PAGE_SIZE)

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks due this week</CardTitle>
        <CardDescription>
          Assigned work across your interns that needs attention.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Intern</TableHead>
              <TableHead>Due date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((item) => (
              <TableRow key={`${item.task}-${item.intern}`}>
                <TableCell className="font-medium">{item.task}</TableCell>
                <TableCell>{item.intern}</TableCell>
                <TableCell>{formatDate(item.dueDate)}</TableCell>
                <TableCell>{item.priority}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-sm px-2 py-0.5 text-xs font-medium",
                      statusStyles[item.status]
                    )}
                  >
                    {item.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="justify-between gap-4 border-t bg-transparent">
        <p className="text-sm text-muted-foreground">
          Showing {startIndex + 1}–
          {Math.min(startIndex + PAGE_SIZE, tasks.length)} of {tasks.length}
        </p>
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                aria-disabled={page === 1}
                className={
                  page === 1 ? "pointer-events-none opacity-50" : undefined
                }
                onClick={(event) => {
                  event.preventDefault()
                  goToPage(page - 1)
                }}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href="#"
                    isActive={page === pageNumber}
                    onClick={(event) => {
                      event.preventDefault()
                      goToPage(pageNumber)
                    }}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              )
            })}
            <PaginationItem>
              <PaginationNext
                href="#"
                aria-disabled={page === totalPages}
                className={
                  page === totalPages
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
                onClick={(event) => {
                  event.preventDefault()
                  goToPage(page + 1)
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  )
}
