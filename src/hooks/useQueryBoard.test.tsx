import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { useParams } from "next/navigation";
import { board, card, column, columnsBoard } from "@/constrants/queryKeys";
import { BoardClient, ColumnClient } from "@/types/clientDataTypes";
import { BoardFull } from "@/types/dataTypes";
import { createCard, createColumnClient } from "@/app/util/testImplementations";
import { useQueryBoard } from "./useQueryBoard";

vi.mock("next/navigation", () => ({
  useParams: vi.fn(() => ({ id: "board-1" })),
}));

const createQueryClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false, gcTime: Infinity } },
});

const renderBoardHook = (queryClient: QueryClient) => renderHook(() => useQueryBoard(), {
  wrapper: ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  ),
});

const boardData: BoardFull = {
  id: "board-1",
  title: "Board de teste",
  columns: [
    { id: "col-1", title: "A fazer", order: 100 },
    { id: "col-2", title: "Concluído", order: 200 },
  ],
};

const seedBoard = (queryClient: QueryClient, columns: ColumnClient[] = []) => {
  queryClient.setQueryData<BoardClient>(board("board-1"), {
    id: "board-1",
    title: "Board de teste",
    columnIds: columns.map(({ id }) => id),
  });
  queryClient.setQueryData(columnsBoard("board-1"), columns);
};

beforeEach(() => {
  vi.mocked(useParams).mockReturnValue({ id: "board-1" } as never);
});

describe("useQueryBoard", () => {
  describe("createBoardClient", () => {
    it("converte os dados do board para o formato do cache", () => {
      const { result } = renderBoardHook(createQueryClient());

      expect(result.current.createBoardClient(boardData)).toEqual({
        id: "board-1",
        title: "Board de teste",
        columnIds: ["col-1", "col-2"],
      });
    });

    it("retorna uma lista vazia de colunas quando o board não tem colunas", () => {
      const { result } = renderBoardHook(createQueryClient());

      expect(result.current.createBoardClient({ ...boardData, columns: [] })).toEqual({
        id: "board-1",
        title: "Board de teste",
        columnIds: [],
      });
    });
  });

  describe("createColumnsPlaceholder", () => {
    it("cria os placeholders de coluna com boardId e cardIds vazios", () => {
      const queryClient = createQueryClient();
      const { result } = renderBoardHook(queryClient);

      result.current.createColumnsPlaceholder(boardData);

      expect(queryClient.getQueryData(column("col-1"))).toEqual({
        ...boardData.columns[0],
        color: null,
        boardId: "board-1",
        cardIds: [],
      });
      expect(queryClient.getQueryData(column("col-2"))).toEqual({
        ...boardData.columns[1],
        color: null,
        boardId: "board-1",
        cardIds: [],
      });
    });

    it("não cria placeholders quando não há colunas", () => {
      const queryClient = createQueryClient();
      const { result } = renderBoardHook(queryClient);

      result.current.createColumnsPlaceholder({ ...boardData, columns: [] });

      expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    });
  });

  describe("getAllColumnsBoard", () => {
    it("retorna null se o board não está no cache", () => {
      const queryClient = createQueryClient();
      queryClient.setQueryData(columnsBoard("board-1"), []);
      const { result } = renderBoardHook(queryClient);

      expect(result.current.getAllColumnsBoard("board-1")).toBeNull();
    });

    it("retorna null quando o board está no cache, mas sua lista de colunas não", () => {
      const queryClient = createQueryClient();
      seedBoard(queryClient);
      queryClient.removeQueries({ queryKey: columnsBoard("board-1"), exact: true });
      const { result } = renderBoardHook(queryClient);

      expect(result.current.getAllColumnsBoard("board-1")).toBeNull();
    });

    it("retorna as colunas do board presentes no cache", () => {
      const queryClient = createQueryClient();
      const columns = [
        createColumnClient({ id: "col-1", title: "A fazer", boardId: "board-1", cardIds: ["card-1"], color: null, }),
      ];
      seedBoard(queryClient, columns);
      const { result } = renderBoardHook(queryClient);

      expect(result.current.getAllColumnsBoard("board-1")).toEqual(columns);
    });
  });

  describe("setBoard", () => {
    it("mescla os campos recebidos sem sobrescrever os demais dados", () => {
      const queryClient = createQueryClient();
      seedBoard(queryClient);
      const { result } = renderBoardHook(queryClient);

      result.current.setBoard({ title: "Novo título" });

      expect(queryClient.getQueryData(board("board-1"))).toEqual({
        id: "board-1",
        title: "Novo título",
        columnIds: [],
      });
    });

    it("não cria um board se ele ainda não existe no cache", () => {
      const queryClient = createQueryClient();
      const { result } = renderBoardHook(queryClient);

      result.current.setBoard({ title: "Novo título" });

      expect(queryClient.getQueryData(board("board-1"))).toBeUndefined();
    });

    it("não altera o cache quando não existe id de board na rota", () => {
      const queryClient = createQueryClient();
      seedBoard(queryClient);
      vi.mocked(useParams).mockReturnValue({} as never);
      const { result } = renderBoardHook(queryClient);

      result.current.setBoard({ title: "Não deve ser aplicado" });

      expect(queryClient.getQueryData(board("board-1"))).toEqual({
        id: "board-1",
        title: "Board de teste",
        columnIds: [],
      });
      vi.mocked(useParams).mockReturnValue({ id: "board-1" } as never);
    });
  });

  describe("createColumn", () => {
    const newColumn = createColumnClient({
      id: "col-new",
      title: "Nova coluna",
      boardId: "board-1",
      cardIds: ["card-1"],
      color: null,
    });

    it("adiciona uma coluna nova ao board, à lista e ao cache individual", () => {
      const queryClient = createQueryClient();
      seedBoard(queryClient);
      const { result } = renderBoardHook(queryClient);

      result.current.createColumn(newColumn);

      expect(queryClient.getQueryData<BoardClient>(board("board-1"))?.columnIds).toEqual(["col-new"]);
      expect(queryClient.getQueryData<ColumnClient[]>(columnsBoard("board-1"))).toEqual([newColumn]);
      expect(queryClient.getQueryData(column("col-new"))).toEqual(newColumn);
    });

    it("não duplica a coluna no board ou na lista, mas atualiza seu cache individual", () => {
      const queryClient = createQueryClient();
      const existingColumn = { ...newColumn, title: "Título antigo" };
      seedBoard(queryClient, [existingColumn]);
      const { result } = renderBoardHook(queryClient);

      result.current.createColumn(newColumn);

      expect(queryClient.getQueryData<BoardClient>(board("board-1"))?.columnIds).toEqual(["col-new"]);
      expect(queryClient.getQueryData<ColumnClient[]>(columnsBoard("board-1"))).toEqual([existingColumn]);
      expect(queryClient.getQueryData(column("col-new"))).toEqual(newColumn);
    });

    it("não cria a coluna quando o board associado não existe", () => {
      const queryClient = createQueryClient();
      const { result } = renderBoardHook(queryClient);

      result.current.createColumn(newColumn);

      expect(queryClient.getQueryData(column("col-new"))).toBeUndefined();
      expect(queryClient.getQueryData(columnsBoard("board-1"))).toBeUndefined();
    });

    it("atualiza o board e a coluna individual se a lista de colunas não está no cache", () => {
      const queryClient = createQueryClient();
      seedBoard(queryClient);
      queryClient.removeQueries({ queryKey: columnsBoard("board-1"), exact: true });
      const { result } = renderBoardHook(queryClient);

      result.current.createColumn(newColumn);

      expect(queryClient.getQueryData<BoardClient>(board("board-1"))?.columnIds).toEqual(["col-new"]);
      expect(queryClient.getQueryData(columnsBoard("board-1"))).toBeUndefined();
      expect(queryClient.getQueryData(column("col-new"))).toEqual(newColumn);
    });
  });

  describe("removeColumnById", () => {
    it("remove a coluna do board, da lista e o cache dos cards relacionados", () => {
      const queryClient = createQueryClient();
      const targetColumn = createColumnClient({
        id: "col-1",
        title: "A fazer",
        boardId: "board-1",
        cardIds: ["card-1"],
        color: null,
      });
      const otherColumn = createColumnClient({
        id: "col-2",
        title: "Concluído",
        boardId: "board-1",
        cardIds: ["card-2"],
        color: null,
      });
      seedBoard(queryClient, [targetColumn, otherColumn]);
      queryClient.setQueryData(column("col-1"), targetColumn);
      queryClient.setQueryData(column("col-2"), otherColumn);
      queryClient.setQueryData(card("card-1"), createCard({ id: "card-1", columnId: "col-1" }));
      queryClient.setQueryData(card("card-2"), createCard({ id: "card-2", columnId: "col-2" }));
      const { result } = renderBoardHook(queryClient);

      result.current.removeColumnById("col-1", "board-1");

      expect(queryClient.getQueryData<BoardClient>(board("board-1"))?.columnIds).toEqual(["col-2"]);
      expect(queryClient.getQueryData<ColumnClient[]>(columnsBoard("board-1"))).toEqual([otherColumn]);
      expect(queryClient.getQueryData(column("col-1"))).toBeUndefined();
      expect(queryClient.getQueryData(card("card-1"))).toBeUndefined();
      expect(queryClient.getQueryData(column("col-2"))).toEqual(otherColumn);
      expect(queryClient.getQueryData(card("card-2"))).toBeDefined();
    });

    it("não altera o cache quando a coluna não existe", () => {
      const queryClient = createQueryClient();
      const existingColumn = createColumnClient({
        id: "col-1",
        title: "A fazer",
        boardId: "board-1",
        cardIds: [],
        color: null,
      });
      seedBoard(queryClient, [existingColumn]);
      const { result } = renderBoardHook(queryClient);

      result.current.removeColumnById("missing", "board-1");

      expect(queryClient.getQueryData<BoardClient>(board("board-1"))?.columnIds).toEqual(["col-1"]);
      expect(queryClient.getQueryData<ColumnClient[]>(columnsBoard("board-1"))).toEqual([existingColumn]);
    });
  });

  describe("removeColumnsById", () => {
    it("remove várias colunas existentes e ignora ids sem coluna no cache", () => {
      const queryClient = createQueryClient();
      const columns = ["col-1", "col-2"].map((id) => createColumnClient({
        id,
        title: id,
        boardId: "board-1",
        cardIds: [],
        color: null,
      }));
      seedBoard(queryClient, columns);
      for (const columnData of columns) {
        queryClient.setQueryData(column(columnData.id), columnData);
      }
      const { result } = renderBoardHook(queryClient);

      result.current.removeColumnsById(["col-1", "", "missing", "col-2"], "board-1");

      expect(queryClient.getQueryData<BoardClient>(board("board-1"))?.columnIds).toEqual([]);
      expect(queryClient.getQueryData<ColumnClient[]>(columnsBoard("board-1"))).toEqual([]);
      expect(queryClient.getQueryData(column("col-1"))).toBeUndefined();
      expect(queryClient.getQueryData(column("col-2"))).toBeUndefined();
    });

    it("não altera o cache quando a lista de ids está vazia", () => {
      const queryClient = createQueryClient();
      const existingColumn = createColumnClient({
        id: "col-1",
        title: "A fazer",
        boardId: "board-1",
        cardIds: [],
        color: null,
      });
      seedBoard(queryClient, [existingColumn]);
      queryClient.setQueryData(column("col-1"), existingColumn);
      const { result } = renderBoardHook(queryClient);

      result.current.removeColumnsById([], "board-1");

      expect(queryClient.getQueryData<BoardClient>(board("board-1"))?.columnIds).toEqual(["col-1"]);
      expect(queryClient.getQueryData<ColumnClient[]>(columnsBoard("board-1"))).toEqual([existingColumn]);
    });
  });
});
