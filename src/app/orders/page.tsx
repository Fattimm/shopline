"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import type { Order, OrderStatus } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const statusLabel: Record<OrderStatus, string> = {
  pending: "En attente",
  paid: "Payée",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const statusColor: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-800",
};

function OrderSkeleton() {
  return (
    <div className="rounded-3xl bg-white shadow-2xl p-10 animate-pulse space-y-6">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-40" />
          <div className="h-6 bg-gray-200 rounded w-28" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32 ml-auto" />
          <div className="h-6 bg-gray-200 rounded w-16 ml-auto" />
        </div>
      </div>
      {[1, 2].map(i => (
        <div key={i} className="flex items-center gap-4 border-t pt-4">
          <div className="w-24 h-24 rounded-2xl bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
          </div>
          <div className="h-5 bg-gray-200 rounded w-24" />
        </div>
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/api/orders/myorders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data || []);
      } else {
        setError("Impossible de récupérer les commandes.");
      }
    } catch {
      setError("Impossible de récupérer les commandes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchOrders();
  }, [user, router, fetchOrders]);

  return (
    <div className="min-h-screen py-20 px-6 bg-gradient-to-b from-bg to-white/60">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-10">Mes commandes</h1>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700 font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map(i => <OrderSkeleton key={i} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl bg-white shadow-2xl p-12 text-center">
            <p className="text-2xl font-medium">Tu n'as encore aucune commande.</p>
            <p className="text-gray-600 mt-4">Ajoute des articles au panier et passe ta première commande.</p>
            <Link href="/" className="btn-luxe inline-block mt-8 px-10 py-4">
              Découvrir la collection
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map(order => (
              <div key={order._id} className="rounded-3xl bg-white shadow-2xl p-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-400 font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-2xl font-semibold">
                      {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-xl font-bold" style={{ color: "#8B7355" }}>
                      {order.total.toLocaleString("fr-FR")} FCFA
                    </p>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor[order.status]}`}>
                      {statusLabel[order.status]}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.products.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 border-t pt-4">
                      <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.image || "/placeholder.jpg"}
                          alt={item.product.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{item.product.name}</p>
                        <p className="text-gray-500 text-sm">Quantité : {item.quantity}</p>
                      </div>
                      <p className="text-lg font-bold" style={{ color: "#8B7355" }}>
                        {(item.price || item.product.price).toLocaleString("fr-FR")} FCFA
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
