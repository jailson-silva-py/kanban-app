"use server";
import {
  BoardFull,
  BoardSimple,
  Card,
  Column,
  ColumnSimple,
  ColumnSkeleton,
} from "@/types/dataTypes";
import { prisma } from "prisma";
import { auth } from "auth";
import { protectedActions } from "./wrappers";

const timeout: Promise<never> = new Promise(() => {
  const controler = new AbortController();

  const time = setTimeout(() => controler.abort(), 3000);
  clearTimeout(time);
});

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
  column,
  title,
}: {
  id?: string;
  column: ColumnSimple;
  title: string;
}): Promise<Card | null> {
  const maxPositionCard =
    column.cards.length > 0
      ? column.cards.reduce(
          (max, card) => (card.position > (max?.position || 0) ? card : max),
          column.cards[0],
        )
      : { position: 0 };

  const position = maxPositionCard.position + 100;

  return prisma.card.create({
    data: { id, columnId: column.id, title, position },
    select: {
      id: true,
      title: true,
      position: true,
      completed: true,
      columnId: true,
    },
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
      return await createCartForColumn({ column, title });
    }

    const column = await prisma.column.create({
      data: { title: "Inbox Column", order: 100, boardId: inBoxBoard.id },
      select: { id: true, cards: { select: { id: true, position: true } } },
    });
    return await createCartForColumn({ id, column, title });
  });
}

export async function getCardsForInBoxUser(): Promise<{ cards: Card[] | [] }> {
  const column = await protectedActions((session) =>
    Promise.race([
      prisma.board.findFirst({
        where: { isInbox: true, ownerId: session.user?.id },
        select: {
          columns: {
            take: 1,
            select: {
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

  return column?.columns[0] ?? { cards: [] };
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
  const { title: newTitle } = await protectedActions(() =>
    Promise.race([
      prisma.board.update({
        where: { id },
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
  columns,
}: {
  boardId: string;
  idColumn?: string;
  titleColumn: string;
  columns: ColumnSkeleton[];
}) {
  return protectedActions(() => {
    const objMaxOrder =
      columns.length > 0
        ? columns.reduce(
            (prev, curr) => (curr.order > (prev.order || 0) ? curr : prev),
            columns[0],
          )
        : { order: 0 };

    const order = objMaxOrder.order + 100;

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
