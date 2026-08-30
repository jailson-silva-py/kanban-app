"use server";

import { Column } from "@/types/dataTypes";
import { prisma } from "prisma";
import { protectedActions } from "./wrappers";

export async function getColumnById(id: string): Promise<Column | null> {
  return protectedActions(() =>
    prisma.column.findUnique({
      where: { id },
      select: {
        id: true,
        boardId: true,
        title: true,
        order: true,
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
        boardId,
        board: { ownerId: session?.user?.id },
      },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const order = (maxPositionColumn?.order || 0) + 100;

    return prisma.column.create({
      data: { id, title: titleColumn, boardId, order },
      select: { order: true, title: true, id: true },
    });
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
    prisma.column.update({
      where: { id },
      data: { title },
      select: { title: true },
    }),
  );
};

export const DeleteColumn = async ({ id }: { id: string }) => {
  return protectedActions(async (session) =>
    prisma.column.delete({
      where: { id, board: { ownerId: session.user.id } },
    }),
  );
};
