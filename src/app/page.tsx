import { LangProvider } from "@/contexts/LangContext";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustStrip from "@/components/TrustStrip";
import Services from "@/components/Services";
import Nenkin from "@/components/Nenkin";
import Flow from "@/components/Flow";
import Visa from "@/components/Visa";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <LangProvider>
      <main>
        <Navbar />
        <Hero />
        <TrustStrip />
        <Services />
        <Nenkin />
        <Flow />
        <Visa />
        <Contact />
        <Footer />
      </main>
    </LangProvider>
  );
}
