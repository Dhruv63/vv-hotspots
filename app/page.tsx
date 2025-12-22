'use client';

import LandingMobile from './(landing)/components/LandingMobile';
import LandingDesktop from './(landing)/components/LandingDesktop';

export default function LandingPage() {
  return (
    <>
      {/* Mobile version - ONLY shows on screens < 768px */}
      <div className="block md:hidden">
        <LandingMobile />
      </div>

      {/* Desktop version - ONLY shows on screens >= 768px */}
      <div className="hidden md:block">
        <LandingDesktop />
      </div>
    </>
  );
}
