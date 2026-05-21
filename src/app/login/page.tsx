"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        login(data.token, data.user);
        router.push("/");
      } else {
        setErrorMessage(data.error || data.message || "Email ou mot de passe incorrect.");
      }
    } catch {
      setErrorMessage("Impossible de contacter le serveur. Vérifiez votre connexion.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-bg to-accent/20 px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            SHOPLINE
          </h1>
          <p className="text-2xl">Connectez-vous à votre compte</p>
        </div>

        <form onSubmit={handleLogin} className="card-premium rounded-3xl p-10 shadow-2xl">
          <input
            type="email"
            placeholder="Ton email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-6 py-5 rounded-2xl mb-6 text-lg border border-primary/20 focus:border-primary focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="Ton mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-6 py-5 rounded-2xl mb-8 text-lg border border-primary/20 focus:border-primary focus:outline-none"
            required
          />

          {errorMessage && (
            <div className="text-center text-red-600 font-medium mb-4">
              {errorMessage}
            </div>
          )}

          <button type="submit" className="btn-luxe w-full text-xl py-6">
            Me connecter
          </button>

          <p className="text-center mt-8 text-gray-600">
            Pas encore de compte ? <a href="/register" className="text-primary font-semibold">Créer un compte</a>.
          </p>
        </form>
      </div>
    </div>
  );
}