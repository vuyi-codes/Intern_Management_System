import {
  AccountPageHeading,
  AccountSettings,
} from "@/components/account-settings"

export default function InternAccountPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <AccountPageHeading role="intern" />
      <AccountSettings role="intern" />
    </div>
  )
}
