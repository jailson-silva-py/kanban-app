"use server";
import {
  BoardFull,
  BoardSimple,
  Card,
  Column,
} from "@/types/dataTypes";
import { prisma } from "prisma";
import { auth } from "auth";
import { protectedActions } from "./wrappers";

const { timeout } = {
  get timeout() {
    const controller = new AbortController();

    const promise = new Promise<never>((_, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("Timeout: A operação no banco demorou demais!"));
      }, 5000); // 5 segundos de limite

      // Se o controller for acionado parar timer imediatamente
      controller.signal.addEventListener("abort", () => clearTimeout(timer));
    });

    // Acoplando método de limpeza na própria Promise para interceptar o fim da corrida
    const originalThen = promise.then.bind(promise);
    promise.then = function (onfulfilled, onrejected) {
      controller.abort(); // Limpa o timer
      return originalThen(onfulfilled, onrejected);
    };

    return promise;
  },
};

export async function getUser() {
  const session = await auth();

  if (!session?.user?.id) return;

  return prisma.user.findFirst({
    where: { id: session.user.id },
    select: { name: true, image: true, id: true, email: true },
  });
}

export async function verifyUserExistsByEmail(email: string) {
  return prisma.user.count({ where: { email } });
}

export async function getInBoxBoard(ownerId: string) {
  const session = await auth();

  if (!session?.user?.id) return;

  return prisma.board.findMany({ where: { isInbox: true, ownerId } });
}

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
      orderBy:{position:"desc"},
      select:{position:true}
    })

    const position = (maxPositionCard?.position || 0) + 100
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

  })
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
      include: {
        columns: {
          select: {
            id: true,
            title: true,
            order: true,
            cards: { select: { id: true, position: true } },
          },
        },
      },
    });

    if (!inBoxBoard) {
      inBoxBoard = await prisma.board.create({
        data: { title: "InBox", ownerId: userId as string, isInbox: true },
        include: {
          columns: {
            select: {
              id: true,
              title: true,
              order: true,
              cards: { select: { id: true, position: true } },
            },
          },
        },
      });
    }

    if (inBoxBoard.columns.length > 0) {
      const column = inBoxBoard.columns[0];
      return await createCartForColumn({ columnId:column.id, title });
    }

    const column = await prisma.column.create({
      data: { title: "Inbox Column", order: 100, boardId: inBoxBoard.id },
      select: { id: true },
    });
    return await createCartForColumn({ id, columnId:column.id, title });
  });
}

export async function getColumnForInBoxUser() {
  const column = await protectedActions((session) =>
    Promise.race([
      prisma.board.findFirst({
        where: { isInbox: true, ownerId: session.user?.id },
        select: {
          columns: {
            take: 1,
            select: {
              id:true,
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
      timeout,
    ]),
  );

  return column?.columns[0]
}

export async function createBoardFromUser({
  title,
  id,
}: {
  title: string;
  id?: string;
}): Promise<BoardSimple | undefined> {
  const ownerId = (await auth())?.user?.id;

  if (!ownerId) return;

  try {
    const board = await prisma.board.create({
      data: { id, title, ownerId },
      select: { id: true, title: true },
    });

    return board;
  } catch (err: unknown) {
    if (err instanceof Error)
      throw new Error(`Erro ao criar o Board: (${err.name}) -> ${err.message}`);
  }
}

export async function getBoardById(id: string): Promise<BoardFull | null> {

  return protectedActions((session) =>
    Promise.race([
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
      timeout,
    ]),
  );
}

export async function getAllBoardFromUser() {
  return protectedActions<BoardSimple[]>((session) =>
    Promise.race([
      prisma.board.findMany({
        where: { ownerId: session.user?.id, isInbox: false },
        select: { id: true, title: true },
        orderBy: { updatedAt: "desc" },
      }),
      timeout,
    ]),
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
    Promise.race([
      prisma.board.update({
        where: { id, ownerId:session.user?.id },
        data: { title },
        select: { title: true },
      }),
      timeout,
    ]),
  );

  return newTitle;
}

export async function getColumnById(id: string): Promise<Column | null> {
  return protectedActions(() =>
    Promise.race([
      prisma.column.findUnique({
        where: { id },
        select: {
          id: true,
          boardId: true,
          title: true,
          order:true,
          cards: {
            select: {
              id: true,
              title: true,
              position: true,
              completed: true,
              columnId: true,
            },
            orderBy: { position: "desc" },
          },
        },
      }),
      timeout,
    ]),
  );
}

export async function createColumnFromBoard({
  boardId,
  idColumn: id,
  titleColumn,
}: {
  boardId: string;
  idColumn?: string;
  titleColumn: string;
}) {
  return protectedActions(async (session) => {
    const maxPositionColumn = await prisma.column.findFirst({
      where: {
        boardId, board: { ownerId: session?.user?.id }
      }, orderBy: { order: "desc" }, select: { order: true }
    })

    const order = (maxPositionColumn?.order || 0) + 100;

    return Promise.race([
      prisma.column.create({
        data: { id, title: titleColumn, boardId, order },
        select: { order: true, title: true, id: true },
      }),
      timeout,
    ]);
  });
}

export const ChangeColumnTitle = async ({
  id,
  title,
}: {
  id: string;
  title: string;
}) => {
  const maxLength = 50;
  title = title.length > maxLength ? title.slice(0, maxLength + 1) : title;

  return protectedActions(() =>
    Promise.race([
      prisma.column.update({
        where: { id },
        data: { title },
        select: { title: true },
      }),
      timeout,
    ]),
  );
};

export const ChangeCompletedCard = async ({
  id,
}: {
  id: string;
}): Promise<Card> => {
  return protectedActions(() =>
    Promise.race([
      prisma.$queryRaw`UPDATE "Card" SET completed = NOT completed WHERE id=${id} RETURNING id, completed, title, position, "columnId"` as Promise<Card>,
      timeout,
    ]),
  );
};

export const DeleteCard = async ({ id }: { id: string }): Promise<Card> => {
  return protectedActions(async () =>
    Promise.race([
      prisma.card.delete({
        where: { id },
        select: {
          id: true,
          title: true,
          position: true,
          columnId: true,
          completed: true,
        },
      }),
      timeout,
    ]),
  );
};

export const DeleteColumn = async ({ id }: { id: string }) => {
  return protectedActions(async () =>
    Promise.race([
      prisma.column.delete({
        where: { id },
      }),
      timeout,
    ]),
  );
};

export const globalSearchWithText = async ({ text }: { text: string }) => {
  return protectedActions(async () => {
    const resultBoards = prisma.board.findMany({
      where: {
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
        board: { isInbox: false },
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
        column: { board: { isInbox: false } },
      },
      take: 5,
      select: {
        id: true,
        title: true,
        column: { select: { boardId: true } },
      },
    });

    const resultAll = await Promise.race([
      Promise.all([resultBoards, resultColumns, resultCards]),
      timeout,
    ]);

    const [boards, columns, cards] = resultAll;

    return { boards, columns, cards };
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
