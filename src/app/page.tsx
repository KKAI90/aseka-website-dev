import Navbar from "@/components/Navbar";
import HomeHero from "@/components/HomeHero";
import StatsStrip from "@/components/StatsStrip";
import HomeInfluencer from "@/components/HomeInfluencer";
import HomeNetwork from "@/components/HomeNetwork";
import WhyAseka from "@/components/WhyAseka";
import HomeStrengths from "@/components/HomeStrengths";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";

export default function TopPage() {
  return (
    <main>
      <Navbar />
      <HomeHero />
      <StatsStrip />
      <HomeInfluencer />
      <HomeNetwork />
      <WhyAseka />
      <HomeStrengths />
      <ContactCTA />
      <Footer />
    </main>
  );
}
