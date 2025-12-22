'use client';

import AIPlannerMobile from './AIPlannerMobile';
import AIPlannerDesktop from './AIPlannerDesktop';

export default function AIPlannerPage() {
  return (
    <>
      {/* Mobile version - shows on screens < 768px */}
      <div className="block md:hidden">
        <AIPlannerMobile />
      </div>

      {/* Desktop version - shows on screens >= 768px */}
      <div className="hidden md:block">
        <AIPlannerDesktop />
      </div>
    </>
  );
}
