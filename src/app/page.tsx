import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types";

export const metadata: Metadata = {
  title: "SHOPLINE — Mode sénégalaise | Wax, Bazin, Boubous",
  description: "Boutique de mode sénégalaise en ligne. Wax, bazin, boubous, bijoux et accessoires faits main depuis Dakar. Livraison partout au Sénégal.",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function ProductSkeleton() {
  return (
    <div className="card-premium rounded-3xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-6 text-center space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto" />
        <div className="h-5 bg-gray-200 rounded w-2/3 mx-auto" />
        <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto" />
      </div>
    </div>
  );
}

export default async function Home() {
  let products: Product[] = [];
  let fetchError = false;

  try {
    const res = await fetch(`${API_URL}/api/products`, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      products = json.data || [];
    } else {
      fetchError = true;
    }
  } catch {
    fetchError = true;
  }

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="hero-glow" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-var(--bg)" />
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <h1 className="text-7xl md:text-9xl font-bold mb-6 leading-none">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-light to-accent">
              SHOPLINE
            </span>
          </h1>
          <p className="text-2xl md:text-4xl text-gray-700 mb-12 font-light tracking-wider">
            La mode sénégalaise qui fait tourner les têtes
          </p>
          <a href="#collection" className="btn-luxe text-lg px-16 py-6 inline-block">
            Découvrir la collection
          </a>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* PRODUITS */}
      <section id="collection" className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-5xl md:text-6xl font-bold text-center mb-20">Nos coups de cœur</h2>

        {fetchError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center text-red-700">
            <p className="text-xl font-semibold mb-2">Impossible de charger les produits.</p>
            <p className="text-sm">Vérifiez que le backend est démarré.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
