import { Loader2 } from "lucide-react"

export default function FriendsLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <Loader2 className="h-8 w-8 animate-spin text-[#FFFF00]" />
    </div>
  )
}
