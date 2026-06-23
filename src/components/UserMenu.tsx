"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <Link href="/login">
        <button className="px-5 py-2.5 md:px-8 md:py-4 bg-primary text-white rounded-full hover:bg-primary-light transition font-semibold text-sm md:text-lg shadow-lg whitespace-nowrap">
          Connexion
        </button>
      </Link>
    );
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition">
        <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold text-base md:text-xl shadow-lg flex-shrink-0">
          {user.name?.[0]?.toUpperCase() || "U"}
        </div>
        <span className="hidden md:block font-medium">{user.name}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-56 max-w-[90vw] bg-white rounded-3xl shadow-2xl overflow-hidden border border-primary/10 z-50">
          <Link href="/orders" onClick={() => setOpen(false)}
            className="block px-6 py-4 hover:bg-accent/10 transition">
            Mes commandes
          </Link>
          {user.role === "admin" && (
            <Link href="/admin" onClick={() => setOpen(false)}
              className="block px-6 py-4 hover:bg-accent/10 transition font-bold text-primary">
              Admin Dashboard
            </Link>
          )}
          <button
            onClick={() => { logout(); setOpen(false); }}
            className="block w-full text-left px-6 py-4 hover:bg-red-50 text-red-600 font-medium transition">
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}