"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">Accès interdit</h1>
          <p className="text-lg text-gray-600 mb-8">Connecte-toi pour accéder à ton profil.</p>
          <button
            onClick={() => router.push('/login')}
            className="btn-luxe px-10 py-4 text-xl"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-6 bg-gradient-to-b from-bg to-white/60">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-12">
        <h1 className="text-5xl font-bold mb-8">Mon profil</h1>
        <div className="space-y-6 text-lg text-gray-700">
          <p><span className="font-semibold">Nom :</span> {user.name}</p>
          <p><span className="font-semibold">Email :</span> {user.email}</p>
          <p><span className="font-semibold">Rôle :</span> {user.role}</p>
        </div>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <button
            onClick={() => logout()}
            className="btn-luxe px-10 py-4 text-xl"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}
