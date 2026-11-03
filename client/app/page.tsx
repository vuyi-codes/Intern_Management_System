import { HomeRedirect } from "@/components/home-redirect"

// Avoid server redirect() — it fails Cache Components instant validation.
export const instant = false

export default function Home() {
  return <HomeRedirect />
}
