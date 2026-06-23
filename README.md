## Shopline — Frontend

Interface e-commerce de la boutique en ligne Shopline.

## Stack

- **Next.js 16 (App Router, Turbopack)** — framework React
- **TypeScript** — typage statique
- **Tailwind CSS** — styles
- **Stripe.js** — paiement par carte
- **qrcode.react** — QR code Wave / Orange Money

## Architecture
src/

├── app/          → pages (App Router)

├── components/   → composants UI réutilisables (Header, ProductCard, ...)

├── contexts/     → AuthContext (JWT + localStorage), CartContext (panier + localStorage)

├── lib/          → fonctions utilitaires partagées

└── types/        → types TypeScript (Product, CartItem, ...)

## Installation

```bash
npm install
```

Créer un fichier `.env.local` :
NEXT_PUBLIC_API_URL=http://localhost:5000

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

```bash
npm run dev      # développement → http://localhost:3000
npm run build    # compiler
npm start        # production
```

## Pages

| URL | Description |
|-----|-------------|
| `/` | Catalogue produits |
| `/product/[id]` | Détail produit |
| `/cart` | Panier |
| `/checkout` | Paiement (Stripe ou Wave/OM) |
| `/orders` | Mes commandes |
| `/admin` | Dashboard administrateur |
| `/login` | Connexion |
| `/register` | Inscription |
| `/success` | Confirmation de commande |

## Responsive

- Header avec menu burger et recherche en plein écran sur mobile (< `md`)
- Grille produits adaptative : 1 colonne (mobile) → 4 colonnes (desktop)

## Notes

- Le panier est persistant (localStorage)
- Le checkout crée un compte automatiquement si l'utilisateur n'est pas connecté
- Le paiement mobile (Wave/Orange Money) est une simulation