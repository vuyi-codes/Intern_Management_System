"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { getNavForRole, type Role } from "@/lib/nav"
import { cn } from "@/lib/utils"

type SearchSuggestion = {
  id: string
  title: string
  description: string
  href: string
  group: string
}

const extraSuggestionsByRole: Record<Role, SearchSuggestion[]> = {
  admin: [
    {
      id: "enrolments",
      title: "Recent enrolments",
      description: "View newly added interns",
      href: "/admin",
      group: "Quick links",
    },
    {
      id: "nomsa",
      title: "Nomsa Khumalo",
      description: "Intern · Software Engineering",
      href: "/admin/interns",
      group: "People",
    },
    {
      id: "jordan",
      title: "Jordan Peters",
      description: "Supervisor · Frontend cohort",
      href: "/admin/supervisors",
      group: "People",
    },
    {
      id: "winter",
      title: "Winter 2026",
      description: "Programme currently running",
      href: "/admin/programmes",
      group: "Programmes",
    },
  ],
  supervisor: [
    {
      id: "tasks-week",
      title: "Tasks due this week",
      description: "Open supervisor overview table",
      href: "/supervisor",
      group: "Quick links",
    },
    {
      id: "thabo",
      title: "Thabo Molefe",
      description: "Intern · Component library work",
      href: "/supervisor/interns",
      group: "My Interns",
    },
    {
      id: "lerato",
      title: "Lerato Dlamini",
      description: "Intern · Auth middleware review",
      href: "/supervisor/reviews",
      group: "My Interns",
    },
    {
      id: "auth-task",
      title: "API auth middleware",
      description: "Task awaiting review",
      href: "/supervisor/tasks",
      group: "Tasks",
    },
  ],
  intern: [
    {
      id: "open-tasks",
      title: "My open tasks",
      description: "View your assigned work",
      href: "/intern",
      group: "Quick links",
    },
    {
      id: "overview-task",
      title: "Build intern overview page",
      description: "Task · In progress",
      href: "/intern/tasks",
      group: "Tasks",
    },
    {
      id: "daily-log",
      title: "Submit daily log",
      description: "Log today’s progress",
      href: "/intern/daily-log",
      group: "Daily Log",
    },
    {
      id: "progress",
      title: "Programme progress",
      description: "64% complete",
      href: "/intern/progress",
      group: "Progress",
    },
  ],
}

function buildSuggestions(role: Role): SearchSuggestion[] {
  const navItems = getNavForRole(role).map((item) => ({
    id: `nav-${item.href}`,
    title: item.title,
    description: `${role} page`,
    href: item.href,
    group: "Pages",
  }))

  return [...navItems, ...extraSuggestionsByRole[role]]
}

function rankSuggestions(query: string, items: SearchSuggestion[]) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  return items
    .map((item) => {
      const title = item.title.toLowerCase()
      const description = item.description.toLowerCase()
      const group = item.group.toLowerCase()

      let score = 0
      if (title.startsWith(normalized)) score += 100
      else if (title.includes(normalized)) score += 60
      if (description.includes(normalized)) score += 25
      if (group.includes(normalized)) score += 15

      return { item, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .slice(0, 8)
    .map((entry) => entry.item)
}

function getAutocomplete(query: string, suggestion: SearchSuggestion | null) {
  if (!suggestion) return ""
  const normalized = query.trim().toLowerCase()
  const title = suggestion.title
  if (!normalized || !title.toLowerCase().startsWith(normalized)) return ""
  return title.slice(query.trim().length)
}

type NavbarSearchProps = {
  role: Role
}

export function NavbarSearch({ role }: NavbarSearchProps) {
  const router = useRouter()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const allSuggestions = React.useMemo(() => buildSuggestions(role), [role])

  const [query, setQuery] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(0)

  const matches = React.useMemo(
    () => rankSuggestions(query, allSuggestions),
    [query, allSuggestions]
  )
  const activeSuggestion = matches[activeIndex] ?? null
  const autocompleteSuffix = getAutocomplete(query, activeSuggestion)

  React.useEffect(() => {
    setActiveIndex(0)
  }, [query])

  React.useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [])

  function selectSuggestion(suggestion: SearchSuggestion) {
    setQuery(suggestion.title)
    setOpen(false)
    router.push(suggestion.href)
  }

  function acceptAutocomplete() {
    if (!activeSuggestion || !autocompleteSuffix) return
    setQuery(activeSuggestion.title)
    setOpen(true)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      if (!open && matches.length) setOpen(true)
      setActiveIndex((index) =>
        matches.length ? (index + 1) % matches.length : 0
      )
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((index) =>
        matches.length ? (index - 1 + matches.length) % matches.length : 0
      )
      return
    }

    if (event.key === "Tab" && autocompleteSuffix) {
      event.preventDefault()
      acceptAutocomplete()
      return
    }

    if (event.key === "Enter") {
      event.preventDefault()
      if (activeSuggestion) selectSuggestion(activeSuggestion)
      return
    }

    if (event.key === "Escape") {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  const grouped = React.useMemo(() => {
    const groups = new Map<string, SearchSuggestion[]>()
    for (const suggestion of matches) {
      const list = groups.get(suggestion.group) ?? []
      list.push(suggestion)
      groups.set(suggestion.group, list)
    }
    return Array.from(groups.entries())
  }, [matches])

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <InputGroup className="h-9 rounded-sm has-[[data-slot=input-group-control]:focus-visible]:ring-1">
        <InputGroupAddon align="inline-start">
          <Search className="size-4 text-muted-foreground" />
        </InputGroupAddon>
        <div className="relative min-w-0 flex-1">
          {autocompleteSuffix && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center truncate px-0 text-sm text-muted-foreground/50"
            >
              <span className="invisible whitespace-pre">{query}</span>
              <span>{autocompleteSuffix}</span>
            </span>
          )}
          <InputGroupInput
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="Search pages, people, tasks..."
            aria-label="Search"
            aria-autocomplete="list"
            aria-expanded={open && matches.length > 0}
            aria-controls="navbar-search-suggestions"
            autoComplete="off"
            className="relative bg-transparent"
          />
        </div>
        {query && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="button"
              size="icon-xs"
              variant="ghost"
              aria-label="Clear search"
              onClick={() => {
                setQuery("")
                setOpen(false)
                inputRef.current?.focus()
              }}
            >
              <X />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>

      {open && query.trim() && (
        <div
          id="navbar-search-suggestions"
          role="listbox"
          className="absolute top-[calc(100%+0.35rem)] z-50 w-full overflow-hidden rounded-sm border border-border bg-popover text-popover-foreground shadow-md"
        >
          {matches.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              No results for “{query.trim()}”.
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto py-1">
              {grouped.map(([group, items]) => (
                <div key={group}>
                  <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    {group}
                  </p>
                  {items.map((suggestion) => {
                    const index = matches.findIndex(
                      (item) => item.id === suggestion.id
                    )
                    const isActive = index === activeIndex

                    return (
                      <Link
                        key={suggestion.id}
                        href={suggestion.href}
                        role="option"
                        aria-selected={isActive}
                        className={cn(
                          "block px-3 py-2 text-sm transition-colors",
                          isActive ? "bg-muted" : "hover:bg-muted/60"
                        )}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => {
                          setQuery(suggestion.title)
                          setOpen(false)
                        }}
                      >
                        <span className="font-medium">{suggestion.title}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {suggestion.description}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
