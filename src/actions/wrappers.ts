import { UnAuthentichatedError } from "@/types/AuthErrors";
import { TimeoutError } from "@/types/GlobalErrors";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { auth } from "auth";
import { Session } from "next-auth";

function createTimeout(ms: number, settleSignal: Promise<unknown>) {
  const controller = new AbortController();
  const promise = new Promise<never>((_, reject) => {
    const timer = setTimeout(() => {
      controller.abort();
      reject(new TimeoutError());
    }, ms);
    settleSignal.finally(() => clearTimeout(timer));
  })
  return {promise, controller}
}

export function withTimeout<T>(operation: Promise<T>, ms = 5000): Promise<T> {
  const { promise: TimeoutPromise } = createTimeout(ms, operation);
  return Promise.race([operation, TimeoutPromise])
}

export async function protectedActions<T>(
  callback: (session: Session) => Promise<T>,
  customMessage?: string,
) {
  try {
    const session = await auth();

    if (!session?.user?.id)
      throw new UnAuthentichatedError;

    return withTimeout(callback(session));
  } catch (e: unknown) {
    if (e instanceof Error) {
      if (e.name === "AbortError") {
        e.message =
          "O servidor demorou muito para responder: TimeoutError. Falha ao buscar Board.";
      }

      if (e instanceof PrismaClientKnownRequestError) {
        e.message =
          "Erro de banco de dados ao buscar Board: " +
          e.name +
          " -> " +
          e.message;
      }

      if (customMessage) {
        e.message = customMessage;
      }
    }
    throw e;
  }
}
