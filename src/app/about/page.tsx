import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Philosophy from "@/components/Philosophy";
import PhotoStrip from "@/components/PhotoStrip";
import TopMessage from "@/components/TopMessage";
import CompanyInfo from "@/components/CompanyInfo";
import ContactCTA from "@/components/ContactCTA";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Philosophy />
      <PhotoStrip />
      <TopMessage />
      <CompanyInfo />
      <ContactCTA />
      <Footer />
    </main>
  );
}
