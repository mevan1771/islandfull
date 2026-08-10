import Link from "next/link"
import { Globe } from "lucide-react"

export default function SiteFooter() {
  return (
    <footer className="bg-zinc-50 border-t border-neutral-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-4 md:gap-8 mb-12">
          {/* Column 1: Brand & Mission */}
          <div className="col-span-2 md:col-span-1 space-y-4 mb-2 md:mb-0">
            <Link href="/" className="text-2xl font-black text-rose-500 tracking-tight">
              IslandFull
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              Discovering authentic local experiences and curated tours across the breathtaking landscapes of Sri Lanka.
            </p>
          </div>

          {/* Column 2: Support */}
          <div>
            <h3 className="font-bold text-zinc-900 mb-4">Support</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-zinc-500 hover:text-zinc-900 text-sm transition-colors">Help Center</Link></li>
              <li><Link href="#" className="text-zinc-500 hover:text-zinc-900 text-sm transition-colors">Safety Information</Link></li>
              <li><Link href="#" className="text-zinc-500 hover:text-zinc-900 text-sm transition-colors">Cancellation Options</Link></li>
              <li><Link href="#" className="text-zinc-500 hover:text-zinc-900 text-sm transition-colors">COVID-19 Resources</Link></li>
              <li><Link href="#" className="text-zinc-500 hover:text-zinc-900 text-sm transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3: Community & Hosting */}
          <div>
            <h3 className="font-bold text-zinc-900 mb-4">Community & Hosting</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-zinc-500 hover:text-zinc-900 text-sm transition-colors">List Your Tour</Link></li>
              <li><Link href="#" className="text-zinc-500 hover:text-zinc-900 text-sm transition-colors">Host Community</Link></li>
              <li><Link href="#" className="text-zinc-500 hover:text-zinc-900 text-sm transition-colors">Responsible Tourism</Link></li>
              <li><Link href="#" className="text-zinc-500 hover:text-zinc-900 text-sm transition-colors">Partner Hub</Link></li>
              <li><Link href="#" className="text-zinc-500 hover:text-zinc-900 text-sm transition-colors">Community Policies</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="font-bold text-zinc-900 mb-4">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:info@islandfull.com" className="text-zinc-500 hover:text-zinc-900 text-sm transition-colors flex items-center gap-2">
                  <span className="font-medium text-zinc-700">Email:</span> info@islandfull.com
                </a>
              </li>
              <li>
                <a href="https://wa.me/447342573235" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-900 text-sm transition-colors flex items-center gap-2">
                  <span className="font-medium text-zinc-700">WhatsApp:</span> +44 7342 573235
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Settings */}
        <div className="pt-8 border-t border-zinc-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm">
            © 2026 IslandFull, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-zinc-700 hover:text-zinc-900 font-medium text-sm transition-colors">
              <Globe className="w-4 h-4" />
              English (US)
            </button>
            <button className="text-zinc-700 hover:text-zinc-900 font-medium text-sm transition-colors">
              $ USD
            </button>
            <button className="text-zinc-700 hover:text-zinc-900 font-medium text-sm transition-colors">
              Rs LKR
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
