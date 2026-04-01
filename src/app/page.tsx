import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Philosophy from "@/components/Philosophy";
import TopMessage from "@/components/TopMessage";
import CompanyInfo from "@/components/CompanyInfo";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Philosophy />
      <TopMessage />
      <CompanyInfo />
      <Footer />
    </main>
  );
}
