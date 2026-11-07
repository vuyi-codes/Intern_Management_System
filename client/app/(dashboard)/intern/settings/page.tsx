import { DashboardSettings } from "@/components/dashboard-settings"
import { loadInternSettings } from "@/lib/intern-data"

export default async function InternSettingsPage() {
  const { settings, error } = await loadInternSettings()

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <DashboardSettings role="intern" remote={settings} />
    </div>
  )
}
