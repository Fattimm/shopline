# Shopline — Frontend

Interface e-commerce pour la boutique de mode sénégalaise Shopline.

## Stack

- **Next.js 15 (App Router)** — framework React
- **TypeScript** — typage statique
- **Tailwind CSS** — styles
- **Stripe.js** — paiement par carte
- **qrcode.react** — QR code Wave / Orange Money

## Installation

```bash
npm install
```

Créer un fichier `.env.local` :

```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

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
| `/checkout` | Paiement (Stripe ou Wave/OM) |
| `/orders` | Mes commandes |
| `/admin` | Dashboard administrateur |
| `/login` | Connexion |
| `/register` | Inscription |
| `/success` | Confirmation de commande |

## Notes

- Le panier est persistant (localStorage)
- Le checkout crée un compte automatiquement si l'utilisateur n'est pas connecté
- Le paiement mobile (Wave/Orange Money) est une simulation
