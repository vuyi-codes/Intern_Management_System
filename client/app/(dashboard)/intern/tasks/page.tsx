import { InternTasksManager } from "@/components/intern-tasks-manager"
import { loadInternTasks } from "@/lib/intern-data"

export default async function InternTasksPage() {
  const { tasks, error } = await loadInternTasks()

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <InternTasksManager tasks={tasks} />
    </div>
  )
}
