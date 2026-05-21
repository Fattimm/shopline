"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/types";

export default function ProductPageClient({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="min-h-screen py-20 px-6 bg-gradient-to-b from-bg to-white/50">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-start">
        <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl card-premium">
          <Image
            src={product.image || "/placeholder.jpg"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>

        <div className="flex flex-col justify-center space-y-8">
          <div>
            <p className="text-sm text-gray-400 uppercase tracking-widest mb-3">{product.category}</p>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">{product.name}</h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {product.description || "Un produit d'exception sélectionné pour vous."}
            </p>
          </div>

          <div className="py-4">
            <p className="text-6xl font-bold" style={{ color: "#8B7355" }}>
              {product.price.toLocaleString("fr-FR")} FCFA
            </p>
          </div>

          {product.stock === 0 ? (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-6 py-4 text-red-700 font-semibold text-center text-lg">
              Rupture de stock
            </div>
          ) : (
            <>
              {product.stock <= 5 && (
                <p className="text-orange-500 font-semibold">Plus que {product.stock} en stock !</p>
              )}
              <button
                onClick={handleAdd}
                className="btn-luxe text-2xl py-8 w-full md:w-auto transition-all"
              >
                {added ? "Ajouté ✓" : "Ajouter au panier"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
