"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function SuccessPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 px-6">
      <div className="bg-white p-16 rounded-3xl shadow-2xl text-center max-w-lg w-full">
        <div className="text-7xl mb-6">✅</div>
        <h1 className="text-5xl font-bold mb-4" style={{ color: "#8B7355" }}>
          Commande confirmée !
        </h1>
        <p className="text-xl text-gray-700 mb-2">
          {user ? `Merci ${user.name}, ta commande a bien été enregistrée.` : "Merci, ta commande a bien été enregistrée."}
        </p>
        <p className="text-gray-500 mb-10">Elle est en cours de préparation et sera livrée bientôt.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/orders" className="btn-luxe px-8 py-4 text-lg">
            Voir mes commandes
          </Link>
          <Link href="/" className="px-8 py-4 rounded-2xl border-2 border-primary/30 text-primary font-semibold text-lg hover:bg-primary/5 transition">
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}
