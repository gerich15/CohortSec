import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import SecurityHacks from "../components/landing/SecurityHacks";
import QuantumEncryption from "../components/landing/QuantumEncryption";
import PasswordCheckSection from "../components/landing/PasswordCheckSection";
import DigitalHygiene from "../components/landing/DigitalHygiene";
import HowItWorks from "../components/landing/HowItWorks";
import SecurityBlock from "../components/landing/SecurityBlock";
import CTA from "../components/landing/CTA";

export default function Landing() {
  return (
    <div className="w-full min-h-screen bg-vg-bg">
      <Hero />
      <Features />
      <SecurityHacks />
      <QuantumEncryption />
      <PasswordCheckSection />
      <DigitalHygiene />
      <HowItWorks />
      <SecurityBlock />
      <CTA />
    </div>
  );
}
