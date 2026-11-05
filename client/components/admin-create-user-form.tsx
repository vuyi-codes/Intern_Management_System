"use client"

import { useActionState } from "react"
import { Loader2 } from "lucide-react"

import {
  createManagedUser,
  type CreateUserState,
} from "@/app/actions/admin-users"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const initialState: CreateUserState = {}

type AdminCreateUserFormProps = {
  defaultRole?: "intern" | "supervisor" | "admin"
}

export function AdminCreateUserForm({
  defaultRole = "intern",
}: AdminCreateUserFormProps) {
  const [state, formAction, isPending] = useActionState(
    createManagedUser,
    initialState
  )

  return (
    <form action={formAction} className="grid gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="full_name">Full name</FieldLabel>
          <Input id="full_name" name="full_name" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Temporary password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            minLength={8}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="role">Role</FieldLabel>
          <select
            id="role"
            name="role"
            defaultValue={defaultRole}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="intern">Intern</option>
            <option value="supervisor">Supervisor</option>
            <option value="admin">Admin</option>
          </select>
        </Field>
        <Field>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input id="title" name="title" />
        </Field>
        <Field>
          <FieldLabel htmlFor="phone">Phone</FieldLabel>
          <Input id="phone" name="phone" />
        </Field>
        <Field>
          <FieldLabel htmlFor="department">Department</FieldLabel>
          <Input id="department" name="department" />
        </Field>
      </FieldGroup>

      {state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400" role="status">
          {state.success}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {isPending ? "Creating..." : "Create account"}
      </Button>
    </form>
  )
}
