"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import CartButton from "./CartButton";
import UserMenu from "./UserMenu";
import type { Product } from "@/types";

export default function Header() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (search.length < 2) {
      setResults([]);
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const timer = setTimeout(async () => {
      const res = await fetch(`${API_URL}/api/products/search?q=${search}`);
      const data = await res.json();
      setResults(data.data || []);
      setShowResults(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl shadow-xl">
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        <Link href="/" className="text-4xl font-bold tracking-tighter" style={{ color: "#8B7355" }}>
          SHOPLINE
        </Link>

        <div className="flex-1 max-w-3xl mx-10 relative">
          <input
            type="text"
            placeholder="Bazin, thiaya, wax, bijoux..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            className="w-full px-10 py-5 rounded-full border-2 border-primary/30 focus:border-primary focus:outline-none text-lg shadow-lg"
          />

          {showResults && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl overflow-hidden">
              {results.map((p) => (
                <Link key={p._id} href={`/product/${p._id}`} className="flex items-center gap-4 p-4 hover:bg-accent/10 transition">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <Image src={p.image || "/placeholder.jpg"} alt={p.name} fill sizes="64px" className="object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-primary font-bold">{p.price.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-8">
          <UserMenu />
          <CartButton />
        </div>
      </div>
    </header>
  );
}