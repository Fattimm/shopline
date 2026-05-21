"use client";

import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import Image from "next/image";

export default function CartPage() {
  const { cart, removeFromCart, addToCart, totalPrice } = useCart();

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold mb-4">Votre panier est vide</h1>
        <Link href="/" className="text-primary underline text-lg">Continuer vos achats</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-10 text-center">Votre panier</h1>
      
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {cart.map((item) => (
          <div key={item.product._id} className="flex gap-6 py-6 border-b last:border-0">
            <div className="w-32 h-32 relative rounded-xl overflow-hidden">
              <Image src={item.product.image || "/placeholder.jpg"} alt="" fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{item.product.name}</h3>
              <p className="text-primary text-2xl font-bold mt-2">{item.product.price} €</p>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => addToCart(item.product, -1)} disabled={item.quantity <= 1} 
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300">-</button>
              <span className="text-xl font-bold w-12 text-center">{item.quantity}</span>
              <button onClick={() => addToCart(item.product, 1)} 
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300">+</button>
            </div>
            <button onClick={() => removeFromCart(item.product._id)} 
              className="text-red-500 hover:text-red-700">Supprimer</button>
          </div>
        ))}
        
        <div className="mt-10 text-right">
          <p className="text-5xl font-bold mb-12" style={{ color: "#8B7355" }}>
            {totalPrice.toLocaleString('fr-FR')} FCFA
          </p>
          <Link href="/checkout">
            <button className="mt-6 px-12 py-5 bg-primary text-white text-xl rounded-full hover:bg-primary-light transition">
              Passer la commande
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}