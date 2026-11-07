import { DashboardSettings } from "@/components/dashboard-settings"
import { loadAdminSettings } from "@/lib/admin-data"

export default async function AdminSettingsPage() {
  const { settings, error } = await loadAdminSettings()

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <DashboardSettings role="admin" remote={settings} />
    </div>
  )
}
