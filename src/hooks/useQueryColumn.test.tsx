import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { card as cardKey, column, columnsBoard, inBoxCards } from "@/constrants/queryKeys";
import { ColumnClient } from "@/types/clientDataTypes";
import { Card as CardType } from "@/types/dataTypes";
import { createCard, createColumnClient } from "@/app/util/testImplementations";
import { useQueryColumn } from "./useQueryColumn";

const createQueryClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
});

const renderColumn = (queryClient: QueryClient) => renderHook(() => useQueryColumn(), {
  wrapper: ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  ),
});

const seedColumn = (queryClient: QueryClient, columnData: ColumnClient, cards: CardType[] = []) => {
  queryClient.setQueryData(column(columnData.id), columnData);
  queryClient.setQueryData(columnsBoard(columnData.boardId), [columnData]);
  for (let i = 0; i < cards.length; i++) {
    queryClient.setQueryData(cardKey(cards[i].id), cards[i]);
  }
};

describe("useQueryColumn", () => {
  it("retorna null para uma coluna inexistente", () => {
    const queryClient = createQueryClient();
    const { result } = renderColumn(queryClient);
    expect(result.current.getColumn("nao-existe")).toBeNull();
  });

  it("transforma a coluna do servidor em ColumnClient com cardIds", () => {
    const queryClient = createQueryClient();
    const card = createCard({ id: "card-1" });
    const { result } = renderColumn(queryClient);

    const columnClient = result.current.createColumnClient({
      id: "col-1", boardId: "board-123", title: "Coluna", order: 100, cards: [card],
    });

    expect(columnClient).toEqual({
      id: "col-1", boardId: "board-123", title: "Coluna", order: 100, cardIds: ["card-1"],
    });
  });

  it("hidrata os cards individuais e lê os cards de uma coluna na ordem dos cardIds", () => {
    const queryClient = createQueryClient();
    const cardA = createCard({ id: "a", position: 200 });
    const cardB = createCard({ id: "b", position: 100 });
    const { result } = renderColumn(queryClient);

    result.current.createCardsInitialData({
      id: "col-1", boardId: "board-123", title: "Coluna", order: 100, cards: [cardA, cardB],
    });
    seedColumn(
      queryClient,
      createColumnClient({ id: "col-1", title: "Coluna", boardId: "board-123", cardIds: ["a", "b"] }),
    );

    expect(queryClient.getQueryData(cardKey("a"))).toEqual(cardA);
    expect(result.current.getCardsFromColumn("col-1")?.map(({ id }) => id)).toEqual(["a", "b"]);
  });

  it("atualiza parcialmente uma coluna sem perder seus demais campos", () => {
    const queryClient = createQueryClient();
    const columnData = createColumnClient({ id: "col-1", title: "Antiga", boardId: "board-123", cardIds: [] });
    seedColumn(queryClient, columnData);
    const { result } = renderColumn(queryClient);

    result.current.setColumn("col-1", { title: "Nova" });

    expect(result.current.getColumn("col-1")).toEqual({ ...columnData, title: "Nova" });
  });

  it("cria o card no topo da coluna e sincroniza columns-board", () => {
    const queryClient = createQueryClient();
    seedColumn(queryClient, createColumnClient({ id: "col-1", title: "Coluna", boardId: "board-123", cardIds: ["b"] }));
    const { result } = renderColumn(queryClient);

    result.current.createCard("col-1", createCard({ id: "a" }));

    expect(result.current.getColumn("col-1")?.cardIds).toEqual(["a", "b"]);
    expect(queryClient.getQueryData<ColumnClient[]>(columnsBoard("board-123"))?.[0].cardIds).toEqual(["a", "b"]);
    expect(queryClient.getQueryData(cardKey("a"))).toBeDefined();
  });

  it("remove o card individual, da coluna e de columns-board", () => {
    const queryClient = createQueryClient();
    seedColumn(
      queryClient,
      createColumnClient({ id: "col-1", title: "Coluna", boardId: "board-123", cardIds: ["a", "b"] }),
      [createCard({ id: "a" }), createCard({ id: "b", position: 200 })],
    );
    const { result } = renderColumn(queryClient);

    result.current.removeCard("a", "col-1");

    expect(queryClient.getQueryData(cardKey("a"))).toBeUndefined();
    expect(result.current.getColumn("col-1")?.cardIds).toEqual(["b"]);
    expect(queryClient.getQueryData<ColumnClient[]>(columnsBoard("board-123"))?.[0].cardIds).toEqual(["b"]);
  });

  it("calcula a posição ao inserir entre dois cards", () => {
    const queryClient = createQueryClient();
    const top = createCard({ id: "top", position: 300 });
    const bottom = createCard({ id: "bottom", position: 100 });
    const columnData = createColumnClient({ id: "col-1", title: "Coluna", boardId: "board-123", cardIds: ["top", "bottom"] });
    seedColumn(queryClient, columnData, [top, bottom]);
    const { result } = renderColumn(queryClient);

    const moved = result.current.getMovedPositionCard(column("col-1"), 1);

    expect(moved).toEqual({ nextCardId: undefined, prevCardId: "top", position: 200 });
  });

  it("retorna a posição 100 ao soltar na primeira coluna vazia", () => {
    const queryClient = createQueryClient();
    seedColumn(queryClient, createColumnClient({ id: "col-1", title: "Coluna", boardId: "board-123", cardIds: [] }));
    const { result } = renderColumn(queryClient);

    expect(result.current.getMovedPositionCard(column("col-1"), 0)).toEqual({
      nextCardId: undefined, prevCardId: undefined, position: 100,
    });
  });

  it("retorna undefined quando a coluna alvo não existe no cache", () => {
    const queryClient = createQueryClient();
    const { result } = renderColumn(queryClient);
    expect(result.current.getMovedPositionCard(column("nao-existe"), 0)).toBeUndefined();
  });

  it("move o card para outra coluna atualizando card, colunas e columns-board", () => {
    const queryClient = createQueryClient();
    const card = createCard({ id: "a", columnId: "col-1", position: 300 });
    const source = createColumnClient({ id: "col-1", title: "Origem", boardId: "board-123", cardIds: ["a"] });
    const target = createColumnClient({ id: "col-2", title: "Destino", boardId: "board-123", cardIds: [] });
    queryClient.setQueryData(column(source.id), source);
    queryClient.setQueryData(column(target.id), target);
    queryClient.setQueryData(columnsBoard("board-123"), [source, target]);
    queryClient.setQueryData(cardKey("a"), card);
    const { result } = renderColumn(queryClient);

    result.current.computePositionCard(column("col-2"), column("col-1"), 0, 150, "a");

    expect(queryClient.getQueryData(cardKey("a"))).toMatchObject({ columnId: "col-2", position: 150 });
    expect(result.current.getColumn("col-1")?.cardIds).toEqual([]);
    expect(result.current.getColumn("col-2")?.cardIds).toEqual(["a"]);
    expect(queryClient.getQueryData<ColumnClient[]>(columnsBoard("board-123"))?.map(({ id, cardIds }) => ({ id, cardIds }))).toEqual([
      { id: "col-1", cardIds: [] }, { id: "col-2", cardIds: ["a"] },
    ]);
  });

  it("reordena o card dentro da mesma coluna sem duplicar o id", () => {
    const queryClient = createQueryClient();
    const card = createCard({ id: "a", columnId: "col-1", position: 300 });
    const columnData = createColumnClient({ id: "col-1", title: "Coluna", boardId: "board-123", cardIds: ["a", "b"] });
    seedColumn(queryClient, columnData, [card, createCard({ id: "b", position: 100 })]);
    const { result } = renderColumn(queryClient);

    result.current.computePositionCard(column("col-1"), column("col-1"), 0, 400, "a");

    const cardIds = result.current.getColumn("col-1")?.cardIds ?? [];
    expect(cardIds).toEqual(["a", "b"]);
    expect(cardIds.filter((id) => id === "a")).toHaveLength(1);
  });

  it("move um card do InBox usando a chave inBoxCards", () => {
    const queryClient = createQueryClient();
    const card = createCard({ id: "a", columnId: "inbox-col", position: 100 });
    queryClient.setQueryData(inBoxCards, { id: "inbox-col", order: 100, title: "InBox", cardIds: ["a"] });
    const target = createColumnClient({ id: "col-2", title: "Destino", boardId: "board-123", cardIds: [] });
    queryClient.setQueryData(column("col-2"), target);
    queryClient.setQueryData(columnsBoard("board-123"), [target]);
    queryClient.setQueryData(cardKey("a"), card);
    const { result } = renderColumn(queryClient);

    result.current.computePositionCard(column("col-2"), inBoxCards, 0, 50, "a");

    expect(queryClient.getQueryData(cardKey("a"))).toMatchObject({ columnId: "col-2", position: 50 });
    expect(queryClient.getQueryData<{ cardIds: string[] }>(inBoxCards)?.cardIds).toEqual([]);
    expect(result.current.getColumn("col-2")?.cardIds).toEqual(["a"]);
  });
});
