import { InternProfileManager } from "@/components/intern-profile-manager"
import { loadInternProfilePage } from "@/lib/intern-data"

export default async function InternProfilePage() {
  const { profile, error } = await loadInternProfilePage()

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <InternProfileManager profile={profile} />
    </div>
  )
}
