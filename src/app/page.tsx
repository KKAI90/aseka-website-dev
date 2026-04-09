import Navbar from "@/components/Navbar";
import HomeHero from "@/components/HomeHero";
import StatsStrip from "@/components/StatsStrip";
import HomeInfluencer from "@/components/HomeInfluencer";
import HomeNetwork from "@/components/HomeNetwork";
import Services from "@/components/Services";
import WhyAseka from "@/components/WhyAseka";
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
      <Services />
      <WhyAseka />
      <ContactCTA />
      <Footer />
    </main>
  );
}
