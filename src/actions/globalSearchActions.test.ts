import { prisma } from "prisma";
import { protectedActions, withTimeout } from "@/actions/wrappers";
import { globalSearchWithText } from "./globalSearchActions";

vi.mock("@/actions/wrappers", () => ({
  protectedActions: vi.fn(
    (cb: (s: { user: { id: string } }) => unknown) => cb({ user: { id: "test-user" } }),
  ),
  withTimeout: vi.fn((p: Promise<unknown>) => p),
}));

vi.mock("prisma", () => ({
  prisma: {
    board: { findMany: vi.fn() },
    column: { findMany: vi.fn() },
    card: { findMany: vi.fn() },
  },
}));

describe("globalSearchWithText", () => {
  it("retorna boards, colunas e cards que combinam com o texto", async () => {
    const boards = [{ id: "b1", title: "Meu Projeto" }];
    const columns = [{ id: "c1", title: "Coluna Legal", boardId: "b1" }];
    const cards = [{ id: "k1", title: "Card Legal", column: { boardId: "b1" } }];

    vi.mocked(prisma.board.findMany).mockResolvedValueOnce(boards as never);
    vi.mocked(prisma.column.findMany).mockResolvedValueOnce(columns as never);
    vi.mocked(prisma.card.findMany).mockResolvedValueOnce(cards as never);

    await expect(globalSearchWithText({ text: "legal" })).resolves.toEqual({
      boards,
      columns,
      cards,
    });
  });

  it("busca boards não-inbox do usuário com contains insensível e limite de 5", async () => {
    vi.mocked(prisma.board.findMany).mockResolvedValueOnce([] as never);
    vi.mocked(prisma.column.findMany).mockResolvedValueOnce([] as never);
    vi.mocked(prisma.card.findMany).mockResolvedValueOnce([] as never);

    await globalSearchWithText({ text: "legal" });

    expect(prisma.board.findMany).toHaveBeenCalledWith({
      where: { ownerId: "test-user", title: { contains: "legal", mode: "insensitive" }, isInbox: false },
      take: 5,
      select: { id: true, title: true },
    });
    expect(prisma.column.findMany).toHaveBeenCalledWith({
      where: { title: { contains: "legal", mode: "insensitive" }, board: { isInbox: false, ownerId: "test-user" } },
      take: 5,
      select: { id: true, title: true, boardId: true },
    });
    expect(prisma.card.findMany).toHaveBeenCalledWith({
      where: { title: { contains: "legal", mode: "insensitive" }, column: { board: { isInbox: false, ownerId: "test-user" } } },
      take: 5,
      select: { id: true, title: true, column: { select: { boardId: true } } },
    });
  });

  it("executa as buscas por meio do withTimeout e do protectedActions (interação)", async () => {
    vi.mocked(prisma.board.findMany).mockResolvedValueOnce([] as never);
    vi.mocked(prisma.column.findMany).mockResolvedValueOnce([] as never);
    vi.mocked(prisma.card.findMany).mockResolvedValueOnce([] as never);

    await globalSearchWithText({ text: "x" });

    expect(protectedActions).toHaveBeenCalled();
    expect(withTimeout).toHaveBeenCalledWith(expect.any(Promise));
  });

  it("propaga erros das buscas", async () => {
    vi.mocked(prisma.board.findMany).mockRejectedValueOnce(new Error("falha na busca"));

    await expect(globalSearchWithText({ text: "x" })).rejects.toThrow("falha na busca");
  });
});