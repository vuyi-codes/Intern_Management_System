import { AdminProgrammesManager } from "@/components/admin-programmes-manager"
import { loadAdminProgrammes } from "@/lib/admin-data"

export default async function AdminProgrammesPage() {
  const { programmes, leads, enrolledCounts, error } = await loadAdminProgrammes()

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <AdminProgrammesManager
        programmes={programmes}
        leads={leads}
        enrolledCounts={enrolledCounts}
      />
    </div>
  )
}
