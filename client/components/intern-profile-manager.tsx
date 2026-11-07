"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { saveInternProfileDetails } from "@/app/actions/intern-records"
import type { InternProfileView } from "@/lib/intern-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { getStoredAvatar } from "@/lib/avatars"
import {
  parseSkillsInput,
  type InternProfileDetails,
} from "@/lib/intern-profile"
import { formatProgressDate } from "@/lib/progress"
import { STATUS_STYLES } from "@/lib/interns"
import { cn } from "@/lib/utils"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function InternProfileManager({
  profile,
}: {
  profile: InternProfileView
}) {
  const router = useRouter()
  const { user, placement, details: initialDetails } = profile
  const [avatar, setAvatar] = React.useState<string | undefined>(user.avatar)
  const [details, setDetails] =
    React.useState<InternProfileDetails>(initialDetails)
  const [skillsText, setSkillsText] = React.useState(() =>
    initialDetails.skills.join(", ")
  )
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    setDetails(initialDetails)
    setSkillsText(initialDetails.skills.join(", "))
    setAvatar(getStoredAvatar("intern") ?? user.avatar)
  }, [initialDetails, user.avatar])

  function updateField<K extends keyof InternProfileDetails>(
    key: K,
    value: InternProfileDetails[K]
  ) {
    setDetails((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    const next: InternProfileDetails = {
      ...details,
      skills: parseSkillsInput(skillsText),
      bio: details.bio.trim(),
      location: details.location.trim(),
      university: details.university.trim(),
      linkedin: details.linkedin.trim(),
      github: details.github.trim(),
      emergencyName: details.emergencyName.trim(),
      emergencyPhone: details.emergencyPhone.trim(),
    }

    setSaving(true)
    setSaved(false)
    setError("")
    const result = await saveInternProfileDetails(next)
    setSaving(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setDetails(next)
    setSkillsText(next.skills.join(", "))
    setSaved(true)
    router.refresh()
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Your internship profile, placement details, and public skills.
        </p>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex items-start gap-4">
            <Avatar className="size-16 rounded-lg">
              {avatar && <AvatarImage src={avatar} alt={user.name} />}
              <AvatarFallback className="rounded-lg text-base">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 flex-1 gap-1">
              <CardTitle className="truncate text-xl">{user.name}</CardTitle>
              <CardDescription className="truncate">
                {user.title}
              </CardDescription>
              <p className="truncate text-sm text-muted-foreground">
                {user.email}
              </p>
              <div className="pt-1">
                <Link
                  href="/intern/account"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "rounded-sm"
                  )}
                >
                  Manage account & avatar
                </Link>
              </div>
            </div>
          </div>
        </CardHeader>
        {placement && (
          <CardContent className="grid gap-3 border-t pt-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Programme</span>
              <span className="min-w-0 text-right font-medium">
                {placement.programme}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Supervisor</span>
              <span className="min-w-0 text-right font-medium">
                {placement.supervisor}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Dates</span>
              <span className="min-w-0 text-right font-medium">
                {formatProgressDate(placement.startDate)} –{" "}
                {formatProgressDate(placement.endDate)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium tabular-nums">
                {placement.progress}%
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Status</span>
              <span
                className={cn(
                  "inline-flex rounded-sm px-2 py-0.5 text-xs font-medium",
                  STATUS_STYLES[placement.status]
                )}
              >
                {placement.status}
              </span>
            </div>
            <div className="grid gap-1.5 pt-1">
              <div className="h-1.5 overflow-hidden rounded-sm bg-muted">
                <div
                  className="h-full rounded-sm bg-primary"
                  style={{ width: `${placement.progress}%` }}
                />
              </div>
              <Link
                href="/intern/progress"
                className="text-xs text-muted-foreground hover:underline"
              >
                View full progress
              </Link>
            </div>
          </CardContent>
        )}
      </Card>

      <section className="rounded-lg border border-border">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium">About you</h2>
          <p className="text-xs text-muted-foreground">
            Bio, skills, and links visible to your supervisor.
          </p>
        </div>
        <form onSubmit={handleSave}>
          <div className="grid gap-6 px-4 pt-4 pb-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="profile-bio">Bio</FieldLabel>
                <Textarea
                  id="profile-bio"
                  value={details.bio}
                  onChange={(event) => updateField("bio", event.target.value)}
                  rows={4}
                  className="max-h-36 min-h-20 resize-none overflow-y-auto rounded-sm field-sizing-fixed wrap-break-word"
                  placeholder="A short summary of your focus and goals…"
                />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="profile-location">Location</FieldLabel>
                  <Input
                    id="profile-location"
                    value={details.location}
                    onChange={(event) =>
                      updateField("location", event.target.value)
                    }
                    placeholder="City, country"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="profile-university">
                    University
                  </FieldLabel>
                  <Input
                    id="profile-university"
                    value={details.university}
                    onChange={(event) =>
                      updateField("university", event.target.value)
                    }
                    placeholder="Institution name"
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="profile-skills">Skills</FieldLabel>
                <Input
                  id="profile-skills"
                  value={skillsText}
                  onChange={(event) => {
                    setSkillsText(event.target.value)
                    setSaved(false)
                  }}
                  placeholder="React, TypeScript, Git"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Separate skills with commas.
                </p>
                {parseSkillsInput(skillsText).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {parseSkillsInput(skillsText).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-sm bg-muted px-2 py-0.5 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="profile-linkedin">LinkedIn</FieldLabel>
                  <Input
                    id="profile-linkedin"
                    type="url"
                    value={details.linkedin}
                    onChange={(event) =>
                      updateField("linkedin", event.target.value)
                    }
                    placeholder="https://linkedin.com/in/…"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="profile-github">GitHub</FieldLabel>
                  <Input
                    id="profile-github"
                    type="url"
                    value={details.github}
                    onChange={(event) =>
                      updateField("github", event.target.value)
                    }
                    placeholder="https://github.com/…"
                  />
                </Field>
              </div>
            </FieldGroup>

            <Separator />

            <div className="grid gap-3">
              <div>
                <h3 className="text-sm font-medium">Emergency contact</h3>
                <p className="text-xs text-muted-foreground">
                  Used by programme staff if needed.
                </p>
              </div>
              <FieldGroup>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="profile-emergency-name">
                      Contact name
                    </FieldLabel>
                    <Input
                      id="profile-emergency-name"
                      value={details.emergencyName}
                      onChange={(event) =>
                        updateField("emergencyName", event.target.value)
                      }
                      placeholder="Full name"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="profile-emergency-phone">
                      Contact phone
                    </FieldLabel>
                    <Input
                      id="profile-emergency-phone"
                      value={details.emergencyPhone}
                      onChange={(event) =>
                        updateField("emergencyPhone", event.target.value)
                      }
                      placeholder="+27 …"
                    />
                  </Field>
                </div>
              </FieldGroup>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              {saved ? "Profile saved." : "Changes stay on this device for now."}
            </p>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="animate-spin" />}
              Save profile
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-border px-4 py-3">
        <h2 className="text-sm font-medium">Contact on file</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Update phone and email from Account settings.
        </p>
        <div className="mt-3 grid gap-2 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Phone</span>
            <span className="font-medium">{user.phone}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Department</span>
            <span className="font-medium">{user.department}</span>
          </div>
        </div>
      </section>
    </div>
  )
}
