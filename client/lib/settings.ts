import type { Role } from "@/lib/nav"

export type NotificationSettings = {
  emailAlerts: boolean
  inAppAlerts: boolean
  taskReminders: boolean
  dailyLogReminders: boolean
  weeklyDigest: boolean
}

export type PreferenceSettings = {
  compactTables: boolean
  showAvatarsInTables: boolean
  dateFormat: "en-ZA" | "en-GB" | "en-US"
  startOfWeek: "monday" | "sunday"
}

export type PrivacySettings = {
  showOnlineStatus: boolean
  shareEmailWithTeam: boolean
  allowMessageRequests: boolean
}

export type AdminOrgSettings = {
  organisationName: string
  defaultInternCapacity: number
  requireEnrolmentApproval: boolean
  logReminderHour: number
  reportRetentionDays: number
}

export type RoleSettings = {
  notifications: NotificationSettings
  preferences: PreferenceSettings
  privacy: PrivacySettings
  organisation?: AdminOrgSettings
}

const defaultNotifications: NotificationSettings = {
  emailAlerts: true,
  inAppAlerts: true,
  taskReminders: true,
  dailyLogReminders: true,
  weeklyDigest: false,
}

const defaultPreferences: PreferenceSettings = {
  compactTables: false,
  showAvatarsInTables: true,
  dateFormat: "en-ZA",
  startOfWeek: "monday",
}

const defaultPrivacy: PrivacySettings = {
  showOnlineStatus: true,
  shareEmailWithTeam: true,
  allowMessageRequests: true,
}

const defaultOrganisation: AdminOrgSettings = {
  organisationName: "InkDot Internships",
  defaultInternCapacity: 10,
  requireEnrolmentApproval: true,
  logReminderHour: 16,
  reportRetentionDays: 90,
}

export function getDefaultSettings(role: Role): RoleSettings {
  return {
    notifications: { ...defaultNotifications },
    preferences: { ...defaultPreferences },
    privacy: { ...defaultPrivacy },
    organisation:
      role === "admin" ? { ...defaultOrganisation } : undefined,
  }
}

function storageKey(role: Role) {
  return `inkdot-settings:${role}`
}

export function getStoredSettings(role: Role): RoleSettings {
  const defaults = getDefaultSettings(role)
  if (typeof window === "undefined") return defaults

  try {
    const raw = localStorage.getItem(storageKey(role))
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as Partial<RoleSettings>
    return {
      notifications: {
        ...defaults.notifications,
        ...parsed.notifications,
      },
      preferences: {
        ...defaults.preferences,
        ...parsed.preferences,
      },
      privacy: {
        ...defaults.privacy,
        ...parsed.privacy,
      },
      organisation:
        role === "admin"
          ? {
              ...defaultOrganisation,
              ...parsed.organisation,
            }
          : undefined,
    }
  } catch {
    return defaults
  }
}

export function setStoredSettings(role: Role, settings: RoleSettings) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(storageKey(role), JSON.stringify(settings))
    window.dispatchEvent(
      new CustomEvent("inkdot-settings-change", { detail: { role } })
    )
  } catch {
    // ignore quota / private mode errors
  }
}
