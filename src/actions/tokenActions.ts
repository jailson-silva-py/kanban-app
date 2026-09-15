"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { after } from "next/server";
import * as nodemailer from "nodemailer";
import { hash } from "argon2";
import { prisma } from "prisma";
import { protectedActions } from "./wrappers";
import { InvalidTokenError } from "@/types/AuthErrors";
import { passwordType } from "@/types/FormsZodType";
import { InvalidFieldsError } from "@/types/GlobalErrors";
import { emailHtml, textEmail } from "./_constraints";

export async function createToken() {
  const code = crypto.randomInt(0, 99999);
  const finalCode = String(code).padStart(5, "0");
  const nowDate = new Date();
  const finalDate = new Date(nowDate.getTime() + 1000 * 60 * 3);

  return protectedActions(async (session) => {
    const userId = session.user?.id;
    const existingToken = await prisma.verificationToken.findFirst({
      where: { identifier: userId as string },
    });

    await prisma.verificationToken.upsert({
      where: {
        identifier_token: {
          identifier: userId as string,
          token: existingToken?.token ?? finalCode,
        },
      },
      create: { token: finalCode, expires: finalDate, identifier: userId as string },
      update: { expires: finalDate, token: finalCode },
    });

    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    after(async () => {
      await transport.sendMail({
        subject: "Seu código de verificação do Krux",
        text: textEmail(finalCode),
        html: emailHtml(finalCode),
        from: process.env.SMTP_USER,
        to: session?.user?.email as string,
      });
    });

    const cookiesStore = await cookies();
    cookiesStore.set({
      name: "verification_change_password",
      value: userId as string,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 3,
    });

    return true;
  });
}

export async function verifyTokenCode(code: string) {
  return protectedActions(async (session) => {
    const userId = session.user?.id;
    const cookiesStore = await cookies();
    const tokenActive = await prisma.verificationToken.findFirst({
      where: { identifier: userId, token: code },
    });

    if (!tokenActive) {
      throw new InvalidTokenError();
    }

    const nowDate = new Date();
    const millisExpire = tokenActive.expires.getTime() - nowDate.getTime();

    cookiesStore.delete("verification_change_password");
    cookiesStore.set({
      name: "change_password_verified",
      value: userId as string,
      httpOnly: true,
      maxAge: millisExpire / 1000,
      secure: process.env.NODE_ENV == "production",
      path: "/",
    });
  });
}

export async function changeUserPassword({ password }: { password: string }) {
  return protectedActions(async (session) => {
    const userId = session?.user?.id;
    const isPasswordType = passwordType.safeParse(password).success;
    const cookiesStore = await cookies();

    if (!isPasswordType) {
      throw new InvalidFieldsError("A senha informada condiz com os requisitos.");
    }

    const hashPassword = await hash(password);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashPassword },
    });

    const token = await prisma.verificationToken.findFirst({
      where: { identifier: userId as string },
    });

    cookiesStore.delete("change_password_verified");
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: userId as string,
          token: token?.token as string,
        },
      },
    });
  });
}

export async function createTokenNewUser() {
  const code = crypto.randomInt(0, 99999);
  const finalCode = String(code).padStart(5, "0");
  const nowDate = new Date();
  const finalDate = new Date(nowDate.getTime() + 1000 * 60 * 3);

  return protectedActions(async (session) => {
    const userId = session.user?.id;
    const existingToken = await prisma.verificationToken.findFirst({
      where: { identifier: userId as string },
    });

    await prisma.verificationToken.upsert({
      where: {
        identifier_token: {
          identifier: userId as string,
          token: existingToken?.token ?? finalCode,
        },
      },
      create: { token: finalCode, expires: finalDate, identifier: userId as string },
      update: { expires: finalDate, token: finalCode },
    });

    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    after(async () => {
      await transport.sendMail({
        subject: "Seu código de verificação do Krux",
        text: textEmail(finalCode),
        html: emailHtml(finalCode),
        from: process.env.SMTP_USER,
        to: session?.user?.email as string,
      });
    });

    const cookiesStore = await cookies();
    cookiesStore.set({
      name: "verification_new_user",
      value: userId as string,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/signin/verify",
      maxAge: 60 * 3,
    });

    return true;
  });
}

export async function verifyNewUser(code: string) {
  return protectedActions(async (session) => {
    const userId = session.user?.id;
    const cookiesStore = await cookies();
    const tokenActive = await prisma.verificationToken.findFirst({
      where: { identifier: userId, token: code },
    });

    if (!tokenActive) {
      throw new InvalidTokenError();
    }

    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() },
      select: { emailVerified: true },
    });

    cookiesStore.delete("verification_new_user");
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: userId,
          token: tokenActive.token,
        },
      },
    });
  });
}
