"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { QRCodeSVG } from "qrcode.react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type PaymentMethod = "stripe" | "wave" | "orange";

const inputClass = "w-full px-6 py-5 rounded-2xl border-2 border-primary/20 focus:border-primary focus:outline-none text-base bg-white";

function CheckoutForm() {
  const { cart, totalPrice, clearCart } = useCart();
  const { user, login } = useAuth();
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [mobileConfirm, setMobileConfirm] = useState<{ orderId: string; total: number } | null>(null);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const getToken = () => localStorage.getItem("token");

  const processStripe = async (authToken: string) => {
    if (!stripe || !elements) throw new Error("Stripe non initialisé.");

    const res = await fetch(`${API}/api/checkout/create-payment-intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        items: cart.map(i => ({ productId: i.product._id, quantity: i.quantity })),
        shippingAddress: form.address,
      }),
    });
    const data = await res.json();
    if (!data.clientSecret) throw new Error(data.error || "Impossible de créer le paiement.");

    const result = await stripe.confirmCardPayment(data.clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
        billing_details: { name: form.name, email: form.email, phone: form.phone },
      },
    });
    if (result.error) throw new Error(result.error.message || "Paiement refusé.");

    clearCart();
    window.location.href = "/success";
  };

  const processMobile = async (authToken?: string) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

    const res = await fetch(`${API}/api/checkout/mobile-payment`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        items: cart.map(i => ({ productId: i.product._id, quantity: i.quantity })),
        shippingAddress: form.address || "Pikine, Dakar",
        paymentMethod,
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Erreur lors de la commande.");
    setMobileConfirm({ orderId: data.orderId, total: data.total });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.address.trim()) { setError("Saisissez votre adresse de livraison."); return; }

    if (!user) {
      if (form.password.length < 6) { setError("Mot de passe : 6 caractères minimum."); return; }
      if (form.password !== form.confirmPassword) { setError("Les mots de passe ne correspondent pas."); return; }
    }

    setLoading(true);
    try {
      let authToken = getToken();

      if (!user) {
        const regRes = await fetch(`${API}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password, phone: form.phone }),
        });
        const regData = await regRes.json();
        if (!regData.success) throw new Error(regData.error || "Impossible de créer le compte.");
        login(regData.token, regData.user);
        authToken = regData.token;
      }

      if (paymentMethod === "stripe") {
        await processStripe(authToken!);
      } else {
        await processMobile(authToken || undefined);
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  // Écran QR code après commande mobile
  if (mobileConfirm) {
    const isWave = paymentMethod === "wave";
    const merchantPhone = isWave ? "+221781175672" : "+221777629993";
    const merchantPhoneDisplay = isWave ? "78 117 56 72" : "77 762 99 93";
    const ref = String(mobileConfirm.orderId).slice(-8).toUpperCase();

    return (
      <div className="max-w-lg mx-auto text-center card-premium rounded-3xl p-10">
        <div className="text-5xl mb-4">{isWave ? "🌊" : "🟠"}</div>
        <h2 className="text-3xl font-bold mb-2">{isWave ? "Paiement Wave" : "Paiement Orange Money"}</h2>
        <p className="text-gray-500 mb-6">
          Scannez le QR code avec votre application {isWave ? "Wave" : "Orange Money"}.
        </p>

        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-2xl p-5 border-2 border-primary/20 inline-block">
            <QRCodeSVG value={merchantPhone} size={200} bgColor="#ffffff"
              fgColor={isWave ? "#0033A0" : "#FF6600"} level="M" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-6 border border-primary/20 space-y-4 text-left">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Numéro {isWave ? "Wave" : "Orange Money"}</p>
            <p className="text-xl font-bold">{merchantPhoneDisplay}</p>
          </div>
          <div className="border-t border-gray-100" />
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Montant exact</p>
            <p className="text-xl font-bold" style={{ color: "#8B7355" }}>
              {mobileConfirm.total.toLocaleString("fr-FR")} FCFA
            </p>
          </div>
          <div className="border-t border-gray-100" />
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Référence (dans le message)</p>
            <p className="font-mono font-bold bg-gray-100 rounded-lg px-3 py-1">{ref}</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-6">
          Ajoutez la référence <strong>{ref}</strong> dans le message du paiement. Votre commande sera validée dès réception.
        </p>
        <button onClick={() => { clearCart(); window.location.href = "/success"; }}
          className="btn-luxe w-full text-lg py-5">
          J'ai effectué le paiement ✓
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid md:grid-cols-2 gap-8 items-start">

        {/* ===== COLONNE GAUCHE : Informations ===== */}
        <div className="space-y-5">
          <h2 className="text-2xl font-bold">Informations de livraison</h2>

          {user ? (
            /* Connecté — affichage lecture seule */
            <div className="card-premium rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
          ) : (
            /* Non connecté — champs à remplir */
            <>
              <input required placeholder="Nom complet" value={form.name} onChange={set("name")} className={inputClass} />
              <input required type="email" placeholder="Adresse email" value={form.email} onChange={set("email")} className={inputClass} />
            </>
          )}

          <input required placeholder="Téléphone (77 / 78 / 76 / 70...)" value={form.phone}
            onChange={set("phone")} className={inputClass} />
          <input required placeholder="Adresse de livraison (Pikine, Guédiawaye...)" value={form.address}
            onChange={set("address")} className={inputClass} />

          {/* Création de compte si non connecté */}
          {!user && (
            <div className="card-premium rounded-2xl p-5 space-y-4">
              <p className="font-semibold text-sm text-gray-600">
                Créez votre compte pour suivre vos commandes
              </p>
              <input required type="password" placeholder="Mot de passe (6 caractères min.)" value={form.password}
                onChange={set("password")} className={inputClass} />
              <input required type="password" placeholder="Confirmer le mot de passe" value={form.confirmPassword}
                onChange={set("confirmPassword")} className={inputClass} />
            </div>
          )}

          {/* Récapitulatif panier */}
          <div className="card-premium rounded-2xl p-5">
            <h3 className="font-bold mb-3 text-gray-700">Votre commande</h3>
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.product._id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{item.quantity}× {item.product.name}</span>
                  <span className="font-semibold" style={{ color: "#8B7355" }}>
                    {(item.product.price * item.quantity).toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== COLONNE DROITE : Paiement ===== */}
        <div className="space-y-5">
          <h2 className="text-2xl font-bold">Mode de paiement</h2>

          {/* Choix méthode */}
          <div className="card-premium rounded-2xl p-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "stripe", label: "Carte", icon: "💳" },
                { id: "wave",   label: "Wave",  icon: "🌊" },
                { id: "orange", label: "Orange", icon: "🟠" },
              ].map(m => (
                <button key={m.id} type="button" onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                  className={`py-4 rounded-2xl font-semibold transition-all border-2 ${
                    paymentMethod === m.id ? "border-primary bg-primary/10 text-primary" : "border-primary/20 text-gray-500"
                  }`}>
                  <div className="text-2xl mb-1">{m.icon}</div>
                  <div className="text-sm">{m.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Carte Stripe */}
          {paymentMethod === "stripe" && (
            <div className="card-premium rounded-2xl p-5">
              <p className="font-semibold mb-3">Informations carte</p>
              <div className="p-4 bg-white rounded-xl border-2 border-primary/20">
                <CardElement options={{ style: { base: { fontSize: "16px", color: "#2D2D2D" } } }} />
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">
                Test : 4242 4242 4242 4242 — 12/34 — 123
              </p>
            </div>
          )}

          {/* Wave */}
          {paymentMethod === "wave" && (
            <div className="card-premium rounded-2xl p-5 text-center">
              <div className="text-4xl mb-2">🌊</div>
              <p className="font-semibold">Paiement Wave</p>
              <p className="text-sm text-gray-500 mt-1">Un QR code s'affichera après confirmation.</p>
            </div>
          )}

          {/* Orange Money */}
          {paymentMethod === "orange" && (
            <div className="card-premium rounded-2xl p-5 text-center">
              <div className="text-4xl mb-2">🟠</div>
              <p className="font-semibold">Paiement Orange Money</p>
              <p className="text-sm text-gray-500 mt-1">Un QR code s'affichera après confirmation.</p>
            </div>
          )}

          {/* Total + bouton */}
          <div className="card-premium rounded-2xl p-6 text-center">
            <p className="text-4xl font-bold mb-2" style={{ color: "#8B7355" }}>
              {totalPrice.toLocaleString("fr-FR")} FCFA
            </p>
            <p className="text-sm text-gray-400 mb-5">Livraison incluse</p>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 text-red-600 rounded-xl text-sm text-left">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || cart.length === 0}
              className="btn-luxe w-full text-lg py-6 disabled:opacity-50">
              {loading ? "Traitement en cours..." : user ? "CONFIRMER LA COMMANDE" : "CRÉER MON COMPTE ET COMMANDER"}
            </button>

            {!user && (
              <p className="text-xs text-gray-400 mt-4">
                Déjà un compte ?{" "}
                <a href="/login" className="text-primary font-semibold">Se connecter</a>
              </p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen py-20 px-6 bg-gradient-to-b from-bg to-white/30">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-10">Finaliser ma commande</h1>
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </div>
    </div>
  );
}
