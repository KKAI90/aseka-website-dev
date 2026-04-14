import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CompanyHero from "@/components/company/CompanyHero";
import CompanyIntroBand from "@/components/company/CompanyIntroBand";
import CompanyPlacement from "@/components/company/CompanyPlacement";
import CompanyFlow from "@/components/company/CompanyFlow";
import CompanyCases from "@/components/company/CompanyCases";
import CompanyTraining from "@/components/company/CompanyTraining";
import ContactCTA from "@/components/ContactCTA";

export const metadata = {
  title: "COMPANY | 株式会社ASEKA",
  description: "ASEKAの事業内容 — 人材紹介・特定技能支援・人材育成サービス。",
};

export default function CompanyPage() {
  return (
    <main>
      <Navbar />
      <CompanyHero />
      <CompanyIntroBand />
      <CompanyPlacement />
      <CompanyFlow />
      <CompanyCases />
      <CompanyTraining />
      <ContactCTA />
      <Footer />
    </main>
  );
}
