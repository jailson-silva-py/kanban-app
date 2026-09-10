"use server";
import { Card } from "@/types/dataTypes";
import { prisma } from "prisma";
import { protectedActions } from "./wrappers";

export async function createCartForColumn({
  id,
  columnId,
  title,
}: {
  id?: string;
  columnId: string;
  title: string;
}): Promise<Card | null> {
  return protectedActions(async (session) => {
    const maxPositionCard = await prisma.card.findFirst({
      where: { columnId, column: { board: { ownerId: session?.user?.id } } },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const position = (maxPositionCard?.position || 0) + 100;

    return prisma.card.create({
      data: { id, columnId: columnId, title, position },
      select: {
        id: true,
        title: true,
        position: true,
        completed: true,
        columnId: true,
      },
    });
  });
}

export async function createCartForColumnInBox({
  title,
  id,
}: {
  title: string;
  id?: string;
}): Promise<Card | null> {
  return protectedActions(async (session) => {
    const userId = session.user?.id;
    let inBoxBoard = await prisma.board.findFirst({
      where: {
        ownerId: userId,
        isInbox: true,
      },
      select: {
        id: true,
        columns: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!inBoxBoard) {
      inBoxBoard = await prisma.board.create({
        data: { title: "InBox", ownerId: userId as string, isInbox: true },
        select: {
          id: true,
          columns: {
            select: {
              id: true,
            },
          },
        },
      });
    }

    if (inBoxBoard.columns.length > 0) {
      const column = inBoxBoard.columns[0];
      return await createCartForColumn({ id, columnId: column.id, title });
    }

    const column = await prisma.column.create({
      data: { title: "Inbox Column", order: 100, boardId: inBoxBoard.id },
      select: { id: true },
    });

    return await createCartForColumn({ id, columnId: column.id, title });
  });
}

export async function getColumnForInBoxUser() {
  const column = await protectedActions((session) =>
    prisma.board.findFirst({
      where: { isInbox: true, ownerId: session.user?.id },
      select: {
        columns: {
          take: 1,
          select: {
            id: true,
            cards: {
              select: {
                position: true,
                title: true,
                id: true,
                completed: true,
                columnId: true,
              },
              orderBy: { position: "desc" },
            },
          },
        },
      },
    }),
  );

  return column?.columns[0];
}

export const ChangeCompletedCard = async ({
  id,
}: {
  id: string;
}): Promise<Card> => {
  return protectedActions(async (session) =>
  {
    const result = await prisma.$queryRaw`UPDATE "Card"
      SET completed = NOT completed
      FROM "Column", "Board"
      WHERE "Card".id = ${id}
        AND "Card"."columnId" = "Column".id
        AND "Column"."boardId" = "Board".id
        AND "Board"."ownerId" = ${session.user.id}
      RETURNING
        "Card".id,
        "Card".completed,
        "Card".title,
        "Card".position,
        "Card"."columnId";
    `
      return Array.isArray(result) ? result[0]:null
  })
};

export const DeleteCard = async ({ id }: { id: string }): Promise<Card> => {
  return protectedActions(async (session) => {
    return prisma.card.delete({
      where: { id, column: { board: { ownerId: session.user.id } } },
      select: {
        id: true,
        title: true,
        position: true,
        columnId: true,
        completed: true,
      },
    });
  });
};

interface ReOrderObj {
  columnTargetId: string;
  nextCardId?: string | undefined;
  prevCardId?: string | undefined;
  cardId: string;
  positionCard: number;
}

export const reOrderCardsFromColumns = async ({
  columnTargetId,
  prevCardId,
  cardId,
  nextCardId,
  positionCard,
}: ReOrderObj) => {
  const result = await protectedActions(async (session) => {
    const c = prisma.card.update({
      where: { id: cardId, column: { board: { ownerId: session.user?.id } } },
      data: { columnId: columnTargetId, position: positionCard },
      omit: { description: true, createdAt: true, updatedAt: true },
    });

    let prevC: Promise<null | { position: number; id: string } | null> =
      Promise.resolve(null);
    let nextC: Promise<null | { position: number; id: string } | null> =
      Promise.resolve(null);

    if (prevCardId) {
      prevC = prisma.card.findUnique({
        where: {
          id: prevCardId,
          column: { board: { ownerId: session.user?.id } },
        },
        select: { position: true, id: true },
      });
    }

    if (nextCardId) {
      nextC = prisma.card.findUnique({
        where: {
          id: nextCardId,
          column: { board: { ownerId: session.user?.id } },
        },
        select: { position: true, id: true },
      });
    }

    const [objCard, objPrevCard, objNextCard] = await Promise.allSettled([
      c,
      prevC,
      nextC,
    ]);

    const card = objCard.status === "fulfilled" ? objCard.value : null;
    const prevCard =
      objPrevCard.status == "fulfilled"
        ? objPrevCard.value || { position: 0, id: null }
        : { position: 0, id: null };
    const nextCard =
      objNextCard.status == "fulfilled"
        ? objNextCard.value || { position: 0, id: null }
        : { position: 0, id: null };

    const isVeryLowDiff =
      Math.abs(prevCard.position - nextCard?.position) < 0.0001;

    const columnsTargetAndSourceEqual = card?.columnId === columnTargetId;
    let reindexed = false;

    if (isVeryLowDiff && columnsTargetAndSourceEqual) {
      const cards = await prisma.card.findMany({
        where: {
          column: { id: columnTargetId, board: { ownerId: session?.user?.id } },
        },
        orderBy: { position: "asc" },
        select: { id: true },
      });

      if (!cards) return { reindexed: false, card: null };

      let caseLines = "";
      cards.forEach((value, index) => {
        const position = (index + 1) * 100;
        caseLines += `WHEN '${value.id}' THEN ${position} \n`;
      });

      const ids = "'" + cards.map((card) => `${card.id}`).join("', '") + "'";

      const queryFinal = `
        UPDATE "Card"
        SET "position" = CASE "id"
        ${caseLines}
        END
        WHERE "id" IN (${ids}) AND "columnId" = '${columnTargetId}'`;

      await prisma.$executeRawUnsafe(queryFinal);
      reindexed = true;
    }

    return { reindexed, card };
  });

  return result;
};
