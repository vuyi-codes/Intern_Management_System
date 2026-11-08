"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronDown, Loader2, RotateCcw } from "lucide-react"

import { saveUserSettings } from "@/app/actions/account"
import { saveAdminSettings } from "@/app/actions/admin-records"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { roleLabels, type Role } from "@/lib/nav"
import { getDefaultSettings, type RoleSettings } from "@/lib/settings"
import { cn } from "@/lib/utils"

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (next: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-sm border border-border p-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative h-6 w-10 shrink-0 rounded-full border transition-colors",
          checked
            ? "border-primary bg-primary"
            : "border-border bg-muted"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-4 rounded-full bg-background transition-transform",
            checked && "translate-x-4"
          )}
        />
        <span className="sr-only">{label}</span>
      </button>
    </div>
  )
}

export function DashboardSettings({
  role,
  embedded = false,
  remote,
}: {
  role: Role
  embedded?: boolean
  remote?: RoleSettings
}) {
  const router = useRouter()
  const [settings, setSettings] = React.useState<RoleSettings>(
    () => remote ?? getDefaultSettings(role)
  )
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    setSettings(remote ?? getDefaultSettings(role))
    setSaved(false)
    setError("")
  }, [role, remote])

  function updateNotifications<K extends keyof RoleSettings["notifications"]>(
    key: K,
    value: RoleSettings["notifications"][K]
  ) {
    setSaved(false)
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }))
  }

  function updatePreferences<K extends keyof RoleSettings["preferences"]>(
    key: K,
    value: RoleSettings["preferences"][K]
  ) {
    setSaved(false)
    setSettings((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value },
    }))
  }

  function updatePrivacy<K extends keyof RoleSettings["privacy"]>(
    key: K,
    value: RoleSettings["privacy"][K]
  ) {
    setSaved(false)
    setSettings((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: value },
    }))
  }

  function updateOrganisation<
    K extends keyof NonNullable<RoleSettings["organisation"]>,
  >(key: K, value: NonNullable<RoleSettings["organisation"]>[K]) {
    setSaved(false)
    setSettings((prev) => ({
      ...prev,
      organisation: {
        ...(prev.organisation ?? getDefaultSettings("admin").organisation!),
        [key]: value,
      },
    }))
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError("")
    const result =
      role === "admin"
        ? await saveAdminSettings(settings)
        : await saveUserSettings(settings)
    setSaving(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setSaved(true)
    router.refresh()
  }

  async function handleReset() {
    const defaults = getDefaultSettings(role)
    setSettings(defaults)
    setError("")
    setSaving(true)
    const result =
      role === "admin"
        ? await saveAdminSettings(defaults)
        : await saveUserSettings(defaults)
    setSaving(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setSaved(true)
    router.refresh()
  }

  const triggerClass = cn(
    buttonVariants({ variant: "outline" }),
    "h-8 w-full justify-between rounded-sm px-2.5 font-normal sm:w-56"
  )

  return (
    <form
      onSubmit={handleSave}
      className={cn(
        "flex w-full min-w-0 flex-col gap-4",
        !embedded && "mx-auto max-w-3xl gap-6"
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
          embedded && "gap-2"
        )}
      >
        {!embedded && (
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-2xl font-semibold">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage notifications, preferences, and privacy for your{" "}
              {roleLabels[role].toLowerCase()} workspace.
            </p>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
        )}
        <div
          className={cn(
            "flex flex-col gap-2 sm:flex-row",
            embedded && "w-full sm:ml-auto sm:w-auto"
          )}
        >
          <Button
            type="button"
            variant="outline"
            size={embedded ? "sm" : "default"}
            className="w-full sm:w-auto"
            onClick={handleReset}
          >
            <RotateCcw />
            Reset defaults
          </Button>
          <Button
            type="submit"
            size={embedded ? "sm" : "default"}
            className="w-full sm:w-auto"
            disabled={saving}
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            {saving ? "Saving..." : "Save settings"}
          </Button>
        </div>
      </div>

      {saved && (
        <p className="rounded-sm border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          Settings saved for this browser.
        </p>
      )}

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Choose how InkDot keeps you updated.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          <ToggleRow
            label="Email alerts"
            description="Receive important updates by email."
            checked={settings.notifications.emailAlerts}
            onCheckedChange={(value) =>
              updateNotifications("emailAlerts", value)
            }
          />
          <ToggleRow
            label="In-app alerts"
            description="Show notifications inside the dashboard."
            checked={settings.notifications.inAppAlerts}
            onCheckedChange={(value) =>
              updateNotifications("inAppAlerts", value)
            }
          />
          <ToggleRow
            label="Task reminders"
            description={
              role === "intern"
                ? "Remind me about upcoming and overdue tasks."
                : "Remind me about intern task follow-ups."
            }
            checked={settings.notifications.taskReminders}
            onCheckedChange={(value) =>
              updateNotifications("taskReminders", value)
            }
          />
          <ToggleRow
            label="Daily log reminders"
            description={
              role === "admin"
                ? "Remind teams when daily logs are due."
                : "Remind me about daily log deadlines."
            }
            checked={settings.notifications.dailyLogReminders}
            onCheckedChange={(value) =>
              updateNotifications("dailyLogReminders", value)
            }
          />
          <ToggleRow
            label="Weekly digest"
            description="Send a weekly summary of activity."
            checked={settings.notifications.weeklyDigest}
            onCheckedChange={(value) =>
              updateNotifications("weeklyDigest", value)
            }
          />
        </CardContent>
      </Card>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Control how tables and dates appear in your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <ToggleRow
              label="Compact tables"
              description="Use denser spacing in data tables."
              checked={settings.preferences.compactTables}
              onCheckedChange={(value) =>
                updatePreferences("compactTables", value)
              }
            />
            <ToggleRow
              label="Show avatars in tables"
              description="Display profile initials next to people rows."
              checked={settings.preferences.showAvatarsInTables}
              onCheckedChange={(value) =>
                updatePreferences("showAvatarsInTables", value)
              }
            />
          </div>

          <FieldGroup className="gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field>
                <FieldLabel>Date format</FieldLabel>
                <DropdownMenu>
                  <DropdownMenuTrigger className={triggerClass}>
                    <span>
                      {settings.preferences.dateFormat === "en-ZA"
                        ? "South Africa (2 Nov 2026)"
                        : settings.preferences.dateFormat === "en-GB"
                          ? "United Kingdom (2 Nov 2026)"
                          : "United States (Nov 2, 2026)"}
                    </span>
                    <ChevronDown className="size-4 opacity-60" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="min-w-56">
                    {(
                      [
                        ["en-ZA", "South Africa (2 Nov 2026)"],
                        ["en-GB", "United Kingdom (2 Nov 2026)"],
                        ["en-US", "United States (Nov 2, 2026)"],
                      ] as const
                    ).map(([value, label]) => (
                      <DropdownMenuItem
                        key={value}
                        className="justify-between"
                        onClick={() => updatePreferences("dateFormat", value)}
                      >
                        {label}
                        {settings.preferences.dateFormat === value && (
                          <Check className="size-4" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </Field>

              <Field>
                <FieldLabel>Start of week</FieldLabel>
                <DropdownMenu>
                  <DropdownMenuTrigger className={triggerClass}>
                    <span className="capitalize">
                      {settings.preferences.startOfWeek}
                    </span>
                    <ChevronDown className="size-4 opacity-60" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="min-w-40">
                    {(["monday", "sunday"] as const).map((value) => (
                      <DropdownMenuItem
                        key={value}
                        className="justify-between capitalize"
                        onClick={() => updatePreferences("startOfWeek", value)}
                      >
                        {value}
                        {settings.preferences.startOfWeek === value && (
                          <Check className="size-4" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </Field>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
          <CardDescription>
            Decide what other people can see about your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          <ToggleRow
            label="Show online status"
            description="Let teammates see when you are active."
            checked={settings.privacy.showOnlineStatus}
            onCheckedChange={(value) =>
              updatePrivacy("showOnlineStatus", value)
            }
          />
          <ToggleRow
            label="Share email with team"
            description="Allow your workspace email to appear on profiles."
            checked={settings.privacy.shareEmailWithTeam}
            onCheckedChange={(value) =>
              updatePrivacy("shareEmailWithTeam", value)
            }
          />
          <ToggleRow
            label="Allow message requests"
            description="Let other roles start a conversation with you."
            checked={settings.privacy.allowMessageRequests}
            onCheckedChange={(value) =>
              updatePrivacy("allowMessageRequests", value)
            }
          />
        </CardContent>
      </Card>

      {role === "admin" && settings.organisation && (
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Organisation</CardTitle>
            <CardDescription>
              Admin controls for programme defaults and retention.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="org-name">Organisation name</FieldLabel>
                  <Input
                    id="org-name"
                    value={settings.organisation.organisationName}
                    onChange={(event) =>
                      updateOrganisation(
                        "organisationName",
                        event.target.value
                      )
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="default-capacity">
                    Default programme capacity
                  </FieldLabel>
                  <Input
                    id="default-capacity"
                    type="number"
                    min={1}
                    max={40}
                    value={settings.organisation.defaultInternCapacity}
                    onChange={(event) =>
                      updateOrganisation(
                        "defaultInternCapacity",
                        Number(event.target.value) || 1
                      )
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="log-hour">Log reminder hour</FieldLabel>
                  <Input
                    id="log-hour"
                    type="number"
                    min={0}
                    max={23}
                    value={settings.organisation.logReminderHour}
                    onChange={(event) =>
                      updateOrganisation(
                        "logReminderHour",
                        Number(event.target.value) || 0
                      )
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="retention">
                    Report retention (days)
                  </FieldLabel>
                  <Input
                    id="retention"
                    type="number"
                    min={7}
                    max={365}
                    value={settings.organisation.reportRetentionDays}
                    onChange={(event) =>
                      updateOrganisation(
                        "reportRetentionDays",
                        Number(event.target.value) || 7
                      )
                    }
                  />
                </Field>
              </div>
              <ToggleRow
                label="Require enrolment approval"
                description="New intern enrolments must be approved by an admin."
                checked={settings.organisation.requireEnrolmentApproval}
                onCheckedChange={(value) =>
                  updateOrganisation("requireEnrolmentApproval", value)
                }
              />
            </FieldGroup>
          </CardContent>
        </Card>
      )}

      <CardFooter className="justify-between gap-3 rounded-sm border border-border px-4 py-3">
        <p className="text-sm text-muted-foreground">
          {saved
            ? "All changes are saved locally until the API is connected."
            : "Unsaved changes will be lost if you leave this page."}
        </p>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? "Saving..." : "Save settings"}
        </Button>
      </CardFooter>
    </form>
  )
}
