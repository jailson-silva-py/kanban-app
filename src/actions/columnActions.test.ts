import { prisma } from "prisma";
import { protectedActions } from "@/actions/wrappers";
import {
  getColumnById,
  getAllColumnsById,
  createColumnFromBoard,
  ChangeColumnTitle,
  deleteColumnById,
} from "./columnActions";


vi.mock("@/actions/columnActions", async () => {
  const actual = await vi.importActual("./columnActions");
  return {...actual}
})


vi.mock("prisma", () => ({
  prisma: {
    column: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const selectColumn = {
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
};
describe("getColumnById", () => {
  it("busca a coluna com os cards ordenados por posição", async () => {
    const column = {
      title: "Coluna Bacana!", id: "col-1", order: 100, boardId:"board-123",
      cards: [{ id: "card-1", title: "legal", completed:false, columnId:"col-1", position:100 }]
    };
    vi.mocked(prisma.column.findUnique).mockResolvedValueOnce(column as never);
  
    await expect(getColumnById("col-1", "board-123")).resolves.toEqual(column);
    expect(prisma.column.findUnique).toHaveBeenCalledWith({
      where: { id: "col-1", board: { id: "board-123", ownerId: "test-user" } },
      select: selectColumn,
    });
  });

  it("é executada por meio do protectedActions", async () => {
    vi.mocked(prisma.column.findUnique).mockResolvedValueOnce(null as never);
    await getColumnById("col-1","board-123");
    expect(protectedActions).toHaveBeenCalled();
  });
});

describe("getAllColumnsById", () => {
  it("retorna somente as colunas solicitadas do board do usuário", async () => {
    const columns = [{ id: "col-1", boardId: "board-1", title: "A Fazer", order: 100, cards: [] }];
    vi.mocked(prisma.column.findMany).mockResolvedValueOnce(columns as never);

    await expect(getAllColumnsById(["col-1"], "board-1")).resolves.toEqual(columns);
    expect(prisma.column.findMany).toHaveBeenCalledWith({
      where: { board: { id: "board-1", ownerId: "test-user" }, id: { in: ["col-1"] } },
      select: {
        boardId: true,
        id: true,
        cards: {
          select: { id: true, title: true, completed: true, position: true, description: true, columnId: true },
          orderBy: { position: "desc" },
        },
        title: true,
        order: true,
      },
    });
  });
});

describe("createColumnFromBoard", () => {
  it("cria a coluna com order 100 quando não há colunas no board", async () => {
    vi.mocked(prisma.column.findFirst).mockResolvedValueOnce(null as never);
    vi.mocked(prisma.column.create).mockResolvedValueOnce({
      id: "col-nova",
      title: "A Fazer",
      order: 100,
    } as never);

    await expect(
      createColumnFromBoard({ boardId: "board-1", titleColumn: "A Fazer" }),
    ).resolves.toEqual({ id: "col-nova", title: "A Fazer", order: 100 });

    expect(prisma.column.findFirst).toHaveBeenCalledWith({
      where: { boardId: "board-1", board: { ownerId: "test-user" } },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    expect(prisma.column.create).toHaveBeenCalledWith({
      data: { id: undefined, title: "A Fazer", boardId: "board-1", order: 100 },
      select: { order: true, title: true, id: true },
    });
  });

  it("cria a coluna com order = última ordem + 100", async () => {
    vi.mocked(prisma.column.findFirst).mockResolvedValueOnce({ order: 300 } as never);
    vi.mocked(prisma.column.create).mockResolvedValueOnce({ id: "c", title: "T", order: 400 } as never);

    await createColumnFromBoard({ boardId: "board-1", titleColumn: "T", idColumn: "col-x" });

    expect(prisma.column.create).toHaveBeenCalledWith({
      data: { id: "col-x", title: "T", boardId: "board-1", order: 400 },
      select: { order: true, title: true, id: true },
    });
  });
});

describe("ChangeColumnTitle", () => {
  it("atualiza o título da coluna e retorna o novo título", async () => {
    vi.mocked(prisma.column.update).mockResolvedValueOnce({ title: "Em Andamento" } as never);

    await expect(ChangeColumnTitle({ id: "col-1", title: "Em Andamento" })).resolves.toEqual({
      title: "Em Andamento",
    });

    expect(prisma.column.update).toHaveBeenCalledWith({
      where: { id: "col-1" },
      data: { title: "Em Andamento" },
      select: { title: true },
    });
  });

  it("trunca títulos com mais de 50 caracteres", async () => {
    const tituloLongo = "b".repeat(80);
    vi.mocked(prisma.column.update).mockResolvedValueOnce({ title: "" } as never);

    await ChangeColumnTitle({ id: "col-1", title: tituloLongo });

    const call = vi.mocked(prisma.column.update).mock.calls[0][0];
    expect((call as { data: { title: string } }).data.title).toHaveLength(51);
  });
});

describe("DeleteColumn", () => {
  it("deleta a coluna apenas se pertencer ao board do usuário", async () => {
    vi.mocked(prisma.column.delete).mockResolvedValueOnce({ id: "col-1" } as never);

    await deleteColumnById({ id: "col-1" });

    expect(prisma.column.delete).toHaveBeenCalledWith({
      where: { id: "col-1", board: { ownerId: "test-user" } },
    });
  });
});