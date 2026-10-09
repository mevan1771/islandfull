import Image from "next/image"
import ThinLoadingBar from "@/components/ui/ThinLoadingBar"

export default function SplashLoading() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white">
      <Image
        src="/images/loading/Firefly.png"
        alt="IslandFull"
        width={280}
        height={217}
        priority
        className="h-auto w-[220px] sm:w-[280px] object-contain"
      />
      <div className="w-[220px] sm:w-[280px]">
        <ThinLoadingBar />
      </div>
    </div>
  )
}
