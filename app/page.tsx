import { Search, MapPin, Calendar, Users, Map, ShieldCheck, Tag, HeartHandshake } from "lucide-react"
import { ActivityCard } from "@/components/activity/ActivityCard"
import { supabase } from "@/lib/supabase"
import Image from "next/image"

// Mock data fallback if DB fails
const MOCK_ACTIVITIES = [
  {
    id: '1', title: 'Secret Sunset Surf Lesson', slug: 'secret-sunset-surf-hiriketiya',
    location: 'Hiriketiya', duration: '2 hours', priceUsd: 35.00,
    coverImage: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '2', title: 'Yala Leopard Safari in 4x4', slug: 'yala-leopard-safari',
    location: 'Yala', duration: 'Half Day', priceUsd: 75.00,
    coverImage: 'https://images.unsplash.com/photo-1610444360341-356a422a10d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '3', title: 'Ella Nine Arch Trek', slug: 'ella-nine-arch-trek',
    location: 'Ella', duration: '6 hours', priceUsd: 45.00,
    coverImage: 'https://images.unsplash.com/photo-1588825121118-20d0f7a73155?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '4', title: 'Sigiriya Rock Climb', slug: 'sigiriya-rock-fortress-climb',
    location: 'Sigiriya', duration: '3 hours', priceUsd: 20.00,
    coverImage: 'https://images.unsplash.com/photo-1586520743171-460d3d3b7fa8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
]

export default async function Home() {
  let activities = MOCK_ACTIVITIES;
  
  try {
    const { data } = await supabase.from('activities').select('*').limit(8);
    if (data && data.length > 0) {
      activities = data.map(d => ({
        id: d.id,
        title: d.title,
        slug: d.slug,
        location: d.location,
        duration: d.duration,
        priceUsd: d.price_usd,
        coverImage: d.cover_image_url
      }));
    }
  } catch (err) {
    console.log("Supabase error (using mock data):", err);
  }

  const filterPills = ["All Places", "Couples", "Family", "Solo", "Adventure"];

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <section className="relative pt-32 pb-48 text-white min-h-[85vh] flex flex-col justify-center">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1537519646099-335112f03225?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Sri Lanka Coast" 
            fill 
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full flex flex-col items-center text-center mt-[-10vh]">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 drop-shadow-md">
            Your Journey Starts<br/>Before You Go
          </h1>
          <p className="text-white/90 text-lg md:text-xl mb-10 max-w-2xl drop-shadow-md">
            Inspiration, Planning, And Booking — All In One Travel Experience.
          </p>
          <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-3.5 rounded-full font-semibold transition-all">
            View Package
          </button>
        </div>

        {/* Floating Search Widget */}
        <div className="absolute left-0 right-0 -bottom-24 z-20 px-4">
          <div className="max-w-5xl mx-auto bg-white rounded-3xl p-6 md:p-8 shadow-2xl">
            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-zinc-100 pb-4 mb-6 overflow-x-auto hide-scrollbar">
              <button className="flex items-center gap-2 text-rose-500 font-semibold border-b-2 border-rose-500 pb-4 -mb-[18px] whitespace-nowrap">
                <Map className="w-4 h-4" /> Tours & Guides
              </button>
              <button className="flex items-center gap-2 text-zinc-500 font-medium pb-4 hover:text-zinc-900 transition-colors whitespace-nowrap">
                Flight
              </button>
              <button className="flex items-center gap-2 text-zinc-500 font-medium pb-4 hover:text-zinc-900 transition-colors whitespace-nowrap">
                Restaurant
              </button>
              <button className="flex items-center gap-2 text-zinc-500 font-medium pb-4 hover:text-zinc-900 transition-colors whitespace-nowrap">
                Hotel
              </button>
            </div>

            {/* Inputs */}
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 w-full border border-zinc-200 rounded-2xl p-3 px-4">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Location</label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-zinc-400" />
                  <input type="text" placeholder="Ella, Sri Lanka" className="w-full outline-none text-zinc-900 font-medium" />
                </div>
              </div>
              
              <div className="flex-1 w-full border border-zinc-200 rounded-2xl p-3 px-4">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Check In</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-zinc-400" />
                  <input type="date" className="w-full outline-none text-zinc-900 font-medium bg-transparent" />
                </div>
              </div>

              <div className="flex-1 w-full border border-zinc-200 rounded-2xl p-3 px-4">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Travelers</label>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-zinc-400" />
                  <input type="text" placeholder="2 Couples" className="w-full outline-none text-zinc-900 font-medium" />
                </div>
              </div>

              <button className="w-full md:w-auto h-[60px] bg-rose-500 hover:bg-rose-600 text-white px-10 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-500/30">
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* spacer for floating widget */}
      <div className="h-40"></div>

      {/* Activity Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {filterPills.map((pill, idx) => (
              <button 
                key={pill} 
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors border ${
                  idx === 0 
                    ? 'border-rose-500 text-rose-500 bg-rose-50' 
                    : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                }`}
              >
                {pill}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-rose-500 hover:border-rose-500 transition-colors">
              &larr;
            </button>
            <button className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-rose-500 hover:border-rose-500 transition-colors">
              &rarr;
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {activities.map((act) => (
            <ActivityCard
              key={act.id}
              title={act.title}
              slug={act.slug}
              location={act.location}
              duration={act.duration}
              priceUsd={act.priceUsd}
              coverImage={act.coverImage}
            />
          ))}
        </div>
      </section>

      {/* Our Story Section */}
      <section className="bg-zinc-50 py-24 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 leading-tight">
                Our Story: Driven By Wanderlust, Powered By Experience
              </h2>
              <p className="text-zinc-600 text-lg leading-relaxed max-w-lg">
                We believe that travel is more than just visiting a new place—it's about creating lasting memories. From the hidden waterfalls to the breathtaking coastline, we provide exclusive access to authentic Sri Lankan adventures.
              </p>
              <button className="mt-4 bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-full font-semibold transition-all">
                Find More
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 h-[500px]">
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-lg mt-8">
                <Image src="https://images.unsplash.com/photo-1549366021-9f761d450615?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Safari" fill className="object-cover" />
              </div>
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-lg mb-8">
                <Image src="https://images.unsplash.com/photo-1588825121118-20d0f7a73155?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Train" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Travelers Trust Us */}
      <section className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-4xl font-bold text-zinc-900 mb-4">Why Travelers Trust Us</h2>
        <p className="text-zinc-500 mb-16">We Deliver Every Milestone Memorably, We're Dedicated.</p>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-2">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900">Trusted Experience</h3>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              We've created a memorable travel experience that cats to every traveler's unique needs.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-2">
              <Tag className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900">Best Price Guarantee</h3>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              Exclusive deals with direct providers means honest discounts and clear offers.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-2">
              <HeartHandshake className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900">Customer Satisfaction</h3>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              Our glowing reviews and loyal clients speak for our dedication to delivering the best.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
