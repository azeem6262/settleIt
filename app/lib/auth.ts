import GoogleProvider from "next-auth/providers/google";
import { AuthOptions } from "next-auth";
import { connectToDB } from "./mongoose";
import { User } from "@/app/models/user";

// Simplified environment check
if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === 'production') {
  console.error('NEXTAUTH_SECRET is missing in production');
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      try {
        // Skip database operations during build
        if (!process.env.MONGODB_URI) {
          console.log("Skipping database operations during build");
          return true;
        }

        await connectToDB();

        // Check if user already exists
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          // Create new user
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

    // UPDATED JWT CALLBACK - Replace your existing one with this:
    async jwt({ token, user }) {
      try {
        // Add debug logging
        console.log("JWT callback - incoming token:", JSON.stringify(token, null, 2));
        console.log("JWT callback - user:", JSON.stringify(user, null, 2));

        if (user) {
          // Skip database operations during build
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

        return token;
      } catch (error) {
        console.error("Error in jwt callback:", error);
        // Don't return incomplete tokens - let NextAuth handle the error
        throw error;
      }
    },

    // UPDATED SESSION CALLBACK - Replace your existing one with this:
    async session({ session, token }) {
      try {
        // Add debug logging
        console.log("Session callback - token:", JSON.stringify(token, null, 2));
        console.log("Session callback - session:", JSON.stringify(session, null, 2));

        if (session.user) {
          session.user.id = (token.id || session.user.id) as string;
        }

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

  secret: process.env.NEXTAUTH_SECRET,

  // UPDATED SESSION AND JWT CONFIG - Add these sections:
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Keep your existing cookies config
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" 
        ? "__Secure-next-auth.session-token" 
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  // Enable debug in development
  debug: process.env.NODE_ENV === "development",
};