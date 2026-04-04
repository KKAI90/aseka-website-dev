import Navbar from "@/components/Navbar";
import HomeHero from "@/components/HomeHero";
import StatsStrip from "@/components/StatsStrip";
import Services from "@/components/Services";
import Philosophy from "@/components/Philosophy";
import PhotoStrip from "@/components/PhotoStrip";
import TopMessage from "@/components/TopMessage";
import CompanyInfo from "@/components/CompanyInfo";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HomeHero />
      <StatsStrip />
      <Services />
      <Philosophy />
      <PhotoStrip />
      <TopMessage />
      <CompanyInfo />
      <ContactCTA />
      <Footer />
    </main>
  );
}
