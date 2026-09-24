"use server";

import { BoardFull, BoardSimple } from "@/types/dataTypes";
import { prisma } from "prisma";
import { auth } from "auth";
import { protectedActions } from "./wrappers";

export async function createBoardFromUser({
  title,
  id,
  gradient,
}: {
  title: string;
  id?: string;
  gradient?:string,
}): Promise<BoardSimple | undefined> {
  const ownerId = (await auth())?.user?.id;

  if (!ownerId) return;

  try {
    const board = await prisma.board.create({
      data: { id, title, ownerId, gradient },
      select: { id: true, title: true, gradient:true },
    });

    return board;
  } catch (err: unknown) {
    if (err instanceof Error)
      throw new Error(`Erro ao criar o Board: (${err.name}) -> ${err.message}`);
  }
}

export async function getBoardById(id: string): Promise<BoardFull | null> {
  return protectedActions((session) =>
    prisma.board.findFirst({
      where: { id, isInbox: false, ownerId: session?.user?.id as string },
      select: {
        columns: {
          select: { order: true, id: true, title: true },
          orderBy: { order: "asc" },
        },
        id: true,
        title: true,
      },
    }),
  );
}

export async function getAllBoardFromUser() {
  return protectedActions<BoardSimple[]>((session) =>
    prisma.board.findMany({
      where: { ownerId: session.user.id, isInbox: false },
      select: { id: true, title: true, gradient:true },
      orderBy: { updatedAt: "desc" },
    }),
  );
}

export async function changeBoardTitle({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  title = title.length > 100 ? title.slice(0, 101) : title;

  const { title: newTitle } = await protectedActions((session) =>
    prisma.board.update({
      where: { id, ownerId: session.user?.id },
      data: { title },
      select: { title: true },
    }),
  );

  return newTitle;
}

export async function deleteBoard({ id }: { id: string }) {
  return await protectedActions(async (session) => {
    return prisma.board.delete({
      where: { ownerId: session.user?.id, id },
      select: { id: true, title: true },
    });
  });
}
