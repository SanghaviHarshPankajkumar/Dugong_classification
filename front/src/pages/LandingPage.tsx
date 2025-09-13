import HeroSection from "@/components/landing/HeroSection";
import SignInSection from "@/components/landing/SignInSection";

export default function LandingPage() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full p-4">
      {/* Hero on left */}
      <div className="md:w-3/5 w-full mb-6 md:mb-0">
        <HeroSection />
      </div>

      {/* SignIn on right */}
      <div className="md:w-2/5 w-full">
        <SignInSection />
      </div>
    </div>
  );
}
