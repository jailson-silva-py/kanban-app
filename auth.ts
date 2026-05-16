import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "prisma";
import { hash, verify } from "argon2";
import { emailType, passwordType, usernameType } from "@/types/FormsZodType";
import {
  DatabaseError,
  EmailAlreadyExistsError,
  InvalidCredentialsError,
} from "@/types/AuthErrors";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Google,
    CredentialsProvider({
      credentials: {
        email: {},
        password: {},
        name: {},
      },

      authorize: async (credentials) => {
        try {
          const isValidPass = passwordType.safeParse(
            credentials.password,
          ).success;
          const isValidEmail = emailType.safeParse(credentials.email).success;

          const tryUser = await prisma.user.findFirst({
            where: { email: credentials.email as string },
          });

          if (!isValidEmail || !isValidPass)
            throw new InvalidCredentialsError();

          if (!tryUser) {
            const isValidName = usernameType.safeParse(
              credentials.name,
            ).success;
            if (!isValidName) throw new InvalidCredentialsError();

            const hashPw = await hash(credentials.password as string);
            const user = await prisma.user.create({
              data: {
                email: credentials.email as string,
                password: hashPw,
                name: credentials.name as string,
                image: "/default-avatar.webp",
              },
              omit: { password: true },
            });
            return user;
          } else if (tryUser.password === null) {
            throw new EmailAlreadyExistsError();
          } else {
            const isCorrectPass = await verify(
              tryUser.password,
              credentials.password as string,
            );

            if (!isCorrectPass) throw new InvalidCredentialsError();

            const { password: _, ...userAuth } = tryUser;

            return userAuth;
          }
        } catch (Error) {
          // Erros esperados: deixa subir pro NextAuth tratar
          if (Error instanceof InvalidCredentialsError) throw Error;
          if (Error instanceof EmailAlreadyExistsError) throw Error;

          // Erro inesperado (banco caiu, bug, etc): loga e wrapa
          console.error("[authorize] Unexpected error:", Error);
          throw new DatabaseError(Error);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/login",
  },
});
