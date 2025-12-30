import LandingDesktop from "./(landing)/components/LandingDesktop";
import LandingMobile from "./(landing)/components/LandingMobile";

export default function LandingPage() {
  return (
    <>
      <div className="block md:hidden">
        <LandingMobile />
      </div>
      <div className="hidden md:block">
        <LandingDesktop />
      </div>
    </>
  );
}
