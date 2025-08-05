import GoogleProvider from "next-auth/providers/google";
import { AuthOptions } from "next-auth";
import { connectToDB } from "./mongoose";
import { User } from "@/app/models/user";

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

  // CRITICAL: Set secret FIRST
  secret: process.env.NEXTAUTH_SECRET,

  // CRITICAL: Explicitly set session strategy
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // CRITICAL: Set JWT configuration
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async signIn({ user }) {
      try {
        if (!process.env.MONGODB_URI) {
          console.log("Skipping database operations during build");
          return true;
        }

        await connectToDB();
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          await User.create({
            email: user.email,
            name: user.name,
            image: user.image,
          });
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      console.log("JWT callback called - token exists:", !!token, "user exists:", !!user);
      
      try {
        if (user) {
          if (!process.env.MONGODB_URI) {
            console.log("Skipping database operations during build");
            return token;
          }

          await connectToDB();
          const dbUser = await User.findOne({ email: user.email });

          if (dbUser) {
            token.id = dbUser._id.toString();
          }
          token.email = user.email;
        }

        console.log("JWT callback returning token with keys:", Object.keys(token || {}));
        return token;
      } catch (error) {
        console.error("Error in jwt callback:", error);
        throw error;
      }
    },

    async session({ session, token }) {
      console.log("Session callback called - token exists:", !!token, "session exists:", !!session);
      
      try {
        if (session.user && token) {
          session.user.id = (token.id || session.user.id) as string;
        }

        console.log("Session callback returning session for user:", session?.user?.email);
        return session;
      } catch (error) {
        console.error("Error in session callback:", error);
        return session;
      }
    },
  },

  pages: {
    signIn: "/auth/signin",
  },

  // Remove custom cookies configuration for now - let NextAuth use defaults
  // cookies: {
  //   sessionToken: {
  //     name: process.env.NODE_ENV === "production" 
  //       ? "__Secure-next-auth.session-token" 
  //       : "next-auth.session-token",
  //     options: {
  //       httpOnly: true,
  //       sameSite: "lax",
  //       path: "/",
  //       secure: process.env.NODE_ENV === "production",
  //     },
  //   },
  // },

  debug: process.env.NODE_ENV === "development",
  
  // Add events for debugging
  events: {
    async signIn({ user, account }) {
      console.log("SignIn event:", { user: user?.email, account: account?.provider });
    },
    async session({ session }) {
      console.log("Session event - user:", session?.user?.email);
    }
  }
};