"use client"

import { useActionState, useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { cn } from "cn"

import {
  signInWithGoogle,
  signInWithPassword,
  type AuthActionState,
} from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const initialState: AuthActionState = {}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [state, formAction, isPending] = useActionState(
    signInWithPassword,
    initialState
  )
  const [googlePending, startGoogle] = useTransition()
  const [googleError, setGoogleError] = useState<string | null>(null)

  useEffect(() => {
    if (!state.redirectTo) return
    router.replace(state.redirectTo)
    router.refresh()
  }, [state.redirectTo, router])

  function handleGoogle() {
    setGoogleError(null)
    startGoogle(async () => {
      const result = await signInWithGoogle()
      if (result?.error) {
        setGoogleError(result.error)
        return
      }
      if (result?.redirectTo) {
        window.location.assign(result.redirectTo)
      }
    })
  }

  const busy = isPending || googlePending || Boolean(state.redirectTo)

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="pr-16"
                    autoComplete="current-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute inset-y-0 right-1 my-auto h-7 px-2 text-xs text-muted-foreground hover:text-foreground active:translate-y-0"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-pressed={showPassword}
                    aria-controls="password"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </Button>
                </div>
              </Field>
              {(state.error || googleError) && (
                <p className="text-sm text-destructive" role="alert">
                  {state.error || googleError}
                </p>
              )}
              <Field>
                <Button type="submit" disabled={busy}>
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  {isPending ? "Logging in..." : "Login"}
                </Button>
                <FieldSeparator className="my-2 *:data-[slot=field-separator-content]:bg-card">
                  Or continue with
                </FieldSeparator>
                <Button
                  variant="outline"
                  type="button"
                  disabled={busy}
                  onClick={handleGoogle}
                >
                  {googlePending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="size-4"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  )}
                  Continue with Google
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
