"use server";

import { prisma } from "prisma";
import { protectedActions, withTimeout } from "./wrappers";

export const globalSearchWithText = async ({ text }: { text: string }) => {
  return protectedActions(async (session) => {
    const ownerId = session?.user?.id;

    const resultBoards = prisma.board.findMany({
      where: {
        ownerId,
        title: { contains: text, mode: "insensitive" },
        isInbox: false,
      },
      take: 5,
      select: {
        id: true,
        title: true,
      },
    });

    const resultColumns = prisma.column.findMany({
      where: {
        title: { contains: text, mode: "insensitive" },
        board: { isInbox: false, ownerId },
      },
      take: 5,
      select: {
        id: true,
        title: true,
        boardId: true,
      },
    });

    const resultCards = prisma.card.findMany({
      where: {
        title: { contains: text, mode: "insensitive" },
        column: { board: { isInbox: false, ownerId } },
      },
      take: 5,
      select: {
        id: true,
        title: true,
        column: { select: { boardId: true } },
      },
    });

    const resultAll = await withTimeout(
      Promise.all([resultBoards, resultColumns, resultCards]),
    );

    const [boards, columns, cards] = resultAll;

    return { boards, columns, cards };
  });
};
