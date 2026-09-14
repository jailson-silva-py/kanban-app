import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useMutationCards } from "./useMutationCards";
import { ChangeCompletedCard, DeleteCard, reOrderCardsFromColumns } from "@/actions/cardActions";
import { column } from "@/constrants/queryKeys";
import { ColumnClient } from "@/types/clientDataTypes";
import { createCard, createColumnClient } from "@/app/util/testImplementations";

vi.mock("@/actions/cardActions", () => ({
  ChangeCompletedCard: vi.fn(),
  DeleteCard: vi.fn(),
  reOrderCardsFromColumns: vi.fn(),
}));

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false, gcTime: 0 },
    },
  });

const renderMutationHook = (
  queryClient: QueryClient,
  options: { card: ReturnType<typeof createCard>; cardsKey?: string[]; targetColMoveCardKey?: string[] },
) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useMutationCards(options), { wrapper });
};

describe("useMutationCards - mutationFn", () => {
  it("change-completed chama ChangeCompletedCard com o id do card", async () => {
    const queryClient = createQueryClient();
    const card = createCard();
    queryClient.setQueryData(column(card.columnId), createColumnClient({ id: card.columnId, title: "Col", cards: [card] }));

    const { result } = renderMutationHook(queryClient, { card });

    await result.current.mutateAsync({ operation: "change-completed" });

    expect(ChangeCompletedCard).toHaveBeenCalledWith({ id: card.id });
  });

  it("delete chama DeleteCard com o id do card", async () => {
    const queryClient = createQueryClient();
    const card = createCard();
    queryClient.setQueryData(column(card.columnId), createColumnClient({ id: card.columnId, title: "Col", cards: [card] }));

    const { result } = renderMutationHook(queryClient, { card });

    await result.current.mutateAsync({ operation: "delete" });

    expect(DeleteCard).toHaveBeenCalledWith({ id: card.id });
  });

  it("move chama reOrderCardsFromColumns com os dados do movimento", async () => {
    const queryClient = createQueryClient();
    const card = createCard();

    const { result } = renderMutationHook(queryClient, { card });

    await result.current.mutateAsync({
      operation: "move",
      cardId: card.id,
      columnTargetId: "col-2",
      positionCard: 150,
      prevCardId: "c",
      nextCardId: undefined,
    });

    expect(reOrderCardsFromColumns).toHaveBeenCalledWith({
      cardId: card.id,
      columnTargetId: "col-2",
      positionCard: 150,
      prevCardId: "c",
      nextCardId: undefined,
    });
  });
});

describe("useMutationCards - onMutate move", () => {
  it("move dentro da mesma coluna: atualiza posição e ordena descendentemente", async () => {
    const queryClient = createQueryClient();
    const cardA = createCard({ id: "a", position: 300 });
    const cardB = createCard({ id: "b", position: 200 });
    const colKey = column("col-1");
    queryClient.setQueryData(colKey, createColumnClient({ id: "col-1", title: "Col", cards: [cardA, cardB] }));

    const { result } = renderMutationHook(queryClient, { card: cardA, targetColMoveCardKey: colKey });

    await result.current.mutateAsync({
      operation: "move",
      cardId: "a",
      columnTargetId: "col-1",
      positionCard: 100,
      prevCardId: "b",
      nextCardId: undefined,
    });

    const data = queryClient.getQueryData<ColumnClient>(colKey);
    expect(data?.cards.map((c) => c.id)).toEqual(["b", "a"]);
    expect(data?.cardsMap.get("a")?.position).toBe(100);
  });

  it("move para outra coluna: adiciona o card à coluna destino e o remove da origem", async () => {
    const queryClient = createQueryClient();
    const cardA = createCard({ id: "a", position: 300 });
    const cardC = createCard({ id: "c", columnId: "col-2", position: 200 });
    const sourceKey = column("col-1");
    const targetKey = column("col-2");
    queryClient.setQueryData(sourceKey, createColumnClient({ id: "col-1", title: "Origen", cards: [cardA] }));
    queryClient.setQueryData(targetKey, createColumnClient({ id: "col-2", title: "Destino", cards: [cardC] }));

    const { result } = renderMutationHook(queryClient, { card: cardA, cardsKey: sourceKey, targetColMoveCardKey: targetKey });

    await result.current.mutateAsync({
      operation: "move",
      cardId: "a",
      columnTargetId: "col-2",
      positionCard: 150,
      prevCardId: "c",
      nextCardId: undefined,
    });

    const target = queryClient.getQueryData<ColumnClient>(targetKey);
    const source = queryClient.getQueryData<ColumnClient>(sourceKey);

    // destino: c (200) e a (150) ordenados desc
    expect(target?.cards.map((c) => c.id)).toEqual(["c", "a"]);
    expect(target?.cardsMap.get("a")?.columnId).toBe("col-2");
    expect(target?.cardsMap.get("a")?.position).toBe(150);

    // origem: sem o card a
    expect(source?.cards.map((c) => c.id)).toEqual([]);
    expect(source?.cardsMap.has("a")).toBe(false);
  });

  it("sem targetColMoveCardKey não faz mudanças otimistas no cache", async () => {
    const queryClient = createQueryClient();
    const cardA = createCard({ id: "a" });
    const colKey = column("col-1");
    queryClient.setQueryData(colKey, createColumnClient({ id: "col-1", title: "Col", cards: [cardA] }));

    const { result } = renderMutationHook(queryClient, { card: cardA, cardsKey: colKey });

    await result.current.mutateAsync({
      operation: "move",
      cardId: "a",
      columnTargetId: "col-2",
      positionCard: 100,
      prevCardId: undefined,
      nextCardId: undefined,
    });

    const data = queryClient.getQueryData<ColumnClient>(colKey);
    expect(data?.cards.map((c) => c.id)).toEqual(["a"]);
  });

  it("move para uma coluna sem dados em cache: não quebra e a coluna origem perde o card", async () => {
    const queryClient = createQueryClient();
    const cardA = createCard({ id: "a" });
    const sourceKey = column("col-1");
    const targetKey = column("col-2");
    queryClient.setQueryData(sourceKey, createColumnClient({ id: "col-1", title: "Origen", cards: [cardA] }));

    const { result } = renderMutationHook(queryClient, { card: cardA, cardsKey: sourceKey, targetColMoveCardKey: targetKey });

    await result.current.mutateAsync({
      operation: "move",
      cardId: "a",
      columnTargetId: "col-2",
      positionCard: 100,
      prevCardId: undefined,
      nextCardId: undefined,
    });

    const source = queryClient.getQueryData<ColumnClient>(sourceKey);
    expect(source?.cards.map((c) => c.id)).toEqual([]);
  });

  it("move a partir de uma coluna sem dados em cache: não quebra e a coluna destino fica igual", async () => {
    const queryClient = createQueryClient();
    const cardA = createCard({ id: "a" });
    const cardC = createCard({ id: "c", columnId: "col-2", position: 200 });
    const sourceKey = column("col-1");
    const targetKey = column("col-2");
    // a coluna origem NÃO está em cache
    queryClient.setQueryData(targetKey, createColumnClient({ id: "col-2", title: "Destino", cards: [cardC] }));

    const { result } = renderMutationHook(queryClient, { card: cardA, cardsKey: sourceKey, targetColMoveCardKey: targetKey });

    await result.current.mutateAsync({
      operation: "move",
      cardId: "a",
      columnTargetId: "col-2",
      positionCard: 100,
      prevCardId: undefined,
      nextCardId: undefined,
    });

    const target = queryClient.getQueryData<ColumnClient>(targetKey);
    expect(target?.cards.map((c) => c.id)).toEqual(["c"]);
  });

  it("move dentro da mesma coluna vazia: não quebra", async () => {
    const queryClient = createQueryClient();
    const cardA = createCard({ id: "a" });
    const colKey = column("col-1");
    queryClient.setQueryData(colKey, createColumnClient({ id: "col-1", title: "Col", cards: [] }));

    const { result } = renderMutationHook(queryClient, { card: cardA, cardsKey: colKey, targetColMoveCardKey: colKey });

    await result.current.mutateAsync({
      operation: "move",
      cardId: "a",
      columnTargetId: "col-1",
      positionCard: 100,
      prevCardId: undefined,
      nextCardId: undefined,
    });

    const data = queryClient.getQueryData<ColumnClient>(colKey);
    expect(data?.cards).toEqual([]);
  });
});

describe("useMutationCards - onMutate delete/change-completed", () => {
  it("delete remove o card de cards e cardsMap", async () => {
    const queryClient = createQueryClient();
    const cardA = createCard({ id: "a" });
    const cardB = createCard({ id: "b", position: 200 });
    const colKey = column("col-1");
    queryClient.setQueryData(colKey, createColumnClient({ id: "col-1", title: "Col", cards: [cardA, cardB] }));

    const { result } = renderMutationHook(queryClient, { card: cardA, cardsKey: colKey });

    await result.current.mutateAsync({ operation: "delete" });

    const data = queryClient.getQueryData<ColumnClient>(colKey);
    expect(data?.cards.map((c) => c.id)).toEqual(["b"]);
    expect(data?.cardsMap.has("a")).toBe(false);
  });

  it("change-completed alterna o estado completed em cards e cardsMap", async () => {
    const queryClient = createQueryClient();
    const cardA = createCard({ id: "a", completed: false });
    const colKey = column("col-1");
    queryClient.setQueryData(colKey, createColumnClient({ id: "col-1", title: "Col", cards: [cardA] }));

    const { result } = renderMutationHook(queryClient, { card: cardA, cardsKey: colKey });

    await result.current.mutateAsync({ operation: "change-completed" });

    const data = queryClient.getQueryData<ColumnClient>(colKey);
    expect(data?.cards[0].completed).toBe(true);
    expect(data?.cardsMap.get("a")?.completed).toBe(true);
  });

  it("change-completed com o card ausente do cache: não quebra", async () => {
    const queryClient = createQueryClient();
    const cardA = createCard({ id: "a" });
    const outroCard = createCard({ id: "outro", position: 200 });
    const colKey = column("col-1");
    queryClient.setQueryData(colKey, createColumnClient({ id: "col-1", title: "Col", cards: [outroCard] }));

    const { result } = renderMutationHook(queryClient, { card: cardA, cardsKey: colKey });

    await result.current.mutateAsync({ operation: "change-completed" });

    const data = queryClient.getQueryData<ColumnClient>(colKey);
    expect(data?.cards.map((c) => c.id)).toEqual(["outro"]);
  });

  it("delete sem coluna em cache: não quebra e executa a ação", async () => {
    const queryClient = createQueryClient();
    const cardA = createCard({ id: "a" });

    const { result } = renderMutationHook(queryClient, { card: cardA, cardsKey: column("col-1") });

    await result.current.mutateAsync({ operation: "delete" });

    expect(DeleteCard).toHaveBeenCalledWith({ id: "a" });
  });

  it("operação desconhecida no onMutate retorna o estado sem mudanças", async () => {
    const queryClient = createQueryClient();
    const cardA = createCard({ id: "a" });
    const colKey = column("col-1");
    queryClient.setQueryData(colKey, createColumnClient({ id: "col-1", title: "Col", cards: [cardA] }));

    const { result } = renderMutationHook(queryClient, { card: cardA, cardsKey: colKey });

    await result.current.mutateAsync({ operation: "unknown" } as never);

    const data = queryClient.getQueryData<ColumnClient>(colKey);
    expect(data?.cards.map((c) => c.id)).toEqual(["a"]);
  });
});

describe("useMutationCards - onSuccess", () => {
  it("change-completed bem-sucedido atualiza o cache com os dados do servidor", async () => {
    const queryClient = createQueryClient();
    const cardA = createCard({ id: "a", completed: false });
    const colKey = column("col-1");
    queryClient.setQueryData(colKey, createColumnClient({ id: "col-1", title: "Col", cards: [cardA] }));

    vi.mocked(ChangeCompletedCard).mockResolvedValue({
      id: "a",
      columnId: "col-1",
      completed: true,
      position: 300,
      title: "Cartão maneiro",
    });

    // sem cardsKey: o hook usa o fallback column(card.columnId)
    const { result } = renderMutationHook(queryClient, { card: cardA });

    await result.current.mutateAsync({ operation: "change-completed" });

    const data = queryClient.getQueryData<ColumnClient>(colKey);
    expect(data?.cardsMap.get("a")?.completed).toBe(true);
    expect(data?.cards.some((c) => c.id === "a")).toBe(true);
  });

  it("onSuccess não sobrescreve o cache se a resposta não trouxer id (p.ex. reindexed)", async () => {
    const queryClient = createQueryClient();
    const cardA = createCard({ id: "a", completed: false });
    const colKey = column("col-1");
    queryClient.setQueryData(colKey, createColumnClient({ id: "col-1", title: "Col", cards: [cardA] }));

    vi.mocked(ChangeCompletedCard).mockResolvedValue({ reindexed: true } as never);

    const { result } = renderMutationHook(queryClient, { card: cardA, cardsKey: colKey });

    await result.current.mutateAsync({ operation: "change-completed" });

    // mantém-se o estado otimista (completed true) sem ser sobrescrito pelo onSuccess
    const data = queryClient.getQueryData<ColumnClient>(colKey);
    expect(data?.cardsMap.get("a")?.completed).toBe(true);
  });

  it("onSuccess não sobrescreve o cache se a resposta for null", async () => {
    const queryClient = createQueryClient();
    const cardA = createCard({ id: "a", completed: false });
    const colKey = column("col-1");
    queryClient.setQueryData(colKey, createColumnClient({ id: "col-1", title: "Col", cards: [cardA] }));

    vi.mocked(ChangeCompletedCard).mockResolvedValue(null as never);

    const { result } = renderMutationHook(queryClient, { card: cardA, cardsKey: colKey });

    await result.current.mutateAsync({ operation: "change-completed" });

    const data = queryClient.getQueryData<ColumnClient>(colKey);
    expect(data?.cardsMap.get("a")?.completed).toBe(true);
  });

  it("onSuccess com um id distinto do card mutado não substitui o card em cards", async () => {
    const queryClient = createQueryClient();
    const cardA = createCard({ id: "a", completed: false });
    const colKey = column("col-1");
    queryClient.setQueryData(colKey, createColumnClient({ id: "col-1", title: "Col", cards: [cardA] }));

    vi.mocked(ChangeCompletedCard).mockResolvedValue({
      id: "otro-id",
      columnId: "col-1",
      completed: true,
      position: 300,
      title: "Otro",
    });

    const { result } = renderMutationHook(queryClient, { card: cardA, cardsKey: colKey });

    await result.current.mutateAsync({ operation: "change-completed" });

    const data = queryClient.getQueryData<ColumnClient>(colKey);
    expect(data?.cardsMap.get("otro-id")?.completed).toBe(true);
    expect(data?.cards.some((c) => c.id === "otro-id")).toBe(false);
  });
});

describe("useMutationCards - onError", () => {
  it("change-completed com erro restaura o cache ao estado prévio", async () => {
    const queryClient = createQueryClient();
    const cardA = createCard({ id: "a", completed: false });
    const colKey = column("col-1");
    queryClient.setQueryData(colKey, createColumnClient({ id: "col-1", title: "Col", cards: [cardA] }));

    vi.mocked(ChangeCompletedCard).mockRejectedValue(new Error("boom"));

    const { result } = renderMutationHook(queryClient, { card: cardA, cardsKey: colKey });

    await act(async () => {
      await expect(result.current.mutateAsync({ operation: "change-completed" })).rejects.toThrow("boom");
    });

    const data = queryClient.getQueryData<ColumnClient>(colKey);
    expect(data?.cards[0].completed).toBe(false);
    expect(data?.cardsMap.get("a")?.completed).toBe(false);
  });

  it("delete com erro restaura o card no cache", async () => {
    const queryClient = createQueryClient();
    const cardA = createCard({ id: "a" });
    const cardB = createCard({ id: "b", position: 200 });
    const colKey = column("col-1");
    queryClient.setQueryData(colKey, createColumnClient({ id: "col-1", title: "Col", cards: [cardA, cardB] }));

    vi.mocked(DeleteCard).mockRejectedValue(new Error("boom"));

    const { result } = renderMutationHook(queryClient, { card: cardA, cardsKey: colKey });

    await expect(result.current.mutateAsync({ operation: "delete" })).rejects.toThrow("boom");

    const data = queryClient.getQueryData<ColumnClient>(colKey);
    expect(data?.cards.map((c) => c.id)).toEqual(["a", "b"]);
    expect(data?.cardsMap.has("a")).toBe(true);
  });

  it("move com erro restaura as colunas origem e destino", async () => {
    const queryClient = createQueryClient();
    const cardA = createCard({ id: "a", position: 300 });
    const cardC = createCard({ id: "c", columnId: "col-2", position: 200 });
    const sourceKey = column("col-1");
    const targetKey = column("col-2");
    queryClient.setQueryData(sourceKey, createColumnClient({ id: "col-1", title: "Origen", cards: [cardA] }));
    queryClient.setQueryData(targetKey, createColumnClient({ id: "col-2", title: "Destino", cards: [cardC] }));

    vi.mocked(reOrderCardsFromColumns).mockRejectedValue(new Error("boom"));

    const { result } = renderMutationHook(queryClient, { card: cardA, cardsKey: sourceKey, targetColMoveCardKey: targetKey });

    await expect(
      result.current.mutateAsync({
        operation: "move",
        cardId: "a",
        columnTargetId: "col-2",
        positionCard: 150,
        prevCardId: "c",
        nextCardId: undefined,
      }),
    ).rejects.toThrow("boom");

    const source = queryClient.getQueryData<ColumnClient>(sourceKey);
    const target = queryClient.getQueryData<ColumnClient>(targetKey);
    expect(source?.cards.map((c) => c.id)).toEqual(["a"]);
    expect(target?.cards.map((c) => c.id)).toEqual(["c"]);
  });

  it("change-completed com erro e sem backup: não quebra e alterna o estado local completed", async () => {
    const queryClient = createQueryClient();
    const cardA = createCard({ id: "a", completed: false });
    vi.mocked(ChangeCompletedCard).mockRejectedValue(new Error("boom"));

    const { result } = renderMutationHook(queryClient, { card: cardA, cardsKey: column("col-1") });

    await act(async () => {
      await expect(result.current.mutateAsync({ operation: "change-completed" })).rejects.toThrow("boom");
    });

    await waitFor(() => {
      expect(result.current.completed).toBe(true);
    });
  });
});

describe("useMutationCards - valor de retorno", () => {
  it("expõe completed, setCompleted, openDialog, setOpenDialog e as props da mutação", () => {
    const queryClient = createQueryClient();
    const cardA = createCard({ id: "a" });

    const { result } = renderMutationHook(queryClient, { card: cardA });

    expect(result.current.completed).toBe(false);
    expect(typeof result.current.setCompleted).toBe("function");
    expect(result.current.openDialog).toBe(false);
    expect(typeof result.current.setOpenDialog).toBe("function");
    expect(typeof result.current.mutate).toBe("function");
    expect(typeof result.current.mutateAsync).toBe("function");
  });
});
