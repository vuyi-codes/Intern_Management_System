import { SupervisorReviewsManager } from "@/components/supervisor-reviews-manager"
import { loadSupervisorReviews } from "@/lib/supervisor-data"

export default async function SupervisorReviewsPage() {
  const { reviews, interns, supervisorName, error } =
    await loadSupervisorReviews()

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <SupervisorReviewsManager
        reviews={reviews}
        interns={interns}
        supervisorName={supervisorName}
      />
    </div>
  )
}
