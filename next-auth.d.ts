import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  // Extend built-in User type
  interface User extends DefaultUser {
    id: string;
    teamId: string;
  }

  // Extend built-in Session type
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      teamId: string;
    };
  }

  // Extend JWT type (for token callbacks)
  interface JWT {
    id: string;
    teamId: string;
  }
}

export { NextAuth, DefaultSession };
