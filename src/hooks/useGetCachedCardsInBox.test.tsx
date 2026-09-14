import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { useGetCachedCardsInBox } from "./useGetCachedCardsInBox";
import { getColumnForInBoxUser } from "@/actions/actions";
import { inBoxCards } from "@/constrants/queryKeys";
import { InBoxClient } from "@/types/clientDataTypes";
import { Card as CardType } from "@/types/dataTypes";

const createCard = (overrides: Partial<CardType> = {}): CardType => ({
  id: "card",
  columnId: "col-1",
  completed: false,
  position: 100,
  title: "Cartão maneiro",
  ...overrides,
});

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false, gcTime: 0 },
    },
  });

const renderInBoxHook = (
  queryClient: QueryClient,
  options?: Parameters<typeof useGetCachedCardsInBox>[0],
) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useGetCachedCardsInBox(options), { wrapper });
};

describe("useGetCachedCardsInBox", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
  });

  it("por padrão a query está desabilitada (enabled: false) e não consulta a ação", () => {
    const { result } = renderInBoxHook(queryClient);

    expect(getColumnForInBoxUser).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it("retorna null quando o usuário não tem coluna InBox", async () => {
    vi.mocked(getColumnForInBoxUser).mockResolvedValue(null as never);

    const { result } = renderInBoxHook(queryClient, { queryKey: inBoxCards, enabled: true });

    await waitFor(() => {
      expect(result.current.data).toBeNull();
    });
    expect(getColumnForInBoxUser).toHaveBeenCalledTimes(1);
  });

  it("transforma os cards em cardsMap e retorna o resultado completo", async () => {
    const cardA = createCard({ id: "a" });
    const cardB = createCard({ id: "b", position: 200 });
    vi.mocked(getColumnForInBoxUser).mockResolvedValue({ id: "inbox-1", cards: [cardA, cardB] });

    const { result } = renderInBoxHook(queryClient, { queryKey: inBoxCards, enabled: true });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    const data = result.current.data;
    expect(data?.id).toBe("inbox-1");
    expect(data?.cards).toEqual([cardA, cardB]);
    expect(data?.cardsMap.get("a")).toEqual(cardA);
    expect(data?.cardsMap.get("b")).toEqual(cardB);
  });

  it("queryOptions podem sobrescrever o queryKey", async () => {
    vi.mocked(getColumnForInBoxUser).mockResolvedValue({ id: "inbox-1", cards: [] });

    const customKey = ["custom-inbox"];
    renderInBoxHook(queryClient, { queryKey: customKey, enabled: true });

    await waitFor(() => {
      expect(queryClient.getQueryData<InBoxClient>(customKey)).not.toBeNull();
    });

    expect(queryClient.getQueryData<InBoxClient>(customKey)?.id).toBe("inbox-1");
    expect(queryClient.getQueryData<InBoxClient>(inBoxCards)).toBeUndefined();
  });

  it("queryOptions podem sobrescrever o queryFn", async () => {
    const customData: InBoxClient = { id: "custom", cards: [], cardsMap: new Map() };

    const { result } = renderInBoxHook(queryClient, {
      queryKey: inBoxCards,
      enabled: true,
      queryFn: async () => customData,
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(customData);
    });
    expect(getColumnForInBoxUser).not.toHaveBeenCalled();
  });
});
