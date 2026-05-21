import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Domaines connus (images optimisées)
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    // En dev, ne pas bloquer les URLs d'images saisies librement par l'admin
    dangerouslyAllowSVG: true,
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
