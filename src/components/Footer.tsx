import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#2D2D2D] text-white mt-20">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Marque */}
          <div>
            <h2 className="text-3xl font-bold mb-4" style={{ color: "#C9A96E" }}>SHOPLINE</h2>
            <p className="text-gray-400 leading-relaxed">
              La boutique de mode sénégalaise en ligne. Wax, bazin, boubous et accessoires faits main directement depuis Dakar.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-6" style={{ color: "#C9A96E" }}>Navigation</h3>
            <ul className="space-y-3 text-gray-400">
              <li><Link href="/" className="hover:text-white transition">Accueil</Link></li>
              <li><Link href="/cart" className="hover:text-white transition">Panier</Link></li>
              <li><Link href="/orders" className="hover:text-white transition">Mes commandes</Link></li>
              <li><Link href="/login" className="hover:text-white transition">Connexion</Link></li>
              <li><Link href="/register" className="hover:text-white transition">Créer un compte</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6" style={{ color: "#C9A96E" }}>Contact</h3>
            <ul className="space-y-3 text-gray-400">
              <li>📍 Pikine, Dakar — Sénégal</li>
              <li>📞 +221 77 000 00 00</li>
              <li>✉️ contact@shopline.sn</li>
              <li className="pt-2">
                <span className="text-sm">Livraison partout au Sénégal</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Shopline. Tous droits réservés.</p>
          <p>Paiement sécurisé par <span style={{ color: "#C9A96E" }}>Stripe</span></p>
        </div>
      </div>
    </footer>
  );
}
