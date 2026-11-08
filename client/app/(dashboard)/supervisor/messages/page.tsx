"use client"

import * as React from "react"

import { buttonVariants } from "@/components/ui/button"
import { openMessagesDrawer } from "@/lib/messages"
import { cn } from "@/lib/utils"

export default function SupervisorMessagesPage() {
  React.useEffect(() => {
    openMessagesDrawer()
  }, [])

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl font-semibold">Messages</h1>
      <p className="text-sm text-muted-foreground">
        Chat with your assigned interns from the messages panel.
      </p>
      <button
        type="button"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}
        onClick={() => openMessagesDrawer()}
      >
        Open messages
      </button>
    </div>
  )
}
