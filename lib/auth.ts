import NextAuth from "next-auth";
import { type DefaultSession, type DefaultJWT } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "./prisma";

// Extend NextAuth types
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name?: string | null;
      teamId: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    teamId: string;
  }
}

// ✅ Proper v5-compatible config
export const authOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Record<string, string> | undefined) {
        try {
          const email = credentials?.email;
          const password = credentials?.password;
          if (!email || !password) return null;

          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) return null;

          const valid = await bcrypt.compare(password, user.password);
          if (!valid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            teamId: user.teamId,
          };
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: any;
      user?: { id: string; teamId: string };
    }) {
      if (user) {
        token.id = user.id;
        token.teamId = user.teamId;
      }
      return token;
    },

    async session({
      session,
      token,
    }: {
      session: any;
      token: { id: string; teamId: string };
    }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.teamId = token.teamId;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// ✅ Create NextAuth instance
const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
export { handlers, auth, signIn, signOut };

// src/auth.ts
