import { AdminReportsManager } from "@/components/admin-reports-manager"
import { loadAdminReports } from "@/lib/admin-data"

export default async function AdminReportsPage() {
  const { reports, error } = await loadAdminReports()

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <AdminReportsManager reports={reports} />
    </div>
  )
}
