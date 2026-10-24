import { Suspense } from "react";
import { Toaster } from 'react-hot-toast';
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import { ConditionalFooter } from "@/components/layout/ConditionalFooter"
import { RootScroll } from "@/components/layout/RootScroll";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import NextTopLoader from 'nextjs-toploader';
import { ClerkProvider } from "@clerk/nextjs";
import { FavoritesProvider } from "@/hooks/useFavorites";
import { SplashGate } from "@/components/ui/SplashGate";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#f43f5e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://islandfull.com"),
  title: "IslandFull | Sri Lanka Tours & Activities",
  description: "Inspiration, Planning, And Booking — All In One Travel Experience.",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://islandfull.com",
    siteName: "IslandFull",
    title: "IslandFull | Sri Lanka Tours & Activities",
    description: "Inspiration, Planning, And Booking — All In One Travel Experience.",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "IslandFull",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IslandFull | Sri Lanka Tours & Activities",
    description: "Inspiration, Planning, And Booking — All In One Travel Experience.",
    images: ["/og.jpg"],
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
