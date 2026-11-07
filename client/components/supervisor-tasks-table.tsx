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
import type { SupervisorTaskRecord } from "@/lib/supervisor-data"
import { formatTaskDate, TASK_STATUS_STYLES } from "@/lib/tasks"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 5

export function SupervisorTasksTable({
  tasks,
}: {
  tasks: SupervisorTaskRecord[]
}) {
  const [page, setPage] = React.useState(1)
  const totalPages = Math.max(1, Math.ceil(tasks.length / PAGE_SIZE))
  const startIndex = (page - 1) * PAGE_SIZE
  const pageRows = tasks.slice(startIndex, startIndex + PAGE_SIZE)

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assigned tasks</CardTitle>
        <CardDescription>
          Work currently assigned across your interns.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Intern</TableHead>
              <TableHead>Due date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  No tasks assigned yet.
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>{task.intern}</TableCell>
                  <TableCell>{formatTaskDate(task.dueDate)}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-sm px-2 py-0.5 text-xs font-medium",
                        TASK_STATUS_STYLES[task.status]
                      )}
                    >
                      {task.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      {tasks.length > PAGE_SIZE ? (
        <CardFooter>
          <Pagination>
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
      ) : null}
    </Card>
  )
}
