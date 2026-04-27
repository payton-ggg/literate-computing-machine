import LandingNav from "../components/LandingNav";
import HeroSection from "../components/HeroSection";
import ProblemSection from "../components/ProblemSection";
import SignalsSection from "../components/SignalsSection";
import StepsSection from "../components/StepsSection";
import FoundersSection from "../components/FoundersSection";
import SecuritySection from "../components/SecuritySection";
import PricingSection from "../components/PricingSection";
import FinalCtaSection from "../components/FinalCtaSection";
import LandingFooter from "../components/LandingFooter";
import "../landing.css";

export default function LandingPage() {
  return (
    <div className="landing">
      <LandingNav />
      <main id="top">
        <HeroSection />
        <ProblemSection />
        <SignalsSection />
        <StepsSection />
        <FoundersSection />
        <SecuritySection />
        <PricingSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
