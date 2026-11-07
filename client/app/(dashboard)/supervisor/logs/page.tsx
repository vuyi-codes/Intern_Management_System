import { SupervisorLogsManager } from "@/components/supervisor-logs-manager"
import { loadSupervisorLogs } from "@/lib/supervisor-data"

export default async function SupervisorLogsPage() {
  const { logs, interns, supervisorName, today, error } =
    await loadSupervisorLogs()

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <SupervisorLogsManager
        logs={logs}
        interns={interns}
        supervisorName={supervisorName}
        today={today}
      />
    </div>
  )
}
