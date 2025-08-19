import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import FeaturedProducts from "@/components/featured-products";
import FeaturesSection from "@/components/features-section";
import DiscordSection from "@/components/discord-section";
import FAQSection from "@/components/faq-section";
import Footer from "@/components/footer";
import LiveChat from "@/components/live-chat";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-inter overflow-x-hidden">
      <Navigation />
      <HeroSection />
      <FeaturedProducts />
      <FeaturesSection />
      <DiscordSection />
      <FAQSection />
      <Footer />
      <LiveChat />
    </div>
  );
}
