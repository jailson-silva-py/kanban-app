import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn:"/login"
  },
  callbacks: {
    authorized({ auth, request:{nextUrl} }) {
      const isLogged = auth?.user;
      const privateRoutes = ["/home", "/profile", "/board", ];
      const isPublicRoutes = privateRoutes.some((route) => {
        return nextUrl.pathname.startsWith(route)
      })
      if (!isPublicRoutes) {
        if (isLogged) return true;
        return false;
      }
      return true
    },
    async redirect({ baseUrl, url }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    }

  },
  providers:[]
} satisfies NextAuthConfig
