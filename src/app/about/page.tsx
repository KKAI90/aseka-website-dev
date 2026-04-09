import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
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
      <PhotoStrip />
      <TopMessage />
      <CompanyInfo />
      <ContactCTA />
      <Footer />
    </main>
  );
}
