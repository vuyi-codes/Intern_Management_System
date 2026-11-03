import { getInternRecord } from "@/lib/progress"
import { getUserForRole } from "@/lib/users"

export type InternProfileDetails = {
  bio: string
  skills: string[]
  location: string
  university: string
  linkedin: string
  github: string
  emergencyName: string
  emergencyPhone: string
}

const STORAGE_KEY = "inkdot.intern-profile.v1"

const defaultProfiles: Record<string, InternProfileDetails> = {
  "Nomsa Khumalo": {
    bio: "Software engineering intern focused on product dashboards, accessible UI, and clean component systems.",
    skills: [
      "React",
      "TypeScript",
      "Next.js",
      "Tailwind CSS",
      "Git",
      "Figma",
    ],
    location: "Johannesburg, South Africa",
    university: "University of the Witwatersrand",
    linkedin: "https://linkedin.com/in/nomsa-khumalo",
    github: "https://github.com/nomsa-khumalo",
    emergencyName: "Thandi Khumalo",
    emergencyPhone: "+27 82 555 0190",
  },
}

export function getDefaultInternProfile(name: string): InternProfileDetails {
  return (
    defaultProfiles[name] ?? {
      bio: "",
      skills: [],
      location: "",
      university: "",
      linkedin: "",
      github: "",
      emergencyName: "",
      emergencyPhone: "",
    }
  )
}

export function loadInternProfile(name: string): InternProfileDetails {
  const fallback = getDefaultInternProfile(name)
  if (typeof window === "undefined") return fallback

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Record<string, InternProfileDetails>
    return parsed[name] ? { ...fallback, ...parsed[name] } : fallback
  } catch {
    return fallback
  }
}

export function saveInternProfile(
  name: string,
  details: InternProfileDetails
) {
  if (typeof window === "undefined") return
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw
      ? (JSON.parse(raw) as Record<string, InternProfileDetails>)
      : {}
    parsed[name] = details
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
  } catch {
    // Ignore quota errors in the demo client.
  }
}

export function getInternProfileContext() {
  const user = getUserForRole("intern")
  const placement = getInternRecord(user.name)
  return { user, placement }
}

export function parseSkillsInput(value: string) {
  return value
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
}
