import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export default NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID, 
      clientSecret: process.env.GITHUB_CLIENT_SECRET, 
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    dashboard: "/dashboard",
  },
  debug: true,
});

if (process.env.NODE_ENV === "development") {
  console.log("🔍 Checking environment variables:");
  console.log("GITHUB_CLIENT_ID:", process.env.GITHUB_CLIENT_ID ? "✅ Loaded" : "❌ Not Found");
  console.log("GITHUB_CLIENT_SECRET:", process.env.GITHUB_CLIENT_SECRET ? "✅ Loaded" : "❌ Not Found");
  console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL || "❌ Not Set");
  console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "✅ Loaded" : "❌ Not Found");
}
