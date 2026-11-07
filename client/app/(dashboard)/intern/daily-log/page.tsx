import { InternDailyLogManager } from "@/components/intern-daily-log-manager"
import { loadInternLogs } from "@/lib/intern-data"

export default async function InternDailyLogPage() {
  const { logs, today, error } = await loadInternLogs()

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <InternDailyLogManager logs={logs} today={today} />
    </div>
  )
}
