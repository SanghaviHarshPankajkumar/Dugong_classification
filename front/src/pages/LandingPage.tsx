import SignInSection from "@/components/landing/SignInSection";
import HeroSection from "@/components/landing/HeroSection";

export default function LandingPage() {
  return (
    <div className="flex flex-col md:flex-row h-screen w-full p-4">
      <div className="md:w-3/5 w-full">
        <HeroSection />
      </div>
      <div className="md:w-2/5 w-full">
        <SignInSection />
      </div>
    </div>
  );
}
