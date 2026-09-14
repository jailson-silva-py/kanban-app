vi.unmock("@/actions/wrappers");
vi.mock("next-auth", () => ({
  Session: class Session {},
  CredentialsSignin: class CredentialsSignin extends Error {
    code?: string;
    constructor(message?: string) {
      super(message);
      this.name = "CredentialsSignin";
    }
  },
}));

import { auth } from "auth";
import { protectedActions, withTimeout } from "@/actions/wrappers";
import { UnAuthentichatedError } from "@/types/AuthErrors";
import { TimeoutError } from "@/types/GlobalErrors";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

const session = { user: { id: "123", email: "test@example.com" } };

beforeEach(() => {
  vi.mocked(auth).mockResolvedValue(session as never);
});

describe("withTimeout", () => {
  it("resolve com o valor da operação quando ela é mais rápida que o timeout", async () => {
    const operation = Promise.resolve("dados");
    await expect(withTimeout(operation, 1000)).resolves.toBe("dados");
  });

  it("rejeita com TimeoutError quando a operação demora mais que o tempo limite", async () => {
    const operation = new Promise<never>(() => {});
    await expect(withTimeout(operation, 30)).rejects.toBeInstanceOf(TimeoutError);
  });

  it("rejeita com TimeoutError com a mensagem padrão", async () => {
    const operation = new Promise<never>(() => {});
    await expect(withTimeout(operation, 30)).rejects.toThrow(
      "Os dados demoram demais para serem entregues",
    );
  });

  it("usa o timeout padrão de 5000ms quando ms não é informado", async () => {
    const operation = Promise.resolve("ok");
    await expect(withTimeout(operation)).resolves.toBe("ok");
  });
});

describe("protectedActions", () => {
  it("chama auth() e retorna o resultado do callback com a sessão", async () => {
    const result = await protectedActions(async (s) => s.user.id);
    expect(auth).toHaveBeenCalled();
    expect(result).toBe("123");
  });

  it("lança UnAuthentichatedError quando não há sessão", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as never);
    await expect(protectedActions(() => Promise.resolve("x"))).rejects.toBeInstanceOf(
      UnAuthentichatedError,
    );
  });

  it("lança UnAuthentichatedError quando a sessão não possui user.id", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: {} } as never);
    await expect(protectedActions(() => Promise.resolve("x"))).rejects.toBeInstanceOf(
      UnAuthentichatedError,
    );
  });

  it("lança TimeoutError quando o callback demora mais que o tempo limite", async () => {
    vi.useFakeTimers();
    try {
      const promise = protectedActions(() => new Promise<never>(() => {}));
      const handled = promise.catch((e) => e);
      await vi.advanceTimersByTimeAsync(5000);
      await expect(handled).resolves.toBeInstanceOf(TimeoutError);
    } finally {
      vi.useRealTimers();
    }
  });

  it("substitui a mensagem de erros com name AbortError pela mensagem de timeout", async () => {
    const abortError = Object.assign(new Error("Abortado"), { name: "AbortError" });
    await expect(
      protectedActions(() => Promise.reject(abortError)),
    ).rejects.toThrow(
      "O servidor demorou muito para responder: TimeoutError. Falha ao buscar Board.",
    );
  });

  it("formata a mensagem de PrismaClientKnownRequestError", async () => {
    const prismaError = new PrismaClientKnownRequestError("Falha original", {
      code: "P2002",
      clientVersion: "7.5.0",
    });

    await expect(protectedActions(() => Promise.reject(prismaError))).rejects.toThrow(
      "Erro de banco de dados ao buscar Board: PrismaClientKnownRequestError -> Falha original",
    );
  });

  it("aplica o customMessage sobre erros comuns", async () => {
    await expect(
      protectedActions(() => Promise.reject(new Error("erro interno")), "Mensagem customizada"),
    ).rejects.toThrow("Mensagem customizada");
  });

  it("customMessage sobrescreve até a mensagem de PrismaClientKnownRequestError", async () => {
    const prismaError = new PrismaClientKnownRequestError("Falha original", {
      code: "P2002",
      clientVersion: "7.5.0",
    });

    await expect(
      protectedActions(() => Promise.reject(prismaError), "Mensagem customizada"),
    ).rejects.toThrow("Mensagem customizada");
  });

  it("relança erros que não são instância de Error sem alteração", async () => {
    await expect(protectedActions(() => Promise.reject("boom"))).rejects.toBe("boom");
  });

  it("propaga o erro do callback quando não há tratamento específico", async () => {
    const error = new Error("erro qualquer");
    await expect(protectedActions(() => Promise.reject(error))).rejects.toBe(error);
  });
});