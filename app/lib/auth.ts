import GoogleProvider from "next-auth/providers/google";
import { AuthOptions } from "next-auth";

// Minimal configuration for testing
export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  
  secret: process.env.NEXTAUTH_SECRET,
  
  session: {
    strategy: "jwt",
  },
  
  // No custom callbacks for now - just basic auth
  debug: process.env.NODE_ENV === "development",
};