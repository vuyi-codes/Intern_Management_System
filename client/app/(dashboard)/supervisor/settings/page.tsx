import { DashboardSettings } from "@/components/dashboard-settings"
import { loadSupervisorSettings } from "@/lib/supervisor-data"

export default async function SupervisorSettingsPage() {
  const { settings, error } = await loadSupervisorSettings()

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <DashboardSettings role="supervisor" remote={settings} />
    </div>
  )
}
