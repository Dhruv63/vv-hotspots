import { updateSession } from "@/lib/supabase/proxy"
import type { NextRequest } from "next/server"

export default async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/settings/:path*',
    '/dashboard/:path*',
  ],
}
