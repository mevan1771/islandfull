import SignOutButton from "@/components/host/SignOutButton"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full">
      {/* Top right flex container for the sign out button */}
      <div className="absolute top-0 left-0 right-0 w-full flex justify-end p-6 md:p-8 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <SignOutButton />
        </div>
      </div>
      {children}
    </div>
  )
}
