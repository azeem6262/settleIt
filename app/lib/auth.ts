import GoogleProvider from "next-auth/providers/google";
import { AuthOptions } from "next-auth";
import { connectToDB } from "./mongoose";
import { User } from "@/app/models/user";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await connectToDB();
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser) {
          // Create new user if doesn't exist
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
    
    async session({ session, token }) {
      try {
        await connectToDB();
        
        // Get user from database to include the MongoDB _id
        const dbUser = await User.findOne({ email: session.user?.email });
        
        if (dbUser) {
          session.user.id = dbUser._id.toString();
        }
        
        return session;
      } catch (error) {
        console.error("Error in session callback:", error);
        return session;
      }
    },
    
    async jwt({ token, user }) {
      if (user) {
        try {
          await connectToDB();
          const dbUser = await User.findOne({ email: user.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
          }
        } catch (error) {
          console.error("Error in jwt callback:", error);
        }
      }
      return token;
    },
  },
  
  session: {
    strategy: "jwt",
  },
  
  pages: {
    signIn: "/auth/signin", // Optional: custom sign-in page
  },
  
  secret: process.env.NEXTAUTH_SECRET,
};