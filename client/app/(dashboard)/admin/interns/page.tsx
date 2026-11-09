import { AdminInternsManager } from "@/components/admin-interns-manager"
import { loadAdminInterns } from "@/lib/admin-data"

export default async function AdminInternsPage() {
  const { interns, programmes, supervisors, error } = await loadAdminInterns()

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <AdminInternsManager
        interns={interns}
        programmes={programmes}
        supervisors={supervisors}
      />
    </div>
  )
}
