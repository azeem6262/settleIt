import GoogleProvider from "next-auth/providers/google";
import { AuthOptions } from "next-auth";
import { connectToDB } from "./mongoose";
import { User } from "@/app/models/user";

// Ensure NEXTAUTH_SECRET exists (but allow build-time to pass)
if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production') {
  throw new Error('NEXTAUTH_SECRET environment variable is required');
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

    async jwt({ token, user }) {
      try {
        // If there's a JWT decode error, start fresh
        if (!token || Object.keys(token).length === 0) {
          console.log("Starting fresh JWT token");
          token = {};
        }

        if (user) {
          // Skip database operations during build
          if (!process.env.MONGODB_URI) {
            console.log("Skipping database operations during build");
            return token;
          }

          await connectToDB();
          const dbUser = await User.findOne({ email: user.email });

          if (dbUser) {
            token.id = dbUser._id.toString(); // Attach MongoDB _id to token
            token.email = user.email; // Ensure email is in token
          }
        }

        return token;
      } catch (error) {
        console.error("Error in jwt callback, starting fresh:", error);
        // Return minimal token on error
        return user ? { email: user.email } : {};
      }
    },

    async session({ session, token }) {
      try {
        if (token?.id && session.user) {
          session.user.id = token.id as string;
        }

        return session;
      } catch (error) {
        console.error("Error in session callback:", error);
        return session;
      }
    },
  },

  

  pages: {
    signIn: "/auth/signin", // Optional custom sign-in page
  },

  secret: process.env.NEXTAUTH_SECRET,

  // Add these for better Vercel compatibility
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
  
  
  session: {
    strategy: "jwt",
    
  },
};