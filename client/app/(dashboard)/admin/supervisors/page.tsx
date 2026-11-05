import { AdminCreateUserForm } from "@/components/admin-create-user-form"
import { AdminSupervisorsManager } from "@/components/admin-supervisors-manager"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function AdminSupervisorsPage() {
  return (
    <div className="flex flex-col gap-6">
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
      <AdminSupervisorsManager />
    </div>
  )
}
