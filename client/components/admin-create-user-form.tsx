"use client"

import { useActionState, useEffect, useRef } from "react"
import { Loader2, UserRoundPlus } from "lucide-react"

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
  fixedRole?: boolean
  onCancel?: () => void
  onSuccess?: () => void
}

export function AdminCreateUserForm({
  defaultRole = "intern",
  fixedRole = false,
  onCancel,
  onSuccess,
}: AdminCreateUserFormProps) {
  const [state, formAction, isPending] = useActionState(
    createManagedUser,
    initialState
  )
  const onSuccessRef = useRef(onSuccess)
  const handledSuccessRef = useRef<string | null>(null)

  useEffect(() => {
    onSuccessRef.current = onSuccess
  }, [onSuccess])

  useEffect(() => {
    if (!state.success || handledSuccessRef.current === state.success) return
    handledSuccessRef.current = state.success
    onSuccessRef.current?.()
  }, [state.success])

  const dialogLayout = Boolean(onCancel)

  return (
    <form
      action={formAction}
      className={
        dialogLayout
          ? "flex min-h-0 flex-1 flex-col overflow-hidden"
          : "grid gap-4"
      }
    >
      <div
        className={
          dialogLayout ? "min-h-0 flex-1 space-y-4 overflow-y-auto" : "contents"
        }
      >
        <FieldGroup
          className={
            dialogLayout ? "grid grid-cols-1 gap-4 px-4 pt-4 pb-1" : undefined
          }
        >
          <Field className="min-w-0 flex-col">
            <FieldLabel htmlFor="full_name">Full name</FieldLabel>
            <Input id="full_name" name="full_name" required />
          </Field>
          <Field className="min-w-0 flex-col">
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" name="email" type="email" required />
          </Field>
          <Field className="min-w-0 flex-col">
            <FieldLabel htmlFor="password">Temporary password</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={8}
              required
            />
          </Field>
          {fixedRole ? (
            <input type="hidden" name="role" value={defaultRole} />
          ) : (
            <Field className="min-w-0 flex-col">
              <FieldLabel htmlFor="role">Role</FieldLabel>
              <select
                id="role"
                name="role"
                defaultValue={defaultRole}
                className="flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="intern">Intern</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
          )}
          <Field className="min-w-0 flex-col">
            <FieldLabel htmlFor="title">Title</FieldLabel>
            <Input id="title" name="title" />
          </Field>
          <Field className="min-w-0 flex-col">
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input id="phone" name="phone" />
          </Field>
          <Field className="min-w-0 flex-col">
            <FieldLabel htmlFor="department">Department</FieldLabel>
            <Input id="department" name="department" />
          </Field>
        </FieldGroup>

        {state.error && (
          <p
            className={`text-sm text-destructive ${dialogLayout ? "px-4" : ""}`}
            role="alert"
          >
            {state.error}
          </p>
        )}
        {state.success && (
          <p
            className={`text-sm text-emerald-600 dark:text-emerald-400 ${dialogLayout ? "px-4 pb-2" : ""}`}
            role="status"
          >
            {state.success}
          </p>
        )}
      </div>

      <div
        className={
          dialogLayout
            ? "flex shrink-0 flex-col-reverse gap-2 border-t border-border p-3 sm:flex-row sm:justify-end"
            : undefined
        }
      >
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <UserRoundPlus />
          )}
          {isPending ? "Creating..." : "Create account"}
        </Button>
      </div>
    </form>
  )
}
