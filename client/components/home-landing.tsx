import Image from "next/image"
import Link from "next/link"
import { GalleryVerticalEnd } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type HomeLandingProps = {
  dashboardHref?: string | null
}

const roles = [
  {
    title: "Admins",
    description:
      "Create accounts, enrol interns, and keep programmes running smoothly.",
  },
  {
    title: "Supervisors",
    description:
      "Assign work, review daily logs, and guide interns through each cohort.",
  },
  {
    title: "Interns",
    description:
      "Track tasks, submit logs, and follow progress from day one to close out.",
  },
]

export function HomeLanding({ dashboardHref = null }: HomeLandingProps) {
  const href = dashboardHref ?? "/login"
  const label = dashboardHref ? "Open dashboard" : "Sign in"

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="absolute inset-x-0 top-0 z-20 px-8 md:px-12">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-medium text-white"
          >
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            InkDot Inc.
          </Link>
          <nav className="flex items-center gap-4">
            <a
              href="#features"
              className="hidden text-sm text-white/80 transition-colors hover:text-white sm:inline"
            >
              Features
            </a>
            <a
              href="#roles"
              className="hidden text-sm text-white/80 transition-colors hover:text-white sm:inline"
            >
              Roles
            </a>
            <a
              href="#subscription"
              className="hidden text-sm text-white/80 transition-colors hover:text-white sm:inline"
            >
              Subscription
            </a>
            <Link
              href={href}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "border-white/25 bg-white/10 text-white hover:bg-white/15 hover:text-white"
              )}
            >
              {label}
            </Link>
          </nav>
        </div>
      </header>

      <section className="home-hero relative flex min-h-svh flex-col justify-center overflow-hidden bg-muted px-8 pb-16 pt-28 md:px-12 md:pb-24 md:pt-32">
        <Image
          src="/background.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover dark:brightness-[0.2] dark:grayscale"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="home-hero__copy flex max-w-xl flex-col gap-6 text-white">
            <p className="text-sm font-medium text-white/70">
              InkDot internship platform
            </p>
            <div className="flex flex-col gap-4">
              <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                Run every cohort from one quiet workspace.
              </h1>
              <p className="max-w-md text-pretty text-sm leading-relaxed text-white/75 sm:text-base">
                Enrol interns, assign mentors, and keep tasks, logs, and reviews
                moving without chasing updates across chats and spreadsheets.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href={href}
                className={cn(buttonVariants({ size: "lg" }), "min-w-36")}
              >
                {label}
              </Link>
              <a
                href="#features"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "min-w-36 border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
                )}
              >
                Learn more
              </a>
            </div>
          </div>

          <aside className="home-hero__aside w-full max-w-md justify-self-start lg:max-w-none lg:justify-self-end">
            <div className="rounded-sm border border-white/15 bg-white/10 p-5 text-white shadow-lg shadow-black/20 backdrop-blur-md sm:p-6">
              <p className="text-xs font-medium uppercase tracking-wide text-white/55">
                Programme flow
              </p>
              <ol className="mt-5 space-y-0">
                {[
                  {
                    step: "01",
                    title: "Enrol",
                    detail: "Create accounts and place interns into cohorts.",
                  },
                  {
                    step: "02",
                    title: "Mentor",
                    detail: "Assign supervisors, tasks, and daily check ins.",
                  },
                  {
                    step: "03",
                    title: "Review",
                    detail: "Track progress, feedback, and programme outcomes.",
                  },
                ].map((item, index) => (
                  <li
                    key={item.step}
                    className={cn(
                      "grid grid-cols-[2.5rem_1fr] gap-3 py-4",
                      index < 2 && "border-b border-white/10"
                    )}
                  >
                    <span className="pt-0.5 text-sm tabular-nums text-white/45">
                      {item.step}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-white/65">
                        {item.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </section>

      <section id="features" className="border-b border-border px-8 py-20 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_1.2fr] md:items-end md:gap-16">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-muted-foreground">Features</p>
            <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything your internship programme needs.
            </h2>
          </div>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            From enrolment to reviews, InkDot keeps admins, supervisors, and
            interns aligned with tasks, daily logs, messaging, and progress in a
            single workspace.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-6xl gap-8 sm:grid-cols-3">
          {[
            {
              title: "Programmes",
              detail: "Set up cohorts, capacity, and supervisor coverage.",
            },
            {
              title: "Day to day work",
              detail: "Assign tasks, collect logs, and follow mentorship.",
            },
            {
              title: "Clear progress",
              detail: "Reviews, notifications, and reports stay in sync.",
            },
          ].map((item) => (
            <div key={item.title} className="flex flex-col gap-2 border-t border-border pt-5">
              <h3 className="font-medium">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="roles" className="bg-muted/40 px-8 py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex max-w-2xl flex-col gap-3">
            <p className="text-sm font-medium text-muted-foreground">Roles</p>
            <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              Built for everyone in the programme.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {roles.map((role) => (
              <div
                key={role.title}
                className="rounded-sm bg-card p-5 ring-1 ring-foreground/10"
              >
                <h3 className="font-medium">{role.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {role.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="subscription" className="border-y border-border px-8 py-16 md:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Subscription
            </h2>
            <p className="text-sm text-muted-foreground">
              One plan for your whole programme at R499/mo.
            </p>
          </div>
          <Link
            href={href}
            className={cn(buttonVariants({ size: "lg" }), "min-w-36 shrink-0")}
          >
            {dashboardHref ? "Open dashboard" : "Subscribe"}
          </Link>
        </div>
      </section>

      <footer className="mt-auto px-8 py-10 md:px-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-2">
              <Link href="/" className="flex items-center gap-2 font-medium">
                <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                InkDot Inc.
              </Link>
              <p className="text-sm text-muted-foreground">
                Intern Management System
              </p>
            </div>

            <div className="flex gap-10 text-sm">
              <div className="flex flex-col gap-2">
                <p className="font-medium">Product</p>
                <a
                  href="#features"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Features
                </a>
                <a
                  href="#roles"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Roles
                </a>
                <a
                  href="#subscription"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Subscription
                </a>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-medium">Account</p>
                <Link
                  href={href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </Link>
                <Link
                  href="/login"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} InkDot Inc.</p>
            <p>Built for internship programmes.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
