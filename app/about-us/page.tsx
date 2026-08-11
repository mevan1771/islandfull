import { ShieldCheck, Tag, HeartHandshake, Headset } from "lucide-react"

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-zinc-900 pt-32 pb-24 px-4">
      <div className="max-w-7xl mx-auto mb-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">About Us</h1>
        <p className="text-zinc-400 max-w-2xl mx-auto text-lg">We are Islandfull. Building the best travel experiences.</p>
      </div>

      {/* Why Travelers Trust Us */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-24 text-center bg-white rounded-3xl">
        <h2 className="text-4xl font-bold text-zinc-900 mb-4">Why Travelers Trust Us</h2>
        <p className="text-zinc-500 mb-16">We Deliver Every Milestone Memorably, We're Dedicated.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div className="flex flex-col items-center text-center space-y-3 md:space-y-4">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-1 md:mb-2">
              <ShieldCheck className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <h3 className="text-sm md:text-xl font-bold text-zinc-900">Trusted Experience</h3>
            <p className="text-zinc-500 text-xs md:text-sm leading-relaxed max-w-xs">
              We've created a memorable travel experience that caters to every traveler's unique needs.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-3 md:space-y-4">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-1 md:mb-2">
              <Tag className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <h3 className="text-sm md:text-xl font-bold text-zinc-900">Best Price Guarantee</h3>
            <p className="text-zinc-500 text-xs md:text-sm leading-relaxed max-w-xs">
              Exclusive deals with direct providers means honest discounts and clear offers.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-3 md:space-y-4">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-1 md:mb-2">
              <HeartHandshake className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <h3 className="text-sm md:text-xl font-bold text-zinc-900">Customer Satisfaction</h3>
            <p className="text-zinc-500 text-xs md:text-sm leading-relaxed max-w-xs">
              Our glowing reviews and loyal clients speak for our dedication to delivering the best.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-3 md:space-y-4">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-1 md:mb-2">
              <Headset className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <h3 className="text-sm md:text-xl font-bold text-zinc-900">24/7 Local Support</h3>
            <p className="text-zinc-500 text-xs md:text-sm leading-relaxed max-w-xs">
              Round-the-clock assistance from our local team in Sri Lanka, ensuring a smooth journey.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
