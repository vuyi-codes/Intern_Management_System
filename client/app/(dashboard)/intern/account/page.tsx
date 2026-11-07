import {
  AccountPageHeading,
  AccountSettings,
} from "@/components/account-settings"
import { requireRole } from "@/lib/auth"

export default async function InternAccountPage() {
  const profile = await requireRole("intern")

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <AccountPageHeading role="intern" />
      <AccountSettings
        role="intern"
        user={{
          name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          title: profile.title,
          department: profile.department,
          avatar: profile.avatar_url ?? undefined,
        }}
      />
    </div>
  )
}
