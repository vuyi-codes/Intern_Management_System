import { SupervisorTasksManager } from "@/components/supervisor-tasks-manager"
import { loadSupervisorTasks } from "@/lib/supervisor-data"

export default async function SupervisorTasksPage() {
  const { tasks, interns, supervisorName, error } = await loadSupervisorTasks()

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <SupervisorTasksManager
        tasks={tasks}
        interns={interns}
        supervisorName={supervisorName}
      />
    </div>
  )
}
