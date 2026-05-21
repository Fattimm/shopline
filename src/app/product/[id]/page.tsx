import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductPageClient from "./ProductPageClient";
import type { Product } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API}/api/products/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProduct(id);
  if (!product) return { title: "Produit introuvable — SHOPLINE" };
  return {
    title: `${product.name} — SHOPLINE`,
    description: product.description || `Découvrez ${product.name} sur SHOPLINE, mode sénégalaise.`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.image ? [product.image] : [],
    },
  };
}

export default async function ProductPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await fetchProduct(id);
  if (!product) notFound();
  return <ProductPageClient product={product} />;
}
