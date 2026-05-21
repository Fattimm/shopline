"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const data = await api.register(name, email, password, phone);
    setLoading(false);

    if (data.success) {
      login(data.token, data.user);
      router.push("/");
    } else {
      setErrorMessage(data.error || data.message || "Impossible de créer le compte.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-bg to-accent/20 px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            SHOPLINE
          </h1>
          <p className="text-2xl">Créer ton compte</p>
        </div>

        <form onSubmit={handleRegister} className="card-premium rounded-3xl p-10 shadow-2xl space-y-6">
          <input
            type="text"
            placeholder="Nom complet"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-6 py-5 rounded-2xl text-lg border border-primary/20 focus:border-primary focus:outline-none"
            required
          />
          <input
            type="email"
            placeholder="Ton email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-6 py-5 rounded-2xl text-lg border border-primary/20 focus:border-primary focus:outline-none"
            required
          />
          <input
            type="tel"
            placeholder="Téléphone (77 / 78 / 76 / 70...)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-6 py-5 rounded-2xl text-lg border border-primary/20 focus:border-primary focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-6 py-5 rounded-2xl text-lg border border-primary/20 focus:border-primary focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="Confirme ton mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-6 py-5 rounded-2xl text-lg border border-primary/20 focus:border-primary focus:outline-none"
            required
          />

          {errorMessage && (
            <div className="text-center text-red-600 font-medium">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-luxe w-full text-xl py-6"
          >
            {loading ? "Création en cours..." : "Créer mon compte"}
          </button>

          <p className="text-center text-gray-600">
            Déjà un compte ? <a href="/login" className="text-primary font-semibold">Se connecter</a>
          </p>
        </form>
      </div>
    </div>
  );
}
