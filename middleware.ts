import { clerkMiddleware } from "@clerk/nextjs/server"
import { updateSession } from "@/utils/supabase/middleware"

export default clerkMiddleware(async (_auth, req) => {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    return await updateSession(req)
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
}
