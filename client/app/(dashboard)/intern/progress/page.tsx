import { InternProgressManager } from "@/components/intern-progress-manager"
import { loadInternProgress } from "@/lib/intern-data"

export default async function InternProgressPage() {
  const { progress, error } = await loadInternProgress()

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <InternProgressManager progress={progress} />
    </div>
  )
}
