import crypto from "crypto";
import { prisma } from "prisma";
import { cookies } from "next/headers";
import { after } from "next/server";
import * as nodemailer from "nodemailer";
import { hash } from "argon2";
import { InvalidTokenError } from "@/types/AuthErrors";
import { InvalidFieldsError } from "@/types/GlobalErrors";

vi.mock("next-auth", () => ({
  CredentialsSignin: class CredentialsSignin extends Error {
    code?: string;
    constructor(message?: string) {
      super(message);
      this.name = "CredentialsSignin";
    }
  },
}));

vi.mock("@/actions/wrappers", () => ({
  protectedActions: vi.fn(
    (cb: (s: { user: { id: string; email: string } }) => unknown) =>
      cb({ user: { id: "test-user", email: "test@example.com" } }),
  ),
}));

vi.mock("prisma", () => ({
  prisma: {
    verificationToken: { findFirst: vi.fn(), upsert: vi.fn(), delete: vi.fn() },
    user: { update: vi.fn() },
  },
}));

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("next/server", () => ({ after: vi.fn() }));
vi.mock("nodemailer", () => ({ createTransport: vi.fn() }));
vi.mock("argon2", () => ({ hash: vi.fn() }));

import {
  createToken,
  verifyTokenCode,
  changeUserPassword,
  createTokenNewUser,
  verifyNewUser,
} from "./tokenActions";

let cookieStore: { set: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };

beforeEach(() => {
  vi.spyOn(crypto, "randomInt").mockReturnValue(42 as never);
  cookieStore = { set: vi.fn(), delete: vi.fn() };
  vi.mocked(cookies).mockResolvedValue(cookieStore as never);
  vi.mocked(nodemailer.createTransport).mockReturnValue({
    sendMail: vi.fn().mockResolvedValue({ messageId: "1" }),
  } as never);
});

describe("createToken", () => {
  it("faz upsert do token com código de 5 dígitos e retorna true", async () => {
    vi.mocked(prisma.verificationToken.findFirst).mockResolvedValueOnce(null as never);

    await expect(createToken()).resolves.toBe(true);

    expect(prisma.verificationToken.upsert).toHaveBeenCalledWith({
      where: { identifier_token: { identifier: "test-user", token: "00042" } },
      create: { token: "00042", expires: expect.any(Date), identifier: "test-user" },
      update: { expires: expect.any(Date), token: "00042" },
    });
  });

  it("reutiliza o token existente no where do upsert", async () => {
    vi.mocked(prisma.verificationToken.findFirst).mockResolvedValueOnce({
      token: "abc123",
    } as never);

    await createToken();

    expect(prisma.verificationToken.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { identifier_token: { identifier: "test-user", token: "abc123" } },
      }),
    );
  });

  it("define o cookie de verificação de alteração de senha", async () => {
    await createToken();

    expect(cookieStore.set).toHaveBeenCalledWith({
      name: "verification_change_password",
      value: "test-user",
      httpOnly: true,
      secure: false,
      path: "/",
      maxAge: 180,
    });
  });

  it("envia o email com o código através do after (interação)", async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: "1" });
    vi.mocked(nodemailer.createTransport).mockReturnValue({ sendMail } as never);
    vi.mocked(after).mockImplementation(((cb: () => void) => cb()) as never);

    await createToken();

    const afterCallback = vi.mocked(after).mock.calls[0][0] as () => Promise<unknown>;
    await afterCallback();

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: undefined, pass: undefined },
    });
    expect(sendMail).toHaveBeenCalledWith({
      subject: "Seu código de verificação do Krux",
      text: expect.stringContaining("00042"),
      html: expect.stringContaining("00042"),
      from: undefined,
      to: "test@example.com",
    });
  });
});

describe("verifyTokenCode", () => {
  it("valida o código, apaga o cookie antigo e define o cookie de senha verificada", async () => {
    const expires = new Date(Date.now() + 120000);
    vi.mocked(prisma.verificationToken.findFirst).mockResolvedValueOnce({
      expires,
      token: "00042",
    } as never);

    await verifyTokenCode("00042");

    expect(prisma.verificationToken.findFirst).toHaveBeenCalledWith({
      where: { identifier: "test-user", token: "00042" },
    });
    expect(cookieStore.delete).toHaveBeenCalledWith("verification_change_password");
    expect(cookieStore.set).toHaveBeenCalledWith({
      name: "change_password_verified",
      value: "test-user",
      httpOnly: true,
      maxAge: expect.any(Number),
      secure: false,
      path: "/",
    });
  });

  it("lança InvalidTokenError quando o código não existe", async () => {
    vi.mocked(prisma.verificationToken.findFirst).mockResolvedValueOnce(null as never);

    await expect(verifyTokenCode("00000")).rejects.toBeInstanceOf(InvalidTokenError);
    expect(cookieStore.delete).not.toHaveBeenCalled();
    expect(cookieStore.set).not.toHaveBeenCalled();
  });
});

describe("changeUserPassword", () => {
  it("lança InvalidFieldsError para senha que não atende os requisitos", async () => {
    await expect(changeUserPassword({ password: "abc" })).rejects.toBeInstanceOf(
      InvalidFieldsError,
    );
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("atualiza a senha com hash, apaga o cookie e remove o token", async () => {
    vi.mocked(hash).mockResolvedValueOnce("hash-gerado" as never);
    vi.mocked(prisma.verificationToken.findFirst).mockResolvedValueOnce({
      token: "tok-antigo",
    } as never);

    await changeUserPassword({ password: "Senha@123" });

    expect(hash).toHaveBeenCalledWith("Senha@123");
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "test-user" },
      data: { password: "hash-gerado" },
    });
    expect(cookieStore.delete).toHaveBeenCalledWith("change_password_verified");
    expect(prisma.verificationToken.delete).toHaveBeenCalledWith({
      where: { identifier_token: { identifier: "test-user", token: "tok-antigo" } },
    });
  });
});

describe("createTokenNewUser", () => {
  it("faz upsert do token e define o cookie de verificação de novo usuário", async () => {
    vi.mocked(prisma.verificationToken.findFirst).mockResolvedValueOnce(null as never);

    await expect(createTokenNewUser()).resolves.toBe(true);

    expect(prisma.verificationToken.upsert).toHaveBeenCalledWith({
      where: { identifier_token: { identifier: "test-user", token: "00042" } },
      create: { token: "00042", expires: expect.any(Date), identifier: "test-user" },
      update: { expires: expect.any(Date), token: "00042" },
    });
    expect(cookieStore.set).toHaveBeenCalledWith({
      name: "verification_new_user",
      value: "test-user",
      httpOnly: true,
      secure: false,
      path: "/signin/verify",
      maxAge: 180,
    });
  });

  it("envia o email com o código através do after (interação)", async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: "1" });
    vi.mocked(nodemailer.createTransport).mockReturnValue({ sendMail } as never);
    vi.mocked(after).mockImplementation(((cb: () => void) => cb()) as never);
    vi.mocked(prisma.verificationToken.findFirst).mockResolvedValueOnce(null as never);

    await createTokenNewUser();

    const afterCallback = vi.mocked(after).mock.calls[0][0] as () => Promise<unknown>;
    await afterCallback();

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Seu código de verificação do Krux",
        text: expect.stringContaining("00042"),
        html: expect.stringContaining("00042"),
        to: "test@example.com",
      }),
    );
  });
});

describe("verifyNewUser", () => {
  it("marca o email como verificado e remove o token e o cookie", async () => {
    vi.mocked(prisma.verificationToken.findFirst).mockResolvedValueOnce({
      token: "00042",
      expires: new Date(),
    } as never);

    await verifyNewUser("00042");

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "test-user" },
      data: { emailVerified: expect.any(Date) },
      select: { emailVerified: true },
    });
    expect(cookieStore.delete).toHaveBeenCalledWith("verification_new_user");
    expect(prisma.verificationToken.delete).toHaveBeenCalledWith({
      where: { identifier_token: { identifier: "test-user", token: "00042" } },
    });
  });

  it("lança InvalidTokenError quando o código não existe", async () => {
    vi.mocked(prisma.verificationToken.findFirst).mockResolvedValueOnce(null as never);

    await expect(verifyNewUser("00000")).rejects.toBeInstanceOf(InvalidTokenError);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
