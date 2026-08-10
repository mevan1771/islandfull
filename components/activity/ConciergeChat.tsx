"use client"

import { MessageCircle } from "lucide-react"

interface ConciergeChatProps {
  tourTitle: string
}

export function ConciergeChat({ tourTitle }: ConciergeChatProps) {
  const whatsappMsg = `Hi Islandfull, I have a question about the ${tourTitle}`
  const href = `https://wa.me/447342573235?text=${encodeURIComponent(whatsappMsg)}`

  return (
    <>
      {/* Mobile Fixed Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 w-full z-50 bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 pb-safe flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Live Concierge</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">Have a question?</span>
        </div>
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="bg-black text-white px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 active:scale-95 transition-transform"
        >
          <MessageCircle className="w-4 h-4" />
          Chat Now
        </a>
      </div>

      {/* Desktop Card */}
      <div className="hidden md:flex flex-col p-5 bg-white border border-gray-200 rounded-3xl shadow-xl mt-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Live Concierge</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Need help booking?</h3>
        <p className="text-sm text-gray-500 mb-4">Our local experts are online and ready to assist you.</p>
        
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-full bg-zinc-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
        >
          <MessageCircle className="w-5 h-5" />
          Chat with Local Expert
        </a>
      </div>
    </>
  )
}
