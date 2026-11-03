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
  formatInternDate,
  interns,
  STATUS_STYLES,
  type InternStatus,
} from "@/lib/interns"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 5

const enrolments = [...interns]
  .sort((a, b) => b.startDate.localeCompare(a.startDate))
  .slice(0, 12)

export function AdminEnrolmentsTable() {
  const [page, setPage] = React.useState(1)
  const totalPages = Math.ceil(enrolments.length / PAGE_SIZE)
  const startIndex = (page - 1) * PAGE_SIZE
  const pageRows = enrolments.slice(startIndex, startIndex + PAGE_SIZE)

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent enrolments</CardTitle>
        <CardDescription>
          Latest interns added across all programmes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Intern</TableHead>
              <TableHead>Programme</TableHead>
              <TableHead>Supervisor</TableHead>
              <TableHead>Start date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((enrolment) => (
              <TableRow key={enrolment.id}>
                <TableCell className="font-medium">{enrolment.name}</TableCell>
                <TableCell>{enrolment.programme}</TableCell>
                <TableCell>{enrolment.supervisor}</TableCell>
                <TableCell>{formatInternDate(enrolment.startDate)}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-sm px-2 py-0.5 text-xs font-medium",
                      STATUS_STYLES[enrolment.status as InternStatus]
                    )}
                  >
                    {enrolment.status}
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
          {Math.min(startIndex + PAGE_SIZE, enrolments.length)} of{" "}
          {enrolments.length}
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
