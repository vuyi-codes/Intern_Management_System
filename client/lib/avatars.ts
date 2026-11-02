import type { Role } from "@/lib/nav"

export type StockAvatar = {
  id: string
  label: string
  src: string
}

function svgAvatar(bg: string, accent: string, motif: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none">
    <rect width="80" height="80" rx="16" fill="${bg}"/>
    ${motif}
    <circle cx="40" cy="32" r="14" fill="${accent}" opacity="0.95"/>
    <path d="M16 70c4-14 14-22 24-22s20 8 24 22" fill="${accent}" opacity="0.95"/>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export const STOCK_AVATARS: StockAvatar[] = [
  {
    id: "slate",
    label: "Slate",
    src: svgAvatar("#334155", "#94a3b8", `<circle cx="64" cy="14" r="10" fill="#64748b" opacity="0.5"/>`),
  },
  {
    id: "teal",
    label: "Teal",
    src: svgAvatar("#0f766e", "#5eead4", `<rect x="8" y="8" width="18" height="18" rx="4" fill="#2dd4bf" opacity="0.35"/>`),
  },
  {
    id: "amber",
    label: "Amber",
    src: svgAvatar("#b45309", "#fcd34d", `<path d="M58 8l10 18H48l10-18z" fill="#fbbf24" opacity="0.45"/>`),
  },
  {
    id: "rose",
    label: "Rose",
    src: svgAvatar("#9f1239", "#fda4af", `<circle cx="18" cy="62" r="12" fill="#fb7185" opacity="0.35"/>`),
  },
  {
    id: "indigo",
    label: "Indigo",
    src: svgAvatar("#3730a3", "#a5b4fc", `<rect x="52" y="48" width="20" height="20" rx="6" fill="#818cf8" opacity="0.4"/>`),
  },
  {
    id: "emerald",
    label: "Emerald",
    src: svgAvatar("#065f46", "#6ee7b7", `<circle cx="14" cy="18" r="8" fill="#34d399" opacity="0.4"/>`),
  },
  {
    id: "sky",
    label: "Sky",
    src: svgAvatar("#0369a1", "#7dd3fc", `<path d="M10 50c8-10 20-10 28 0s20 10 28 0" stroke="#38bdf8" stroke-width="4" opacity="0.5"/>`),
  },
  {
    id: "stone",
    label: "Stone",
    src: svgAvatar("#44403c", "#d6d3d1", `<rect x="54" y="10" width="16" height="16" rx="8" fill="#a8a29e" opacity="0.45"/>`),
  },
]

const storageKey = (role: Role) => `inkdot-avatar:${role}`

export function getStoredAvatar(role: Role): string | undefined {
  if (typeof window === "undefined") return undefined
  try {
    return localStorage.getItem(storageKey(role)) ?? undefined
  } catch {
    return undefined
  }
}

export function setStoredAvatar(role: Role, src: string | undefined) {
  if (typeof window === "undefined") return
  try {
    if (!src) localStorage.removeItem(storageKey(role))
    else localStorage.setItem(storageKey(role), src)
    window.dispatchEvent(
      new CustomEvent("inkdot-avatar-change", { detail: { role, src } })
    )
  } catch {
    // ignore quota / private mode errors
  }
}
