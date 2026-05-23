import { UnAuthentichatedError } from "@/types/AuthErrors";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { auth } from "auth";
import { Session } from "next-auth";

export async function protectedActions<T>(
  callback: (session: Session) => Promise<T>,
  customMessage?: string,
) {
  try {
    const session = await auth();

    if (!session?.user?.id)
      throw new UnAuthentichatedError;

    return callback(session);
  } catch (e: any) {
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

    customMessage ? (e.message = customMessage) : null;

    throw e;
  }
}
