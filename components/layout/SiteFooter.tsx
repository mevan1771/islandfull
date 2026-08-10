import Link from "next/link"
import { Globe } from "lucide-react"

export default function SiteFooter() {
  return (
    <footer className="bg-white border-t border-gray-100 text-gray-600 text-sm">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-gray-100">
          
          {/* Brand Column */}
          <div className="space-y-3">
            <span className="text-lg font-semibold tracking-tight text-gray-900">Islandfull</span>
            <p className="text-gray-500 text-xs leading-relaxed">
              Your ultimate gateway to seamless experiences and exceptional stays.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 text-xs uppercase tracking-wider mb-4">Navigation</h3>
            <ul className="space-y-2.5 text-xs">
              <li><a href="/" className="hover:underline text-gray-600">Home</a></li>
              <li><a href="/about" className="hover:underline text-gray-600">About Us</a></li>
              <li><a href="/contact" className="hover:underline text-gray-600">Contact</a></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="font-semibold text-gray-900 text-xs uppercase tracking-wider mb-4">Get in Touch</h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="mailto:info@islandfull.com" className="hover:underline text-gray-600 flex items-center gap-2">
                  <span className="font-medium text-gray-900">Email:</span> info@islandfull.com
                </a>
              </li>
              <li>
                <a href="https://wa.me/447342573235" target="_blank" rel="noopener noreferrer" className="hover:underline text-gray-600 flex items-center gap-2">
                  <span className="font-medium text-gray-900">WhatsApp:</span> +44 7342 573235
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© {new Date().getFullYear()} Islandfull. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="/privacy" className="hover:underline">Privacy Policy</a>
            <a href="/terms" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
