import Navbar from "@/components/Navbar";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export const metadata = {
  title: "お問い合わせ | ASEKA株式会社",
  description: "ASEKAへのお問い合わせはこちら。人材紹介・年金・ビザサポートについてご相談ください。",
};

function ContactHero() {
  return (
    <div style={{
      height: "52vh",
      minHeight: "380px",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
    }}>
      {/* Background photo */}
      <img
        src="/images/office-meeting.jpg"
        alt="ASEKA Contact"
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          objectPosition: "center 35%",
        }}
      />

      {/* Subtle light overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "rgba(240,236,228,0.22)",
      }} />

      {/* Right-side gradient */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to left, rgba(250,247,242,0.78) 0%, rgba(250,247,242,0.2) 55%, transparent 100%)",
      }} />

      {/* Text — right side */}
      <div style={{
        position: "relative", zIndex: 2,
        padding: "0 72px 0 0",
        maxWidth: "540px",
        textAlign: "right",
      }}>
        <h1 style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "clamp(44px, 6.5vw, 80px)",
          fontWeight: 700,
          color: "#0C1F2E",
          letterSpacing: "-1px",
          lineHeight: 1,
          margin: 0,
          whiteSpace: "nowrap",
        }}>
          CONTACT
        </h1>

        <div style={{
          height: "3px",
          background: "linear-gradient(to left, var(--gold) 0%, rgba(184,150,62,0.15) 100%)",
          margin: "20px 0 18px",
          borderRadius: "2px",
        }} />

        <p style={{
          fontFamily: "'Noto Serif JP', serif",
          fontSize: "17px",
          fontWeight: 400,
          color: "#1A2E3A",
          letterSpacing: "5px",
        }}>
          お問い合わせ
        </p>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <main>
      <Navbar />
      <ContactHero />
      <Contact />
      <Footer />
    </main>
  );
}
