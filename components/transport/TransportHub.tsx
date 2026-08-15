"use client";

import { useState } from "react";
import { Train, Bus, Bike, Plane, MapPin, Calendar, Users, Loader2, Navigation2 } from "lucide-react";
import { cn } from "@/lib/utils";

type TransportMode = 
  | 'trains' 
  | 'buses' 
  | 'tuktuks' 
  | 'scooters' 
  | 'bicycles' 
  | 'flights' 
  | 'helicopters';

const TRANSPORT_MODES: { id: TransportMode; label: string; icon: React.ReactNode; type: 'point-to-point' | 'rental' }[] = [
  { id: 'trains', label: 'Trains', icon: <Train className="w-5 h-5" />, type: 'point-to-point' },
  { id: 'buses', label: 'Luxury Buses', icon: <Bus className="w-5 h-5" />, type: 'point-to-point' },
  { id: 'tuktuks', label: 'Tuk-Tuks', icon: <span className="text-xl leading-none">🛺</span>, type: 'rental' },
  { id: 'scooters', label: 'Scooters', icon: <span className="text-xl leading-none">🛵</span>, type: 'rental' },
  { id: 'bicycles', label: 'Bicycles', icon: <Bike className="w-5 h-5" />, type: 'rental' },
  { id: 'flights', label: 'Flights', icon: <Plane className="w-5 h-5" />, type: 'point-to-point' },
  { id: 'helicopters', label: 'Helicopters', icon: <span className="text-xl leading-none">🚁</span>, type: 'point-to-point' },
];

export function TransportHub() {
  const [activeTab, setActiveTab] = useState<TransportMode>('trains');
  const [isLoading, setIsLoading] = useState(false);

  const activeMode = TRANSPORT_MODES.find(m => m.id === activeTab)!;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API search
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl md:rounded-[2rem] shadow-xl md:shadow-2xl overflow-hidden border border-zinc-100">
      
      {/* Top Header/Category Selector */}
      <div className="bg-zinc-50 border-b border-zinc-100 p-4 md:p-6 pb-0">
        <h2 className="text-xl md:text-2xl font-bold text-zinc-900 mb-4 px-2">Transport Hub</h2>
        
        <div className="flex overflow-x-auto no-scrollbar gap-2 md:gap-4 pb-4 px-2 snap-x">
          {TRANSPORT_MODES.map((mode) => {
            const isActive = activeTab === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setActiveTab(mode.id)}
                className={cn(
                  "flex items-center gap-2 px-4 md:px-5 py-3 rounded-xl whitespace-nowrap font-medium transition-all snap-start",
                  isActive 
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/25 scale-105" 
                    : "bg-white text-zinc-600 border border-zinc-200 hover:border-rose-200 hover:bg-rose-50"
                )}
              >
                {mode.icon}
                {mode.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Dynamic Booking Engine */}
      <div className="p-6 md:p-8">
        <form onSubmit={handleSearch} className="flex flex-col gap-4 md:gap-6">
          
          {activeMode.type === 'point-to-point' ? (
            // Point-to-Point Form Layout
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative group flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">From</label>
                <div className="flex items-center h-14 border-2 border-zinc-200 rounded-xl px-4 focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10 transition-all bg-white">
                  <Navigation2 className="w-5 h-5 text-zinc-400 mr-3" />
                  <select className="w-full outline-none text-base text-zinc-900 bg-transparent cursor-pointer font-medium appearance-none">
                    <option value="">Select origin...</option>
                    <option value="cmb">Colombo (CMB)</option>
                    <option value="kandy">Kandy</option>
                    <option value="ella">Ella</option>
                    <option value="galle">Galle</option>
                  </select>
                </div>
              </div>

              <div className="relative group flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">To</label>
                <div className="flex items-center h-14 border-2 border-zinc-200 rounded-xl px-4 focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10 transition-all bg-white">
                  <MapPin className="w-5 h-5 text-rose-500 mr-3" />
                  <select className="w-full outline-none text-base text-zinc-900 bg-transparent cursor-pointer font-medium appearance-none">
                    <option value="">Select destination...</option>
                    <option value="kandy">Kandy</option>
                    <option value="ella">Ella</option>
                    <option value="galle">Galle</option>
                    <option value="cmb">Colombo (CMB)</option>
                  </select>
                </div>
              </div>

              <div className="relative group flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Date</label>
                <div className="flex items-center h-14 border-2 border-zinc-200 rounded-xl px-4 focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10 transition-all bg-white">
                  <Calendar className="w-5 h-5 text-zinc-400 mr-3" />
                  <input type="date" className="w-full outline-none text-base text-zinc-900 bg-transparent cursor-pointer font-medium" />
                </div>
              </div>

              <div className="relative group flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Passengers</label>
                <div className="flex items-center h-14 border-2 border-zinc-200 rounded-xl px-4 focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10 transition-all bg-white">
                  <Users className="w-5 h-5 text-zinc-400 mr-3" />
                  <input type="number" min="1" defaultValue="1" className="w-full outline-none text-base text-zinc-900 bg-transparent font-medium" />
                </div>
              </div>
            </div>
          ) : (
            // Rental Form Layout
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative group flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Pick-up Location</label>
                <div className="flex items-center h-14 border-2 border-zinc-200 rounded-xl px-4 focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10 transition-all bg-white">
                  <MapPin className="w-5 h-5 text-rose-500 mr-3" />
                  <select className="w-full outline-none text-base text-zinc-900 bg-transparent cursor-pointer font-medium appearance-none">
                    <option value="">Select city...</option>
                    <option value="colombo">Colombo</option>
                    <option value="mirissa">Mirissa</option>
                    <option value="arugambay">Arugam Bay</option>
                  </select>
                </div>
              </div>

              <div className="relative group flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Start Date</label>
                <div className="flex items-center h-14 border-2 border-zinc-200 rounded-xl px-4 focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10 transition-all bg-white">
                  <Calendar className="w-5 h-5 text-zinc-400 mr-3" />
                  <input type="date" className="w-full outline-none text-base text-zinc-900 bg-transparent cursor-pointer font-medium" />
                </div>
              </div>

              <div className="relative group flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">End Date</label>
                <div className="flex items-center h-14 border-2 border-zinc-200 rounded-xl px-4 focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10 transition-all bg-white">
                  <Calendar className="w-5 h-5 text-zinc-400 mr-3" />
                  <input type="date" className="w-full outline-none text-base text-zinc-900 bg-transparent cursor-pointer font-medium" />
                </div>
              </div>

              <div className="relative group flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Quantity</label>
                <div className="flex items-center h-14 border-2 border-zinc-200 rounded-xl px-4 focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10 transition-all bg-white">
                  <Users className="w-5 h-5 text-zinc-400 mr-3" />
                  <input type="number" min="1" defaultValue="1" className="w-full outline-none text-base text-zinc-900 bg-transparent font-medium" />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-4">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto px-8 h-14 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                'Check Availability'
              )}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}
