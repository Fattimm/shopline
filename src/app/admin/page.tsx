"use client";

import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

const emptyForm = { name: "", description: "", price: "", category: "", image: "", stock: "" };

const statusLabel: Record<string, string> = {
  pending: "En attente",
  paid: "Payée",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-800",
};

// Transitions disponibles pour chaque statut (avancer + retour arrière)
const statusTransitions: Record<string, { label: string; value: string; style: string }[]> = {
  pending: [
    { label: "✓ Confirmer paiement", value: "paid", style: "bg-green-500 text-white hover:bg-green-600" },
    { label: "✗ Annuler", value: "cancelled", style: "bg-red-100 text-red-700 hover:bg-red-200" },
  ],
  paid: [
    { label: "→ Marquer expédiée", value: "shipped", style: "bg-blue-500 text-white hover:bg-blue-600" },
    { label: "↩ Retour en attente", value: "pending", style: "bg-gray-100 text-gray-600 hover:bg-gray-200" },
  ],
  shipped: [
    { label: "→ Marquer livrée", value: "delivered", style: "bg-purple-500 text-white hover:bg-purple-600" },
    { label: "↩ Retour payée", value: "paid", style: "bg-gray-100 text-gray-600 hover:bg-gray-200" },
  ],
  delivered: [
    { label: "↩ Retour expédiée", value: "shipped", style: "bg-gray-100 text-gray-600 hover:bg-gray-200" },
  ],
  cancelled: [
    { label: "↩ Réouvrir la commande", value: "pending", style: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" },
  ],
};

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"produits" | "commandes">("produits");

  // Produits
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loadingProd, setLoadingProd] = useState(false);

  // Filtres produits
  const [prodSearch, setProdSearch] = useState("");
  const [prodCategory, setProdCategory] = useState("all");
  const [prodStock, setProdStock] = useState("all");

  // Commandes
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Filtres commandes
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("all");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  const fetchProducts = useCallback(async () => {
    const res = await fetch(`${API}/api/products`);
    const data = await res.json();
    if (data.success) setProducts(data.data);
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    const res = await fetch(`${API}/api/orders`, { headers: authHeaders() });
    const data = await res.json();
    if (data.success) setOrders(data.data);
    setLoadingOrders(false);
  }, []);

  useEffect(() => { fetchProducts(); fetchOrders(); }, [fetchProducts, fetchOrders]);
  useEffect(() => { if (tab === "commandes") fetchOrders(); }, [tab, fetchOrders]);

  function flash(msg: string, type: "success" | "error" = "success") {
    setMessage(msg); setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  }

  // Produits filtrés
  const categories = useMemo(() => [...new Set(products.map(p => p.category))].sort(), [products]);

  const filteredProducts = useMemo(() => products.filter(p => {
    const q = prodSearch.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    const matchCat = prodCategory === "all" || p.category === prodCategory;
    const matchStock =
      prodStock === "all" ? true :
      prodStock === "instock" ? p.stock > 10 :
      prodStock === "low" ? (p.stock > 0 && p.stock <= 10) :
      p.stock === 0;
    return matchSearch && matchCat && matchStock;
  }), [products, prodSearch, prodCategory, prodStock]);

  // Commandes filtrées
  const filteredOrders = useMemo(() => orders.filter(o => {
    const q = orderSearch.toLowerCase();
    const name = (o.user?.name || o.customerName || "").toLowerCase();
    const email = (o.user?.email || o.customerEmail || "").toLowerCase();
    const matchSearch = !q || name.includes(q) || email.includes(q);
    const matchStatus = orderStatus === "all" || o.status === orderStatus;
    return matchSearch && matchStatus;
  }), [orders, orderSearch, orderStatus]);

  async function handleSubmitProduct(e: React.FormEvent) {
    e.preventDefault();
    setLoadingProd(true);
    const body = { ...form, price: Number(form.price), stock: Number(form.stock) };
    const url = editId ? `${API}/api/products/${editId}` : `${API}/api/products`;
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) });
    const data = await res.json();
    setLoadingProd(false);
    if (data.success) {
      flash(editId ? "Produit modifié." : "Produit ajouté.");
      setForm(emptyForm); setEditId(null); setShowForm(false);
      fetchProducts();
    } else {
      flash(data.error || "Erreur.", "error");
    }
  }

  async function updateStock(productId: string, currentStock: number, delta: number) {
    const newStock = Math.max(0, currentStock + delta);
    const res = await fetch(`${API}/api/products/${productId}`, {
      method: "PUT", headers: authHeaders(), body: JSON.stringify({ stock: newStock }),
    });
    const data = await res.json();
    if (data.success) {
      setProducts(prev => prev.map(p => p._id === productId ? { ...p, stock: newStock } : p));
    } else {
      flash("Erreur stock.", "error");
    }
  }

  function handleDelete(id: string, name: string) { setConfirmDelete({ id, name }); }

  async function executeDelete() {
    if (!confirmDelete) return;
    const res = await fetch(`${API}/api/products/${confirmDelete.id}`, { method: "DELETE", headers: authHeaders() });
    const data = await res.json();
    setConfirmDelete(null);
    if (data.success) { flash("Produit supprimé."); fetchProducts(); }
    else flash(data.error || "Erreur suppression.", "error");
  }

  function handleEdit(product: any) {
    setForm({
      name: product.name, description: product.description,
      price: product.price.toString(), category: product.category,
      image: product.image || "", stock: product.stock.toString(),
    });
    setEditId(product._id); setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function updateOrderStatus(orderId: string, status: string) {
    const res = await fetch(`${API}/api/orders/${orderId}/status`, {
      method: "PUT", headers: authHeaders(), body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.success) {
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      flash(`Commande → ${statusLabel[status]}`);
    } else flash(data.error || "Erreur.", "error");
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">Accès administrateur</h1>
          <p className="text-lg text-gray-600 mb-8">Connectez-vous en tant qu'administrateur.</p>
          <button onClick={() => router.push("/login")} className="btn-luxe px-10 py-4 text-xl">Se connecter</button>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">Accès refusé</h1>
          <p className="text-lg text-gray-600">Vous n'avez pas les droits nécessaires.</p>
        </div>
      </div>
    );
  }

  const inputFilter = "px-4 py-2 rounded-xl border border-primary/20 focus:border-primary focus:outline-none text-sm bg-white";

  return (
    <div className="min-h-screen py-20 px-6 bg-gradient-to-b from-bg to-white/60">
      <div className="max-w-6xl mx-auto">

        <div className="mb-10">
          <h1 className="text-5xl font-bold mb-2">Tableau de bord</h1>
          <p className="text-gray-500">{user.name} — espace administrateur</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {[
            { value: products.length, label: "Produits" },
            { value: orders.length, label: "Commandes" },
            { value: orders.filter(o => o.status === "pending").length, label: "En attente" },
            { value: orders.filter(o => o.status === "paid" || o.status === "delivered").reduce((s: number, o: any) => s + (o.total || 0), 0).toLocaleString("fr-FR"), label: "FCFA encaissés" },
          ].map((s, i) => (
            <div key={i} className="card-premium rounded-3xl p-6 text-center">
              <p className="text-4xl font-bold" style={{ color: "#8B7355" }}>{s.value}</p>
              <p className="text-gray-600 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Message flash */}
        {message && (
          <div className={`mb-6 px-6 py-4 rounded-2xl font-medium text-center ${messageType === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
            {message}
          </div>
        )}

        {/* Confirmation suppression */}
        {confirmDelete && (
          <div className="mb-6 px-6 py-5 rounded-2xl bg-red-50 border border-red-200 flex flex-wrap items-center justify-between gap-4">
            <p className="text-red-800 font-medium">Supprimer <span className="font-bold">"{confirmDelete.name}"</span> ? Action irréversible.</p>
            <div className="flex gap-3">
              <button onClick={executeDelete} className="px-6 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition">Supprimer</button>
              <button onClick={() => setConfirmDelete(null)} className="px-6 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition">Annuler</button>
            </div>
          </div>
        )}

        {/* Onglets */}
        <div className="flex gap-4 mb-8">
          {(["produits", "commandes"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-8 py-3 rounded-2xl font-semibold text-lg transition-all capitalize ${tab === t ? "btn-luxe" : "bg-white border border-primary/30 text-gray-600"}`}>
              {t}
              {t === "commandes" && orders.filter(o => o.status === "pending").length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {orders.filter(o => o.status === "pending").length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ===== ONGLET PRODUITS ===== */}
        {tab === "produits" && (
          <div>
            {showForm ? (
              <form onSubmit={handleSubmitProduct} className="card-premium rounded-3xl p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6">{editId ? "Modifier le produit" : "Ajouter un produit"}</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <input required placeholder="Nom du produit" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="px-5 py-4 rounded-2xl border border-primary/20 focus:border-primary focus:outline-none" />
                  <input required placeholder="Catégorie (robes, boubous...)" value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="px-5 py-4 rounded-2xl border border-primary/20 focus:border-primary focus:outline-none" />
                  <input required type="number" placeholder="Prix en FCFA" value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    className="px-5 py-4 rounded-2xl border border-primary/20 focus:border-primary focus:outline-none" />
                  <input required type="number" placeholder="Stock disponible" value={form.stock}
                    onChange={e => setForm({ ...form, stock: e.target.value })}
                    className="px-5 py-4 rounded-2xl border border-primary/20 focus:border-primary focus:outline-none" />
                  <input required placeholder="URL de l'image (obligatoire)" value={form.image}
                    onChange={e => setForm({ ...form, image: e.target.value })}
                    className="md:col-span-2 px-5 py-4 rounded-2xl border border-primary/20 focus:border-primary focus:outline-none" />
                  <textarea required placeholder="Description" value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={3} className="md:col-span-2 px-5 py-4 rounded-2xl border border-primary/20 focus:border-primary focus:outline-none resize-none" />
                </div>
                <div className="flex gap-4 mt-6">
                  <button type="submit" disabled={loadingProd} className="btn-luxe px-10 py-4">
                    {loadingProd ? "Enregistrement..." : editId ? "Modifier" : "Ajouter"}
                  </button>
                  <button type="button" onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(false); }}
                    className="px-10 py-4 rounded-2xl border border-gray-300 text-gray-600 hover:bg-gray-50">
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <button onClick={() => setShowForm(true)} className="btn-luxe px-8 py-4 mb-6 text-lg">
                + Ajouter un produit
              </button>
            )}

            {/* Filtres produits */}
            <div className="flex flex-wrap gap-3 mb-5 items-center">
              <input placeholder="Rechercher un produit..." value={prodSearch}
                onChange={e => setProdSearch(e.target.value)}
                className={`${inputFilter} flex-1 min-w-[200px]`} />
              <select value={prodCategory} onChange={e => setProdCategory(e.target.value)} className={inputFilter}>
                <option value="all">Toutes les catégories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={prodStock} onChange={e => setProdStock(e.target.value)} className={inputFilter}>
                <option value="all">Tout le stock</option>
                <option value="instock">En stock (+ de 10)</option>
                <option value="low">Stock faible (1–10)</option>
                <option value="out">Rupture (0)</option>
              </select>
              {(prodSearch || prodCategory !== "all" || prodStock !== "all") && (
                <button onClick={() => { setProdSearch(""); setProdCategory("all"); setProdStock("all"); }}
                  className="text-sm text-gray-400 hover:text-gray-600 transition">
                  ✕ Réinitialiser
                </button>
              )}
              <span className="text-sm text-gray-400">{filteredProducts.length} résultat(s)</span>
            </div>

            <div className="card-premium rounded-3xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary/10">
                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Produit</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-600">Catégorie</th>
                    <th className="text-right px-6 py-4 font-semibold text-gray-600">Prix</th>
                    <th className="text-center px-6 py-4 font-semibold text-gray-600">Stock</th>
                    <th className="text-right px-6 py-4 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-10 text-gray-400">Aucun produit trouvé.</td></tr>
                  ) : filteredProducts.map((p, i) => (
                    <tr key={p._id} className={i % 2 === 0 ? "bg-white/50" : "bg-white"}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {p.image && (
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                              <Image src={p.image} alt={p.name} fill sizes="48px" className="object-cover" />
                            </div>
                          )}
                          <span className="font-medium">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 capitalize">{p.category}</td>
                      <td className="px-6 py-4 text-right font-semibold" style={{ color: "#8B7355" }}>
                        {p.price.toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => updateStock(p._id, p.stock, -1)}
                            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-gray-600 transition flex items-center justify-center">−</button>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold min-w-[40px] text-center ${p.stock > 10 ? "bg-green-100 text-green-700" : p.stock > 0 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                            {p.stock}
                          </span>
                          <button onClick={() => updateStock(p._id, p.stock, 1)}
                            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-gray-600 transition flex items-center justify-center">+</button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleEdit(p)} className="px-4 py-2 rounded-xl bg-primary/10 text-primary font-medium mr-2 hover:bg-primary/20 transition">Modifier</button>
                        <button onClick={() => handleDelete(p._id, p.name)} className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition">Supprimer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== ONGLET COMMANDES ===== */}
        {tab === "commandes" && (
          <div>
            {/* Filtres commandes */}
            <div className="flex flex-wrap gap-3 mb-5 items-center">
              <input placeholder="Rechercher par nom ou email..." value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                className={`${inputFilter} flex-1 min-w-[200px]`} />
              <select value={orderStatus} onChange={e => setOrderStatus(e.target.value)} className={inputFilter}>
                <option value="all">Tous les statuts</option>
                {Object.entries(statusLabel).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
              {(orderSearch || orderStatus !== "all") && (
                <button onClick={() => { setOrderSearch(""); setOrderStatus("all"); }}
                  className="text-sm text-gray-400 hover:text-gray-600 transition">
                  ✕ Réinitialiser
                </button>
              )}
              <span className="text-sm text-gray-400">{filteredOrders.length} résultat(s)</span>
            </div>

            {loadingOrders ? (
              <p className="text-center text-gray-500 py-20">Chargement...</p>
            ) : filteredOrders.length === 0 ? (
              <div className="card-premium rounded-3xl p-16 text-center text-gray-500">
                {orderSearch || orderStatus !== "all" ? "Aucune commande correspondante." : "Aucune commande pour le moment."}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order: any) => (
                  <div key={order._id} className="card-premium rounded-3xl p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="font-bold text-lg">{order.user?.name || order.customerName || "Client"}</p>
                        <p className="text-gray-500 text-sm">{order.user?.email || order.customerEmail}</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        {order.paymentIntentId?.startsWith("WAVE") && <span className="text-xs text-blue-600 font-medium mt-1 inline-block">🌊 Wave</span>}
                        {order.paymentIntentId?.startsWith("ORANGE") && <span className="text-xs text-orange-600 font-medium mt-1 inline-block">🟠 Orange Money</span>}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold" style={{ color: "#8B7355" }}>
                          {(order.total || 0).toLocaleString("fr-FR")} FCFA
                        </p>
                        <span className={`inline-block mt-2 px-4 py-1 rounded-full text-sm font-semibold ${statusColor[order.status] || "bg-gray-100 text-gray-600"}`}>
                          {statusLabel[order.status] || order.status}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-primary/10 pt-4 mb-4">
                      <p className="text-xs text-gray-400 mb-2">Adresse : {order.shippingAddress}</p>
                      <div className="flex flex-wrap gap-2">
                        {order.products?.map((item: any, i: number) => (
                          <span key={i} className="px-3 py-1 bg-white rounded-xl text-sm border border-primary/10 flex items-center gap-1">
                            <span className="font-semibold text-primary">{item.quantity}×</span>
                            <span>{item.product?.name || "Produit"}</span>
                            <span className="text-gray-400 text-xs ml-1">{(item.price * item.quantity).toLocaleString("fr-FR")} FCFA</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Boutons statut avec retour arrière */}
                    {statusTransitions[order.status]?.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-primary/10">
                        {statusTransitions[order.status].map(action => (
                          <button key={action.value}
                            onClick={() => updateOrderStatus(order._id, action.value)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${action.style}`}>
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
