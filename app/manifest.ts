import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GMDEXAI",
    short_name: "GMDEXAI",
    description: "Autonomous AI swaps and decentralized exchange on Base",
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
