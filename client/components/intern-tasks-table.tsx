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
import {
  formatTaskDate,
  getTasksForIntern,
  TASK_STATUS_STYLES,
} from "@/lib/tasks"
import { getUserForRole } from "@/lib/users"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 5

export function InternTasksTable() {
  const intern = getUserForRole("intern")
  const tasks = React.useMemo(
    () => getTasksForIntern(intern.name),
    [intern.name]
  )
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
        <CardTitle>My open tasks</CardTitle>
        <CardDescription>
          Your assigned work and upcoming deadlines.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Due date</TableHead>
              <TableHead>Priority</TableHead>
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
              pageRows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{formatTaskDate(item.dueDate)}</TableCell>
                  <TableCell>{item.priority}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-sm px-2 py-0.5 text-xs font-medium",
                        TASK_STATUS_STYLES[item.status]
                      )}
                    >
                      {item.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="justify-between gap-4 border-t bg-transparent">
        <p className="text-sm text-muted-foreground">
          {tasks.length === 0
            ? "No results"
            : `Showing ${startIndex + 1}–${Math.min(
                startIndex + PAGE_SIZE,
                tasks.length
              )} of ${tasks.length}`}
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
