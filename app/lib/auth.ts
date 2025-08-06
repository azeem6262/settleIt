// app/lib/auth.ts
import GoogleProvider from "next-auth/providers/google";
import { AuthOptions } from "next-auth";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/app/lib/mongodb";

// CRITICAL: Check for NEXTAUTH_SECRET
if (!process.env.NEXTAUTH_SECRET) {
  console.error('❌ NEXTAUTH_SECRET is missing');
  throw new Error('NEXTAUTH_SECRET must be set');
}

console.log('✅ NEXTAUTH_SECRET is present, length:', process.env.NEXTAUTH_SECRET.length);

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  
  // Use MongoDB adapter (same as your route)
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: "college-expense-splitter",
  }),
  
  // Use database strategy (same as your route)
  session: {
    strategy: "database", // NOT jwt!
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  callbacks: {
    async session({ session, user }) {
      // With database strategy, you get the full user object
      session.user.id = user.id;
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },

  debug: process.env.NODE_ENV === "development",
  
  events: {
    async signIn({ user, account }) {
      console.log("📝 SignIn event:", { user: user?.email, provider: account?.provider });
    },
    async session({ session }) {
      console.log("📝 Session event - user:", session?.user?.email);
    }
  }
};