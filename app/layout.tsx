import { Suspense } from "react";
import { Toaster } from 'react-hot-toast';
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import SiteHeader from "@/components/layout/SiteHeader";
import { ConditionalFooter } from "@/components/layout/ConditionalFooter"
import { RootScroll } from "@/components/layout/RootScroll";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import NextTopLoader from 'nextjs-toploader';
import { ClerkProvider } from "@clerk/nextjs";
import { FavoritesProvider } from "@/hooks/useFavorites";
import { SplashGate } from "@/components/ui/SplashGate";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#f43f5e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://islandfull.com"),
  title: {
    default: "IslandFull | Sri Lanka tours, hotels & private transport",
    template: "%s | IslandFull",
  },
  description:
    "Book local tours, stays, and private drivers in Sri Lanka. Plan a custom route, send your price, and get around the island without guessing taxi rates.",
  applicationName: "IslandFull",
  authors: [{ name: "IslandFull", url: "https://islandfull.com" }],
  creator: "IslandFull",
  category: "travel",
  keywords: [
    "Sri Lanka tours",
    "Sri Lanka transport",
    "how to get around Sri Lanka",
    "private driver Sri Lanka",
    "Colombo airport transfer",
    "Sri Lanka hotels",
    "IslandFull",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "512x512" }],
    shortcut: "/icon.png",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "IslandFull",
  },
  alternates: {
    canonical: "https://islandfull.com",
    languages: { "en-US": "https://islandfull.com", "x-default": "https://islandfull.com" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://islandfull.com",
    siteName: "IslandFull",
    title: "IslandFull | Sri Lanka tours, hotels & private transport",
    description:
      "Book local tours, stays, and private drivers in Sri Lanka. Plan a custom route and send your price to hosts.",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "IslandFull — Sri Lanka tours, hotels, and transport",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IslandFull | Sri Lanka tours, hotels & private transport",
    description:
      "Book local tours, stays, and private drivers in Sri Lanka. Plan a custom route and send your price to hosts.",
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className={`${inter.className} bg-zinc-50 min-h-screen flex flex-col overflow-x-clip`}>
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <ClerkProvider
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              modalBackdrop: { zIndex: "200000" },
              modalContent: { zIndex: "200001" },
            },
          }}
        >
        <FavoritesProvider>
        <SmoothScrollProvider>
          <NextTopLoader color="#f43f5e" showSpinner={false} />
          <SplashGate />
          <RootScroll />
          <Toaster position="top-center" />
          <Suspense fallback={null}>
            <SiteHeader />
          </Suspense>

          <main className="flex-1 flex flex-col bg-zinc-50">
            {children}
          </main>
        </SmoothScrollProvider>
        <ConditionalFooter />
        </FavoritesProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
