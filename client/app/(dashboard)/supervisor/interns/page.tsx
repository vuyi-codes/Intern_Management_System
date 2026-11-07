import { SupervisorInternsManager } from "@/components/supervisor-interns-manager"
import { loadSupervisorInterns } from "@/lib/supervisor-data"

export default async function SupervisorInternsPage() {
  const { interns, supervisorName, error } = await loadSupervisorInterns()

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <SupervisorInternsManager
        interns={interns}
        supervisorName={supervisorName}
      />
    </div>
  )
}
