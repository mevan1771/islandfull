import Image from "next/image"
import ThinLoadingBar from "@/components/ui/ThinLoadingBar"

export default function SplashLoading() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-white">
      <Image
        src="/images/loading/loading-if.png"
        alt="IslandFull"
        width={360}
        height={269}
        priority
        className="h-auto w-[280px] sm:w-[360px] object-contain"
      />
      <div className="w-[280px] sm:w-[360px]">
        <ThinLoadingBar />
      </div>
    </div>
  )
}
