"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/types";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <Link href={`/product/${product._id}`}>
      <div className="card-premium rounded-2xl md:rounded-3xl overflow-hidden group cursor-pointer h-full">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.image || "/placeholder.jpg"}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {product.stock === 0 && (
            <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-red-500 text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full">
              Rupture de stock
            </div>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-orange-400 text-white text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full">
              Plus que {product.stock}
            </div>
          )}

          <button
            onClick={e => { e.preventDefault(); if (product.stock > 0) addToCart(product, 1); }}
            disabled={product.stock === 0}
            className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 opacity-100 md:opacity-0 md:group-hover:opacity-100 translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-all duration-500 btn-luxe text-xs md:text-sm px-4 md:px-10 py-2 md:py-3 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap max-w-[90%] truncate"
          >
            {product.stock === 0 ? "Indisponible" : "Ajouter au panier"}
          </button>
        </div>

        <div className="p-3 md:p-6 text-center">
          <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest mb-1">{product.category}</p>
          <h3 className="text-sm md:text-xl font-bold mb-1 md:mb-2 truncate">{product.name}</h3>
          <p className="text-base md:text-2xl font-bold" style={{ color: "#8B7355" }}>
            {product.price.toLocaleString("fr-FR")} FCFA
          </p>
        </div>
      </div>
    </Link>
  );
}