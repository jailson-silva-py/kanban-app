import { DefaultSession } from "next-auth"
declare module "next-auth" {
  interface Session {
      user: {
        id: string;
        emailVerified: Date | null;
        provider?: string;
      } & DefaultSession["user"];
  }
  interface User {
    emailVerified: null | Date;
    provider?: string;
  }

}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    emailVerified: boolean | Date | null;
    provider?: string;
  }
}
