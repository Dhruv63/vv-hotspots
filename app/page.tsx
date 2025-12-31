import { createClient } from "@/lib/supabase/server"
import LandingDesktop from "./(landing)/components/LandingDesktop";
import LandingMobile from "./(landing)/components/LandingMobile";
import { AuthCodeRedirect } from "@/components/auth-code-redirect";
import { Suspense } from "react";

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <>
      <Suspense fallback={null}>
        <AuthCodeRedirect />
      </Suspense>

      {/* Mobile: Show only on small screens */}
      <div className="block md:hidden">
        <LandingMobile user={user} />
      </div>

      {/* Desktop: Show only on medium+ screens */}
      <div className="hidden md:block">
        <LandingDesktop user={user} />
      </div>
    </>
  );
}
