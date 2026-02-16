import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { BrandTicker } from "@/components/BrandTicker";
import { CategoryGrid } from "@/components/CategoryGrid";
import { ProductGrid } from "@/components/ProductGrid";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-gold selection:text-black">
      <Header />
      <Hero />
      <BrandTicker />
      <CategoryGrid />
      <ProductGrid />
      <Footer />
    </main>
  );
}
