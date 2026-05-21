"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/types";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <Link href={`/product/${product._id}`}>
      <div className="card-premium rounded-3xl overflow-hidden group cursor-pointer h-full">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.image || "/placeholder.jpg"}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {product.stock === 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Rupture de stock
            </div>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <div className="absolute top-3 left-3 bg-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full">
              Plus que {product.stock}
            </div>
          )}

          <button
            onClick={e => { e.preventDefault(); if (product.stock > 0) addToCart(product, 1); }}
            disabled={product.stock === 0}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 btn-luxe text-sm px-10 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {product.stock === 0 ? "Indisponible" : "Ajouter au panier"}
          </button>
        </div>

        <div className="p-6 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{product.category}</p>
          <h3 className="text-xl font-bold mb-2">{product.name}</h3>
          <p className="text-2xl font-bold" style={{ color: "#8B7355" }}>
            {product.price.toLocaleString("fr-FR")} FCFA
          </p>
        </div>
      </div>
    </Link>
  );
}
