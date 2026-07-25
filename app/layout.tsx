import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
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
      <body className={`${inter.className} bg-white min-h-screen flex flex-col`}>
        {/* Transparent Header */}
        <header className="absolute top-0 md:top-6 left-0 right-0 z-40 w-full pt-4">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center">
              <Image 
                src="/logo.png" 
                alt="IslandFull" 
                width={140} 
                height={40} 
                className="h-10 w-auto object-contain drop-shadow-md"
                priority
              />
            </a>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/90">
              <a href="/" className="hover:text-white transition-colors">Home</a>
              <a href="/destinations" className="hover:text-white transition-colors">Destinations</a>
              <a href="/trips" className="hover:text-white transition-colors">Trips</a>
              <a href="/about-us" className="hover:text-white transition-colors">About Us</a>
            </nav>

            <div className="flex items-center gap-4">
              <button className="hidden md:block bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-5 py-2 rounded-full text-sm font-medium transition-colors">
                Book Now
              </button>
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors border border-white/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
