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
