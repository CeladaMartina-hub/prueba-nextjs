import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

      if (isOnDashboard) {
        return isLoggedIn; // solo entra si está logueado, si no, a /login
      }

      return true; // todas las demás rutas son públicas siempre
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
