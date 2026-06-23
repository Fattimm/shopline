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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const SearchResults = () => (
    showResults && results.length > 0 ? (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[70vh] overflow-y-auto">
        {results.map((p) => (
          <Link
            key={p._id}
            href={`/product/${p._id}`}
            onClick={() => { setMobileSearchOpen(false); setShowResults(false); }}
            className="flex items-center gap-4 p-4 hover:bg-accent/10 transition"
          >
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
    ) : null
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl shadow-xl">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-24 flex items-center justify-between gap-2 md:gap-4">

        {/* Bouton menu burger - mobile uniquement */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 -ml-2"
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo */}
        <Link href="/" className="text-2xl md:text-4xl font-bold tracking-tighter flex-shrink-0" style={{ color: "#8B7355" }}>
          SHOPLINE
        </Link>

        {/* Barre de recherche - desktop uniquement */}
        <div className="hidden md:block flex-1 max-w-3xl mx-10 relative">
          <input
            type="text"
            placeholder="Bazin, thiaya, wax, bijoux..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            className="w-full px-10 py-5 rounded-full border-2 border-primary/30 focus:border-primary focus:outline-none text-lg shadow-lg"
          />
          <SearchResults />
        </div>

        {/* Icônes droite */}
        <div className="flex items-center gap-2 md:gap-8">
          {/* Icône recherche - mobile uniquement */}
          <button
            onClick={() => setMobileSearchOpen(true)}
            className="md:hidden p-2 rounded-full hover:bg-gray-100 transition"
            aria-label="Rechercher"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
          </button>

          <div className="hidden md:block">
            <UserMenu />
          </div>
          <CartButton />
        </div>
      </div>

      {/* Overlay recherche plein écran - mobile */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 bg-white z-[60] md:hidden">
          <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-100">
            <button onClick={() => { setMobileSearchOpen(false); setShowResults(false); setSearch(""); }} className="p-2 -ml-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <input
              type="text"
              autoFocus
              placeholder="Bazin, thiaya, wax, bijoux..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => results.length > 0 && setShowResults(true)}
              className="flex-1 px-4 py-3 rounded-full border-2 border-primary/30 focus:border-primary focus:outline-none text-base"
            />
          </div>
          <div className="relative px-4">
            {showResults && results.length > 0 && (
              <div className="mt-2 bg-white rounded-3xl shadow-lg overflow-hidden">
                {results.map((p) => (
                  <Link
                    key={p._id}
                    href={`/product/${p._id}`}
                    onClick={() => { setMobileSearchOpen(false); setShowResults(false); }}
                    className="flex items-center gap-4 p-4 hover:bg-accent/10 transition"
                  >
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
        </div>
      )}

      {/* Menu burger plein écran - mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-[60] md:hidden">
          <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
            <span className="text-2xl font-bold" style={{ color: "#8B7355" }}>SHOPLINE</span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4">
            <UserMenu />
          </div>
        </div>
      )}
    </header>
  );
}