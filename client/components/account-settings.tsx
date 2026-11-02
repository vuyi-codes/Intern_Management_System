"use client"

import * as React from "react"
import { ImagePlus, Loader2 } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  getStoredAvatar,
  setStoredAvatar,
  STOCK_AVATARS,
} from "@/lib/avatars"
import { getUserForRole, type AppUser } from "@/lib/users"
import { roleLabels, type Role } from "@/lib/nav"
import { cn } from "@/lib/utils"

export function AccountPageHeading({ role }: { role: Role }) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold">Account</h1>
      <p className="text-sm text-muted-foreground">
        Manage your profile and sign-in details for your{" "}
        {roleLabels[role].toLowerCase()} account.
      </p>
    </div>
  )
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

type AccountSettingsProps = {
  role: Role
  className?: string
}

export function AccountSettings({ role, className }: AccountSettingsProps) {
  const initialUser = getUserForRole(role)
  const [profile, setProfile] = React.useState<AppUser>(initialUser)
  const [password, setPassword] = React.useState({
    current: "",
    next: "",
    confirm: "",
  })
  const [savingProfile, setSavingProfile] = React.useState(false)
  const [savingPassword, setSavingPassword] = React.useState(false)
  const [profileSaved, setProfileSaved] = React.useState(false)
  const [passwordSaved, setPasswordSaved] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const user = getUserForRole(role)
    const stored = getStoredAvatar(role)
    setProfile({ ...user, avatar: stored ?? user.avatar })
  }, [role])

  function updateProfile<K extends keyof AppUser>(key: K, value: AppUser[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }))
    setProfileSaved(false)
  }

  function applyAvatar(src: string | undefined) {
    updateProfile("avatar", src)
    setStoredAvatar(role, src)
  }

  function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith("image/")) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        applyAvatar(reader.result)
      }
    }
    reader.readAsDataURL(file)
    event.target.value = ""
  }

  function handleSaveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingProfile(true)
    setProfileSaved(false)

    window.setTimeout(() => {
      setSavingProfile(false)
      setProfileSaved(true)
    }, 800)
  }

  function handleSavePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!password.current || !password.next || password.next !== password.confirm) {
      return
    }

    setSavingPassword(true)
    setPasswordSaved(false)

    window.setTimeout(() => {
      setSavingPassword(false)
      setPasswordSaved(true)
      setPassword({ current: "", next: "", confirm: "" })
    }, 800)
  }

  return (
    <div className={cn("flex w-full flex-col gap-6", className)}>
      <section className="rounded-lg border border-border">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium">Profile</h2>
          <p className="text-xs text-muted-foreground">
            This information is shown across the intern management system.
          </p>
        </div>
        <form onSubmit={handleSaveProfile}>
          <div className="grid gap-6 px-4 pt-4 pb-8">
            <div className="grid gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="size-16 rounded-lg">
                  {profile.avatar && (
                    <AvatarImage src={profile.avatar} alt={profile.name} />
                  )}
                  <AvatarFallback className="rounded-lg text-base">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid min-w-0 flex-1 gap-2">
                  <div className="grid gap-0.5">
                    <p className="truncate text-sm font-medium">{profile.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {profile.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Role · {roleLabels[role]}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImagePlus />
                      Upload photo
                    </Button>
                    {profile.avatar && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => applyAvatar(undefined)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <p className="text-sm font-medium">Stock avatars</p>
                <p className="text-xs text-muted-foreground">
                  Pick a default avatar provided by InkDot.
                </p>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                  {STOCK_AVATARS.map((avatar) => {
                    const selected = profile.avatar === avatar.src
                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        title={avatar.label}
                        aria-label={`Use ${avatar.label} avatar`}
                        aria-pressed={selected}
                        onClick={() => applyAvatar(avatar.src)}
                        className={cn(
                          "overflow-hidden rounded-sm border border-border p-0.5 transition-colors hover:border-foreground/40",
                          selected && "border-primary ring-2 ring-primary/30"
                        )}
                      >
                        <Avatar className="aspect-square size-full rounded-[2px]">
                          <AvatarImage src={avatar.src} alt={avatar.label} />
                          <AvatarFallback className="rounded-[2px] text-[10px]">
                            {avatar.label.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <Separator />

            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="name">Full name</FieldLabel>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(event) =>
                      updateProfile("name", event.target.value)
                    }
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(event) =>
                      updateProfile("email", event.target.value)
                    }
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone">Phone</FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(event) =>
                      updateProfile("phone", event.target.value)
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="title">Job title</FieldLabel>
                  <Input
                    id="title"
                    value={profile.title}
                    onChange={(event) =>
                      updateProfile("title", event.target.value)
                    }
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="department">Department</FieldLabel>
                <Input
                  id="department"
                  value={profile.department}
                  onChange={(event) =>
                    updateProfile("department", event.target.value)
                  }
                />
              </Field>
            </FieldGroup>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-4">
            <p className="text-sm text-muted-foreground">
              {profileSaved ? "Profile saved." : "Update your personal details."}
            </p>
            <Button type="submit" disabled={savingProfile}>
              {savingProfile && <Loader2 className="size-4 animate-spin" />}
              {savingProfile ? "Saving..." : "Save profile"}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-border">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium">Password</h2>
          <p className="text-xs text-muted-foreground">
            Choose a strong password you do not use elsewhere.
          </p>
        </div>
        <form onSubmit={handleSavePassword}>
          <div className="px-4 pt-4 pb-8">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="current-password">
                  Current password
                </FieldLabel>
                <Input
                  id="current-password"
                  type="password"
                  value={password.current}
                  onChange={(event) =>
                    setPassword((prev) => ({
                      ...prev,
                      current: event.target.value,
                    }))
                  }
                  required
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="new-password">New password</FieldLabel>
                  <Input
                    id="new-password"
                    type="password"
                    value={password.next}
                    onChange={(event) => {
                      setPasswordSaved(false)
                      setPassword((prev) => ({
                        ...prev,
                        next: event.target.value,
                      }))
                    }}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirm-password">
                    Confirm password
                  </FieldLabel>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={password.confirm}
                    onChange={(event) => {
                      setPasswordSaved(false)
                      setPassword((prev) => ({
                        ...prev,
                        confirm: event.target.value,
                      }))
                    }}
                    required
                  />
                </Field>
              </div>
            </FieldGroup>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-4">
            <p className="text-sm text-muted-foreground">
              {passwordSaved
                ? "Password updated."
                : password.next &&
                    password.confirm &&
                    password.next !== password.confirm
                  ? "New passwords do not match."
                  : "Leave blank fields unused until you are ready to change it."}
            </p>
            <Button
              type="submit"
              disabled={
                savingPassword ||
                !password.current ||
                !password.next ||
                password.next !== password.confirm
              }
            >
              {savingPassword && <Loader2 className="size-4 animate-spin" />}
              {savingPassword ? "Updating..." : "Update password"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}
