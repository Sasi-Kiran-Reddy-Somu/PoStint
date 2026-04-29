import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "worker" | "ops";
      redditUsername?: string;
      tier?: string;
      status?: string;
    } & Omit<DefaultSession["user"], "id">;
  }
  interface User {
    id?: string;
    role: "worker" | "ops";
    redditUsername?: string;
    tier?: string;
    status?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      id: "credentials",
      name: "Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email as string;
        const password = credentials.password as string;

        // Check ops users first
        const ops = await prisma.opsUser.findUnique({ where: { email } });
        if (ops) {
          const valid = await bcrypt.compare(password, ops.passwordHash);
          if (!valid) return null;
          return { id: ops.id, email: ops.email, name: ops.name, role: "ops" };
        }

        // Then check workers
        const worker = await prisma.worker.findUnique({ where: { email } });
        if (worker) {
          const valid = await bcrypt.compare(password, worker.passwordHash);
          if (!valid) return null;
          return {
            id: worker.id,
            email: worker.email,
            name: worker.displayName ?? worker.redditUsername,
            role: "worker",
            redditUsername: worker.redditUsername,
            tier: worker.tier,
            status: worker.status,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.redditUsername = user.redditUsername;
        token.tier = user.tier;
        token.status = user.status;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "worker" | "ops";
        session.user.redditUsername = token.redditUsername as string | undefined;
        session.user.tier = token.tier as string | undefined;
        session.user.status = token.status as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
});
