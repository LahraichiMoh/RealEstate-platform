import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error("Invalid email or password");
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { client: true },
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        if (user.status !== "ACTIVE") {
          throw new Error("Account is inactive");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          clientId: user.clientId,
          clientName: user.client?.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.clientId = (user as any).clientId;
        token.clientName = (user as any).clientName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).clientId = token.clientId;
        (session.user as any).clientName = token.clientName;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
});
