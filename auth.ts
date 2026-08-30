import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "prisma";
import { hash, verify } from "argon2";
import { emailType, passwordType, usernameType } from "@/types/FormsZodType";
import {
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  InvalidMethodAccessError,
} from "@/types/AuthErrors";
import { InvalidFieldsError } from "@/types/GlobalErrors";
import { User } from "@/types/dataTypes";

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
      id:"credentials-signin",
      authorize: async (credentials):Promise<User|null> => {

          const isValidPass = passwordType.safeParse(
            credentials.password,
          ).success;
          const isValidEmail = emailType.safeParse(credentials.email).success;

          const isValidName = usernameType.safeParse(
            credentials.name,
            ).success;

          const tryUser = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (tryUser) throw new EmailAlreadyExistsError()

          if (!isValidEmail || !isValidPass || !isValidName) throw new InvalidFieldsError();

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

      },
    }),
    CredentialsProvider({
      id: "credentials-login",
      credentials: { email: {}, password: {} },
      authorize: async (credentials):Promise<User|null> => {
        const isValidPass = passwordType.safeParse(
          credentials.password,
        ).success;
        const isValidEmail = emailType.safeParse(credentials.email).success;

        if (!isValidPass ||!isValidEmail || !credentials.email ||!credentials.email) throw new InvalidFieldsError()

        const tryUser = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          omit:{createdAt:true, updatedAt:true}
        });

        if (!tryUser) throw new InvalidCredentialsError()
        else if (tryUser?.password !== null) {

          const equals = await verify(tryUser?.password, credentials.password as string);
          if (!equals) throw new InvalidCredentialsError()
          const user = { ...tryUser, password: null }
          return user;

        } else if (tryUser.password == null) throw new InvalidMethodAccessError()
        return null;
      }
    })
  ],
  callbacks: {

    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.emailVerified = user.emailVerified;
        token.id = user.id;
        if (account?.provider) {
          token.provider = account?.provider;
        }
      }
      if (trigger === "update" && session.emailVerified) {
        token.emailVerified = session.emailVerified;
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      if (token?.provider) {
        session.user.provider = token.provider as string;
      }

      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/login",
  },

});
