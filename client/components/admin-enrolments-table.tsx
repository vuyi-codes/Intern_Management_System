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

type EnrolmentStatus = "Active" | "Onboarding" | "Paused"

const statusStyles: Record<EnrolmentStatus, string> = {
  Active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  Onboarding: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  Paused: "bg-red-500/15 text-red-700 dark:text-red-400",
}

const enrolments: {
  name: string
  programme: string
  supervisor: string
  startDate: string
  status: EnrolmentStatus
}[] = [
  {
    name: "Nomsa Khumalo",
    programme: "Software Engineering",
    supervisor: "Jordan Peters",
    startDate: "2026-01-12",
    status: "Active",
  },
  {
    name: "Thabo Molefe",
    programme: "Frontend Development",
    supervisor: "Aisha Naidoo",
    startDate: "2026-01-20",
    status: "Active",
  },
  {
    name: "Lerato Dlamini",
    programme: "Backend Development",
    supervisor: "Jordan Peters",
    startDate: "2026-02-03",
    status: "Onboarding",
  },
  {
    name: "Sipho Nkosi",
    programme: "Software Engineering",
    supervisor: "Maya Chen",
    startDate: "2026-02-10",
    status: "Active",
  },
  {
    name: "Ayanda Mokoena",
    programme: "UI/UX Design",
    supervisor: "Aisha Naidoo",
    startDate: "2026-02-17",
    status: "Active",
  },
  {
    name: "Kagiso Petersen",
    programme: "Frontend Development",
    supervisor: "Maya Chen",
    startDate: "2026-03-02",
    status: "Paused",
  },
  {
    name: "Zanele Botha",
    programme: "Backend Development",
    supervisor: "Jordan Peters",
    startDate: "2026-03-09",
    status: "Active",
  },
  {
    name: "Dominic van Wyk",
    programme: "Software Engineering",
    supervisor: "Aisha Naidoo",
    startDate: "2026-03-16",
    status: "Onboarding",
  },
  {
    name: "Refilwe Sithole",
    programme: "UI/UX Design",
    supervisor: "Maya Chen",
    startDate: "2026-03-23",
    status: "Active",
  },
  {
    name: "Ethan Jacobs",
    programme: "Frontend Development",
    supervisor: "Jordan Peters",
    startDate: "2026-04-06",
    status: "Active",
  },
  {
    name: "Palesa Moeketsi",
    programme: "Backend Development",
    supervisor: "Aisha Naidoo",
    startDate: "2026-04-13",
    status: "Active",
  },
  {
    name: "Connor Naicker",
    programme: "Software Engineering",
    supervisor: "Maya Chen",
    startDate: "2026-04-20",
    status: "Onboarding",
  },
]

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

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
              <TableRow key={`${enrolment.name}-${enrolment.startDate}`}>
                <TableCell className="font-medium">{enrolment.name}</TableCell>
                <TableCell>{enrolment.programme}</TableCell>
                <TableCell>{enrolment.supervisor}</TableCell>
                <TableCell>{formatDate(enrolment.startDate)}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-sm px-2 py-0.5 text-xs font-medium",
                      statusStyles[enrolment.status]
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
