import { prisma } from "prisma";
import { protectedActions } from "@/actions/wrappers";
import {
  getCardById,
  createCartForColumn,
  createCartForColumnInBox,
  getColumnForInBoxUser,
  ChangeCompletedCard,
  DeleteCard,
  reOrderCardsFromColumns,
} from "./cardActions";

vi.mock("@/actions/cardActions", async () => {
  const actual = await vi.importActual("./cardActions");
  return {...actual}
})

vi.mock("prisma", () => ({
  prisma: {
    card: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
    board: { findFirst: vi.fn(), create: vi.fn() },
    column: { create: vi.fn() },
    $queryRaw: vi.fn(),
    $executeRawUnsafe: vi.fn(),
  },
}));

const selectCard = {
  id: true,
  title: true,
  position: true,
  completed: true,
  columnId: true,
};

describe("getCardById", () => {
  it("retorna o card somente quando ele pertence ao board do usuário", async () => {
    const card = { id: "card-1", columnId: "col-1", title: "Tarefa", position: 100, completed: false };
    vi.mocked(prisma.card.findUnique).mockResolvedValueOnce(card as never);

    await expect(getCardById("card-1")).resolves.toEqual(card);
    expect(prisma.card.findUnique).toHaveBeenCalledWith({
      where: { id: "card-1", column: { board: { ownerId: "test-user" } } },
      select: selectCard,
    });
  });
});

describe("createCartForColumn", () => {
  it("cria o card com position 100 quando não há cards na coluna", async () => {
    vi.mocked(prisma.card.findFirst).mockResolvedValueOnce(null as never);
    vi.mocked(prisma.card.create).mockResolvedValueOnce({
      id: "card-1",
      title: "Tarefa",
      position: 100,
      completed: false,
      columnId: "col-1",
    } as never);

    await expect(
      createCartForColumn({ id: "card-1", columnId: "col-1", title: "Tarefa" }),
    ).resolves.toEqual({ id: "card-1", title: "Tarefa", position: 100, completed: false, columnId: "col-1" });

    expect(prisma.card.findFirst).toHaveBeenCalledWith({
      where: { columnId: "col-1", column: { board: { ownerId: "test-user" } } },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    expect(prisma.card.create).toHaveBeenCalledWith({
      data: { id: "card-1", columnId: "col-1", title: "Tarefa", position: 100 },
      select: selectCard,
    });
  });

  it("cria o card com position = última posição + 100", async () => {
    vi.mocked(prisma.card.findFirst).mockResolvedValueOnce({ position: 300 } as never);
    vi.mocked(prisma.card.create).mockResolvedValueOnce({} as never);

    await createCartForColumn({ columnId: "col-1", title: "T" });

    expect(prisma.card.create).toHaveBeenCalledWith({
      data: { id: undefined, columnId: "col-1", title: "T", position: 400 },
      select: selectCard,
    });
  });
});

describe("createCartForColumnInBox", () => {
  it("usa a primeira coluna do board inbox existente", async () => {
    vi.mocked(prisma.board.findFirst).mockResolvedValueOnce({
      id: "inbox-1",
      columns: [{ id: "col-inbox" }],
    } as never);
    vi.mocked(prisma.card.findFirst).mockResolvedValueOnce(null as never);
    vi.mocked(prisma.card.create).mockResolvedValueOnce({
      id: "card-1",
      title: "Anotação",
      position: 100,
      completed: false,
      columnId: "col-inbox",
    } as never);

    await expect(createCartForColumnInBox({ title: "Anotação", id: "card-1" })).resolves.toEqual({
      id: "card-1",
      title: "Anotação",
      position: 100,
      completed: false,
      columnId: "col-inbox",
    });

    expect(prisma.board.findFirst).toHaveBeenCalledWith({
      where: { ownerId: "test-user", isInbox: true },
      select: { id: true, columns: { select: { id: true } } },
    });
    expect(prisma.board.create).not.toHaveBeenCalled();
    expect(prisma.card.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ columnId: "col-inbox", title: "Anotação", position: 100 }),
      }),
    );
  });

  it("cria o board inbox quando ele não existe e usa a coluna retornada", async () => {
    vi.mocked(prisma.board.findFirst).mockResolvedValueOnce(null as never);
    vi.mocked(prisma.board.create).mockResolvedValueOnce({
      id: "inbox-1",
      columns: [{ id: "col-inbox" }],
    } as never);
    vi.mocked(prisma.card.findFirst).mockResolvedValueOnce(null as never);
    vi.mocked(prisma.card.create).mockResolvedValueOnce({
      id: "card-1",
      title: "Anotação",
      position: 100,
      completed: false,
      columnId: "col-inbox",
    } as never);

    await createCartForColumnInBox({ title: "Anotação" });

    expect(prisma.board.create).toHaveBeenCalledWith({
      data: { title: "InBox", ownerId: "test-user", isInbox: true },
      select: { id: true, columns: { select: { id: true } } },
    });
    expect(prisma.card.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ columnId: "col-inbox" }),
      }),
    );
  });

  it("cria uma coluna 'Inbox Column' quando o board inbox não possui colunas", async () => {
    vi.mocked(prisma.board.findFirst).mockResolvedValueOnce({
      id: "inbox-1",
      columns: [],
    } as never);
    vi.mocked(prisma.column.create).mockResolvedValueOnce({ id: "col-nova" } as never);
    vi.mocked(prisma.card.findFirst).mockResolvedValueOnce(null as never);
    vi.mocked(prisma.card.create).mockResolvedValueOnce({
      id: "card-1",
      title: "Anotação",
      position: 100,
      completed: false,
      columnId: "col-nova",
    } as never);

    await createCartForColumnInBox({ title: "Anotação" });

    expect(prisma.column.create).toHaveBeenCalledWith({
      data: { title: "Inbox Column", order: 100, boardId: "inbox-1" },
      select: { id: true },
    });
    expect(prisma.card.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ columnId: "col-nova" }),
      }),
    );
  });

  it("cria board e coluna quando não há nem board nem coluna", async () => {
    vi.mocked(prisma.board.findFirst).mockResolvedValueOnce(null as never);
    vi.mocked(prisma.board.create).mockResolvedValueOnce({ id: "inbox-1", columns: [] } as never);
    vi.mocked(prisma.column.create).mockResolvedValueOnce({ id: "col-nova" } as never);
    vi.mocked(prisma.card.findFirst).mockResolvedValueOnce(null as never);
    vi.mocked(prisma.card.create).mockResolvedValueOnce({
      id: "card-1",
      title: "Anotação",
      position: 100,
      completed: false,
      columnId: "col-nova",
    } as never);

    await createCartForColumnInBox({ title: "Anotação" });

    expect(prisma.board.create).toHaveBeenCalled();
    expect(prisma.column.create).toHaveBeenCalled();
    expect(prisma.card.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ columnId: "col-nova" }),
      }),
    );
  });
});

describe("getColumnForInBoxUser", () => {
  it("retorna a primeira coluna do board inbox com os cards", async () => {
    const columnData = {
      id: "col-inbox",
      order:100,
      title:"inBox",
      cards: [{ id: "card-1", position: 100, title: "Anotação", completed: false, columnId: "col-inbox" }],
    };
    vi.mocked(prisma.board.findFirst).mockResolvedValueOnce({ columns: [columnData] } as never);

    await expect(getColumnForInBoxUser()).resolves.toEqual(columnData);

    expect(prisma.board.findFirst).toHaveBeenCalledWith({
      where: { isInbox: true, ownerId: "test-user" },
      select: {
        columns: {
          take: 1,
          select: {
            id: true,
            order:true,
            title:true,
            cards: {
              select: { position: true, title: true, id: true, completed: true, columnId: true },
              orderBy: { position: "desc" },
            },
          },
        },
      },
    });
  });

  it("retorna undefined quando não há board inbox", async () => {
    vi.mocked(prisma.board.findFirst).mockResolvedValueOnce(null as never);

    await expect(getColumnForInBoxUser()).resolves.toBeUndefined();
  });
});

describe("ChangeCompletedCard", () => {
  it("alterna o completed via query bruta e retorna o primeiro registro", async () => {
    const row = { id: "card-1", completed: true, title: "T", position: 100, columnId: "col-1" };
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([row] as never);

    await expect(ChangeCompletedCard({ id: "card-1" })).resolves.toEqual(row);
    expect(prisma.$queryRaw).toHaveBeenCalled();
  });

  it("retorna undefined quando a query retorna um array vazio", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([] as never);

    await expect(ChangeCompletedCard({ id: "card-1" })).resolves.toBeUndefined();
  });

  it("retorna null quando a query não retorna um array", async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce({ id: "card-1" } as never);

    await expect(ChangeCompletedCard({ id: "card-1" })).resolves.toBeNull();
  });
});

describe("DeleteCard", () => {
  it("deleta o card apenas se pertencer ao board do usuário", async () => {
    const deleted = { id: "card-1", title: "T", position: 100, columnId: "col-1", completed: false };
    vi.mocked(prisma.card.delete).mockResolvedValueOnce(deleted as never);

    await expect(DeleteCard({ id: "card-1" })).resolves.toEqual(deleted);

    expect(prisma.card.delete).toHaveBeenCalledWith({
      where: { id: "card-1", column: { board: { ownerId: "test-user" } } },
      select: selectCard,
    });
  });
});

describe("reOrderCardsFromColumns", () => {
  it("move o card e atualiza posição e coluna destino", async () => {
    vi.mocked(prisma.card.update).mockResolvedValueOnce({
      id: "card-1",
      columnId: "col-2",
      position: 150,
    } as never);
    vi.mocked(prisma.card.findUnique)
      .mockResolvedValueOnce({ id: "prev-1", position: 100 } as never)
      .mockResolvedValueOnce({ id: "next-1", position: 200 } as never);

    const result = await reOrderCardsFromColumns({
      cardId: "card-1",
      columnTargetId: "col-2",
      positionCard: 150,
      prevCardId: "prev-1",
      nextCardId: "next-1",
    });

    expect(result).toEqual({ reindexed: false, card: { id: "card-1", columnId: "col-2", position: 150 } });

    expect(prisma.card.update).toHaveBeenCalledWith({
      where: { id: "card-1", column: { board: { ownerId: "test-user" } } },
      data: { columnId: "col-2", position: 150 },
      omit: { description: true, createdAt: true, updatedAt: true },
    });
    expect(prisma.card.findUnique).toHaveBeenNthCalledWith(1, {
      where: { id: "prev-1", column: { board: { ownerId: "test-user" } } },
      select: { position: true, id: true },
    });
    expect(prisma.card.findUnique).toHaveBeenNthCalledWith(2, {
      where: { id: "next-1", column: { board: { ownerId: "test-user" } } },
      select: { position: true, id: true },
    });
    expect(prisma.$executeRawUnsafe).not.toHaveBeenCalled();
  });

  it("não busca cards vizinhos quando prevCardId e nextCardId não são informados", async () => {
    vi.mocked(prisma.card.update).mockResolvedValueOnce({
      id: "card-1",
      columnId: "col-origem",
      position: 150,
    } as never);

    const result = await reOrderCardsFromColumns({
      cardId: "card-1",
      columnTargetId: "col-2",
      positionCard: 150,
    });

    expect(result).toEqual({
      reindexed: false,
      card: { id: "card-1", columnId: "col-origem", position: 150 },
    });
    expect(prisma.card.findUnique).not.toHaveBeenCalled();
    expect(prisma.$executeRawUnsafe).not.toHaveBeenCalled();
  });

  it("reindexa os cards quando estão na mesma coluna com posições muito próximas", async () => {
    vi.mocked(prisma.card.update).mockResolvedValueOnce({
      id: "card-1",
      columnId: "col-1",
      position: 150,
    } as never);
    vi.mocked(prisma.card.findUnique)
      .mockResolvedValueOnce({ id: "prev-1", position: 100 } as never)
      .mockResolvedValueOnce({ id: "next-1", position: 100 } as never);
    vi.mocked(prisma.card.findMany).mockResolvedValueOnce([{ id: "a" }, { id: "b" }] as never);
    vi.mocked(prisma.$executeRawUnsafe).mockResolvedValueOnce(1 as never);

    const result = await reOrderCardsFromColumns({
      cardId: "card-1",
      columnTargetId: "col-1",
      positionCard: 150,
      prevCardId: "prev-1",
      nextCardId: "next-1",
    });

    expect(result).toEqual({
      reindexed: true,
      card: { id: "card-1", columnId: "col-1", position: 150 },
    });
    expect(prisma.card.findMany).toHaveBeenCalledWith({
      where: { column: { id: "col-1", board: { ownerId: "test-user" } } },
      orderBy: { position: "asc" },
      select: { id: true },
    });
    const rawQuery = vi.mocked(prisma.$executeRawUnsafe).mock.calls[0][0] as string;
    expect(rawQuery).toContain("UPDATE \"Card\"");
    expect(rawQuery).toContain("WHEN 'a' THEN 100");
    expect(rawQuery).toContain("WHEN 'b' THEN 200");
    expect(rawQuery).toContain("'col-1'");
  });

  it("retorna null quando a atualização do card falha", async () => {
    vi.mocked(prisma.card.update).mockRejectedValueOnce(new Error("falha"));

    const result = await reOrderCardsFromColumns({
      cardId: "card-1",
      columnTargetId: "col-2",
      positionCard: 150,
    });

    expect(result).toEqual(null);
  });

  it("trata falhas na busca dos vizinhos como posição 0 sem quebrar", async () => {
    vi.mocked(prisma.card.update).mockResolvedValueOnce({
      id: "card-1",
      columnId: "col-origem",
      position: 150,
    } as never);
    vi.mocked(prisma.card.findUnique).mockRejectedValue(new Error("falha vizinho"));

    const result = await reOrderCardsFromColumns({
      cardId: "card-1",
      columnTargetId: "col-2",
      positionCard: 150,
      prevCardId: "prev-1",
      nextCardId: "next-1",
    });

    expect(result).toEqual({
      reindexed: false,
      card: { id: "card-1", columnId: "col-origem", position: 150 },
    });
  });

  it("retorna sem reindexar quando findMany retorna null", async () => {
    vi.mocked(prisma.card.update).mockResolvedValueOnce({
      id: "card-1",
      columnId: "col-1",
      position: 150,
    } as never);
    vi.mocked(prisma.card.findUnique)
      .mockResolvedValueOnce({ id: "prev-1", position: 100 } as never)
      .mockResolvedValueOnce({ id: "next-1", position: 100 } as never);
    vi.mocked(prisma.card.findMany).mockResolvedValueOnce(null as never);

    const result = await reOrderCardsFromColumns({
      cardId: "card-1",
      columnTargetId: "col-1",
      positionCard: 150,
      prevCardId: "prev-1",
      nextCardId: "next-1",
    });

    expect(result).toEqual(null);
    expect(prisma.$executeRawUnsafe).not.toHaveBeenCalled();
  });

  it("é executada por meio do protectedActions", async () => {
    vi.mocked(prisma.card.update).mockResolvedValueOnce({} as never);

    await reOrderCardsFromColumns({ cardId: "card-1", columnTargetId: "col-2", positionCard: 100 });

    expect(protectedActions).toHaveBeenCalled();
  });
});