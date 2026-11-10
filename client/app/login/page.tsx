import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/login-form"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <Image
        src="/background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover dark:brightness-[0.2] dark:grayscale"
      />
      <div className="absolute inset-0 bg-black/50" />

      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "absolute top-6 left-6 z-20 text-white hover:bg-white/10 hover:text-white md:top-10 md:left-10"
        )}
      >
        <ArrowLeft />
        Back
      </Link>

      <div className="relative z-10 flex w-full max-w-sm flex-col gap-6 text-white">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          InkDot Inc.
        </Link>
        <LoginForm />
      </div>
    </div>
  )
}
