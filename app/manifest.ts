import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GM DEX",
    short_name: "GM DEX",
    description: "Daily GM streaks and premium token swaps on Base",
    start_url: "/",
    display: "standalone",
    background_color: "#06070a",
    theme_color: "#0052ff",
    orientation: "portrait",
    icons: [
      { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
