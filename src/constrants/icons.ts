import { Icon } from "next/dist/lib/metadata/types/metadata-types";

export const iconsList: Icon[] = [
  {
    url: "/icons/favicon_16.png",
    sizes: "16x16",
    type: "image/png",
    rel: "icon",
  },
  {
    url: "/icons/favicon_32.png",
    sizes: "32x32",
    type: "image/png",
    rel: "icon",
  },
  {
    url: "/icons/favicon_192.png",
    sizes: "192x192",
    type: "image/png",
    rel: "icon",
  },
  {
    url: "/icons/favicon_512.png",
    sizes: "512x512",
    type: "image/png",
    rel: "icon",
  },
];

// Array com os ícones específicos para Apple / iOS
export const appleIconsList: Icon[] = [
  {
    url: "/icons_apple/favicon_apple_16.png",
    sizes: "16x16",
    type: "image/png",
    rel: "apple-touch-icon",
  },
  {
    url: "/icons_apple/favicon_apple_32.png",
    sizes: "32x32",
    type: "image/png",
    rel: "apple-touch-icon",
  },
  {
    url: "/icons_apple/favicon_apple_192.png",
    sizes: "192x192",
    type: "image/png",
    rel: "apple-touch-icon",
  },
]
