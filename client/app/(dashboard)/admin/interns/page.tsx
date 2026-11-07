import { AdminCreateUserForm } from "@/components/admin-create-user-form"
import { AdminInternsManager } from "@/components/admin-interns-manager"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { loadAdminInterns } from "@/lib/admin-data"

export default async function AdminInternsPage() {
  const { interns, programmes, supervisors, error } = await loadAdminInterns()

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Card>
        <CardHeader>
          <CardTitle>Create intern account</CardTitle>
          <CardDescription>
            Admins create auth accounts here. Public signup is disabled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminCreateUserForm defaultRole="intern" />
        </CardContent>
      </Card>
      <AdminInternsManager
        interns={interns}
        programmes={programmes}
        supervisors={supervisors}
      />
    </div>
  )
}
