import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { getDb } from "@/lib/mongodb"
import type { UserDoc } from "@/models/types"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: { strategy: "jwt" },
  pages:   { signIn: "/login", error: "/login" },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return false
      try {
        const db    = await getDb()
        const users = db.collection<UserDoc>("users")
        const existing = await users.findOne({ googleId: account.providerAccountId })
        if (!existing) {
          const handle = (user.name ?? "user")
            .toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "").slice(0, 20)
          await users.insertOne({
            name: user.name ?? "", email: user.email ?? "",
            image: user.image ?? "", googleId: account.providerAccountId,
            handle, area: "", community: "", bio: "",
            skillsOffered: [], skillsWanted: [], verified: false,
            rating: 0, reviewCount: 0, completedSwaps: 0, responseRate: 100,
            memberSince: new Date(), updatedAt: new Date(),
          })
        } else {
          await users.updateOne(
            { googleId: account.providerAccountId },
            { $set: { name: user.name ?? existing.name, image: user.image ?? existing.image, updatedAt: new Date() } }
          )
        }
      } catch (err) {
        console.error("[NextAuth] DB error — still allowing login:", err)
      }
      return true
    },

    async jwt({ token, account }) {
      if (account?.provider === "google") {
        try {
          const db     = await getDb()
          const dbUser = await db.collection<UserDoc>("users").findOne({ googleId: account.providerAccountId })
          if (dbUser) {
            token.userId = dbUser._id!.toString()
            token.handle = dbUser.handle
            token.role   = (dbUser as any).role ?? "user"
          }
        } catch {}
      }
      return token
    },

    async session({ session, token }) {
      if (token.userId) {
        session.user.id              = token.userId as string
        session.user.handle          = token.handle as string
        ;(session.user as any).role  = token.role as string
      }
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}