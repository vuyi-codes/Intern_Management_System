import type { Role } from "@/lib/nav"

export type OpenMessagesDetail = {
  peerId?: string
  role?: Extract<Role, "intern" | "supervisor">
}

/** Open the header messages drawer (optionally focused on a peer). */
export function openMessagesDrawer(peerId?: string) {
  if (typeof window === "undefined") return
  window.dispatchEvent(
    new CustomEvent<OpenMessagesDetail>("inkdot-open-messages", {
      detail: { peerId },
    })
  )
}
