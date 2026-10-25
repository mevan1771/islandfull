import type { Metadata } from "next"

export const metadata: Metadata = {
  title: { absolute: "Sign in | IslandFull" },
  robots: { index: false, follow: false },
}

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children
}
