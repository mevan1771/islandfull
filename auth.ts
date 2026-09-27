import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Resend from "next-auth/providers/resend"

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.AUTH_EMAIL_FROM ?? "IslandFull <bookings@islandfull.com>",
    }),
  ],
  pages: {
    signIn: "/",
    verifyRequest: "/",
  },
})
