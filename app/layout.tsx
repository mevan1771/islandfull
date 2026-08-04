import { Toaster } from 'react-hot-toast';
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#f43f5e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "IslandFull | Sri Lanka Tours & Activities",
  description: "Inspiration, Planning, And Booking — All In One Travel Experience.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "IslandFull",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className={`${inter.className} bg-white min-h-screen flex flex-col overflow-x-hidden`}>
        <Toaster position="top-center" />
        <SiteHeader />
        
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
