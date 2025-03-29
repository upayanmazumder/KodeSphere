import NextAuth from "next-auth"; 
import GitHubProvider from "next-auth/providers/github";


export default NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        url: "https://github.com/login/oauth/authorize",
        params: {
          client_id: process.env.GITHUB_CLIENT_ID,
          scope: "read:user user:email repo",
          allow_signup: true,
        },
      },
      token: "https://github.com/login/oauth/access_token",
      userinfo: "https://api.github.com/user",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    dashboard: "/dashboard",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (profile) {
        token.login = profile.login;
        token.id = profile.id;
        token.avatar = profile.avatar_url;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session Token:", token);

      session.user = {
        login: token.login,
        id: token.id,
        avatar: token.avatar,
      };
      session.accessToken = token.accessToken;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/api/auth/signin",
    signOut: "/api/auth/signout",
    error: "/api/auth/error",
  },
});
