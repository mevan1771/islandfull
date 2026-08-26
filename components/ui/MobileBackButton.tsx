"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export function MobileBackButton() {
 const router = useRouter()

 return (
 <button
 onClick={(e) => {
 e.preventDefault()
 router.back()
 }}
 className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center shadow-sm border-none outline-none cursor-pointer"
 >
 <ArrowLeft className="w-4 h-4 text-white " />
 </button>
 )
}
