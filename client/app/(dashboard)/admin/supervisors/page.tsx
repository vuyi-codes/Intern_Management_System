import { AdminCreateUserForm } from "@/components/admin-create-user-form"
import { AdminSupervisorsManager } from "@/components/admin-supervisors-manager"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { loadAdminSupervisors } from "@/lib/admin-data"

export default async function AdminSupervisorsPage() {
  const { supervisors, programmes, assignedCounts, error } =
    await loadAdminSupervisors()

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Card>
        <CardHeader>
          <CardTitle>Create supervisor account</CardTitle>
          <CardDescription>
            Creates a Supabase auth user and promotes their profile to
            supervisor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminCreateUserForm defaultRole="supervisor" />
        </CardContent>
      </Card>
      <AdminSupervisorsManager
        supervisors={supervisors}
        programmes={programmes}
        assignedCounts={assignedCounts}
      />
    </div>
  )
}
