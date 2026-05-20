import { Navbar } from "@/marketing/components/Navbar";
import { HeroSection } from "@/marketing/components/HeroSection";
import { FeaturesSection } from "@/marketing/components/FeaturesSection";
import { AboutSection } from "@/marketing/components/AboutSection";
import { Footer } from "@/marketing/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <Footer />
    </div>
  );
};

export default Index;
