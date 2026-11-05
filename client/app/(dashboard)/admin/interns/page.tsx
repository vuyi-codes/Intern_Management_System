import { AdminCreateUserForm } from "@/components/admin-create-user-form"
import { AdminInternsManager } from "@/components/admin-interns-manager"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function AdminInternsPage() {
  return (
    <div className="flex flex-col gap-6">
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
      <AdminInternsManager />
    </div>
  )
}
