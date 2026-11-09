import { AdminSupervisorsManager } from "@/components/admin-supervisors-manager"
import { loadAdminSupervisors } from "@/lib/admin-data"

export default async function AdminSupervisorsPage() {
  const { supervisors, programmes, assignedCounts, error } =
    await loadAdminSupervisors()

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <AdminSupervisorsManager
        supervisors={supervisors}
        programmes={programmes}
        assignedCounts={assignedCounts}
      />
    </div>
  )
}
