import { QueryClient } from "@tanstack/react-query";
import type { MutationFunctionContext } from "@tanstack/react-query";
import { onMutateFunction } from "./mutations";
import { column, inBoxCards } from "@/constrants/queryKeys";
import { ColumnClient, InBoxClient } from "@/types/clientDataTypes";
import { Card as CardType } from "@/types/dataTypes";

const createCard = (overrides: Partial<CardType> = {}): CardType => ({
  id: "card",
  columnId: "col-1",
  completed: false,
  position: 300,
  title: "Cartão maneiro",
  ...overrides,
});

const createColumnClient = (id: string, cards: CardType[]): ColumnClient => ({
  id,
  title: `Coluna ${id}`,
  order: 100,
  boardId: "board-123",
  cards,
  cardsMap: new Map(cards.map((c) => [c.id, c])),
});

describe("onMutateFunction", () => {
  let queryClient: QueryClient;
  const colKey = column("col-1");

  const context = () =>
    ({ client: queryClient }) as unknown as MutationFunctionContext;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false, gcTime: 0 },
      },
    });
  });

  it("cancela as queries ativas da queryKey antes de mutar", async () => {
    queryClient.setQueryData(colKey, createColumnClient("col-1", [createCard()]));
    const spy = vi.spyOn(queryClient, "cancelQueries");

    await onMutateFunction<ColumnClient>(context(), colKey, (old) => old);

    expect(spy).toHaveBeenCalledWith({ queryKey: colKey });
  });

  it("retorna undefined e não muta o cache se não houver estado anterior", async () => {
    const setSpy = vi.spyOn(queryClient, "setQueryData");

    const result = await onMutateFunction<ColumnClient>(context(), colKey, (old) => old);

    expect(result).toBeUndefined();
    expect(setSpy).not.toHaveBeenCalled();
  });

  it("aplica o callback de transformação sobre o estado em cache", async () => {
    queryClient.setQueryData(colKey, createColumnClient("col-1", [createCard()]));

    await onMutateFunction<ColumnClient>(context(), colKey, (old) => ({
      ...old,
      title: "Novo título",
    }));

    expect(queryClient.getQueryData<ColumnClient>(colKey)?.title).toBe("Novo título");
  });

  it("retorna o backup do estado anterior como cópia (não a mesma referência)", async () => {
    const prev = createColumnClient("col-1", [createCard()]);
    queryClient.setQueryData(colKey, prev);

    const result = await onMutateFunction<ColumnClient>(context(), colKey, (old) => ({
      ...old,
      title: "X",
    }));

    expect(result?.previousState).toEqual(prev);
    expect(result?.previousState).not.toBe(prev);
  });

  it("funciona com outros tipos de dados (InBoxClient)", async () => {
    const inboxKey = inBoxCards;
    const card = createCard();
    queryClient.setQueryData<InBoxClient>(inboxKey, {
      id: "inbox-1",
      cards: [card],
      cardsMap: new Map([[card.id, card]]),
    });

    const result = await onMutateFunction<InBoxClient>(context(), inboxKey, (old) => ({
      ...old,
      cards: [],
      cardsMap: new Map(),
    }));

    expect(result?.previousState.id).toBe("inbox-1");
    expect(queryClient.getQueryData<InBoxClient>(inboxKey)?.cards).toEqual([]);
  });
});
