import { prisma } from "prisma";
import { auth } from "auth";
import { protectedActions } from "@/actions/wrappers";
import {
  createBoardFromUser,
  getBoardById,
  getAllBoardFromUser,
  changeBoardTitle,
  deleteBoard,
} from "./boardActions";


vi.mock("@/actions/boardActions", async () => {
  const actual = await vi.importActual("./boardActions");
  return {...actual}
})


vi.mock("prisma", () => ({
  prisma: {
    board: { create: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
}));

const session = { user: { id: "test-user", email: "test@example.com" } };

beforeEach(() => {
  vi.mocked(auth).mockResolvedValue(session as never);
});

describe("createBoardFromUser", () => {
  it("retorna undefined quando não há usuário logado", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as never);

    await expect(createBoardFromUser({ title: "Projeto" })).resolves.toBeUndefined();
    expect(prisma.board.create).not.toHaveBeenCalled();
  });

  it("cria o board com id, título e ownerId e retorna o resultado", async () => {
    const board = { id: "board-1", title: "Projeto" };
    vi.mocked(prisma.board.create).mockResolvedValueOnce(board as never);

    await expect(createBoardFromUser({ title: "Projeto", id: "board-1" })).resolves.toEqual(board);

    expect(prisma.board.create).toHaveBeenCalledWith({
      data: { id: "board-1", title: "Projeto", ownerId: "test-user" },
      select: { id: true, title: true, gradient:true },
    });
  });

  it("cria o board sem id (id é opcional)", async () => {
    vi.mocked(prisma.board.create).mockResolvedValueOnce({ id: "board-2", title: "X" } as never);

    await createBoardFromUser({ title: "X" });

    expect(prisma.board.create).toHaveBeenCalledWith({
      data: { id: undefined, title: "X", ownerId: "test-user" },
      select: { id: true, title: true, gradient:true },
    });
  });

  it("lança erro descritivo quando a criação falha", async () => {
    vi.mocked(prisma.board.create).mockRejectedValueOnce(new Error("falha no banco"));

    await expect(createBoardFromUser({ title: "X" })).rejects.toThrow(
      "Erro ao criar o Board: (Error) -> falha no banco",
    );
  });

  it("não lança quando o erro não é instância de Error", async () => {
    vi.mocked(prisma.board.create).mockRejectedValueOnce("falha" as never);

    await expect(createBoardFromUser({ title: "X" })).resolves.toBeUndefined();
  });
});

describe("getBoardById", () => {
  it("busca o board com colunas ordenadas e filtro por owner", async () => {
    const board = {
      id: "board-1",
      title: "Projeto",
      columns: [{ id: "col-1", order: 100, title: "A Fazer" }],
    };
    vi.mocked(prisma.board.findFirst).mockResolvedValueOnce(board as never);

    await expect(getBoardById("board-1")).resolves.toEqual(board);

    expect(prisma.board.findFirst).toHaveBeenCalledWith({
      where: { id: "board-1", isInbox: false, ownerId: "test-user" },
      select: {
        columns: {
          select: { order: true, id: true, title: true },
          orderBy: { order: "asc" },
        },
        id: true,
        title: true,
      },
    });
  });

  it("é executada por meio do protectedActions", async () => {
    vi.mocked(prisma.board.findFirst).mockResolvedValueOnce(null as never);
    await getBoardById("board-1");
    expect(protectedActions).toHaveBeenCalled();
  });
});

describe("getAllBoardFromUser", () => {
  it("lista todos os boards não-inbox do usuário em ordem de atualização", async () => {
    const boards = [{ id: "b1", title: "A" }, { id: "b2", title: "B" }];
    vi.mocked(prisma.board.findMany).mockResolvedValueOnce(boards as never);

    await expect(getAllBoardFromUser()).resolves.toEqual(boards);

    expect(prisma.board.findMany).toHaveBeenCalledWith({
      where: { ownerId: "test-user", isInbox: false },
      select: { id: true, title: true, gradient:true },
      orderBy: { updatedAt: "desc" },
    });
  });
});

describe("changeBoardTitle", () => {
  it("atualiza o título do board e retorna o novo título", async () => {
    vi.mocked(prisma.board.update).mockResolvedValueOnce({ title: "Novo Título" } as never);

    await expect(changeBoardTitle({ id: "board-1", title: "Novo Título" })).resolves.toBe(
      "Novo Título",
    );

    expect(prisma.board.update).toHaveBeenCalledWith({
      where: { id: "board-1", ownerId: "test-user" },
      data: { title: "Novo Título" },
      select: { title: true },
    });
  });

  it("trunca títulos com mais de 100 caracteres", async () => {
    const tituloLongo = "a".repeat(150);
    vi.mocked(prisma.board.update).mockResolvedValueOnce({ title: "" } as never);

    await changeBoardTitle({ id: "board-1", title: tituloLongo });

    const call = vi.mocked(prisma.board.update).mock.calls[0][0];
    expect((call as { data: { title: string } }).data.title).toHaveLength(101);
  });
});

describe("deleteBoard", () => {
  it("deleta o board do usuário e retorna o resultado", async () => {
    const deleted = { id: "board-1", title: "Projeto" };
    vi.mocked(prisma.board.delete).mockResolvedValueOnce(deleted as never);

    await expect(deleteBoard({ id: "board-1" })).resolves.toEqual(deleted);

    expect(prisma.board.delete).toHaveBeenCalledWith({
      where: { ownerId: "test-user", id: "board-1" },
      select: { id: true, title: true },
    });
  });
});