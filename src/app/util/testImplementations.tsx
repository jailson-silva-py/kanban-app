import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, RenderOptions, screen, waitFor  } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event";
import { board, column, inBoxCards } from "@/constrants/queryKeys";
import { BoardClient, ColumnClient, InBoxClient } from "@/types/clientDataTypes";
import { Card as CardType, ColumnSkeleton } from "@/types/dataTypes";


const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { gcTime: 0, retry: false }, // gcTime: 0 evita vazamento de cache entre testes
    },
  });
};

export const renderWithProviders = (children: React.ReactElement, queryClient?: QueryClient, options?:RenderOptions) => {
  return render(
    <QueryClientProvider client={queryClient ?? createQueryClient()}>
      {children}
    </QueryClientProvider>, {...options}
    );
};

export const createCard = (overrides: Partial<CardType> = {}): CardType => ({
  id: "card",
  columnId: "col-1",
  completed: false,
  position: 300,
  title: "Cartão maneiro",
  ...overrides,
});

export const createColumnClient = ({
  id,
  title,
  order = 100,
  boardId = "board-123",
  cards = [],
}: {
  id: string;
  title: string;
  order?: number;
  boardId?: string;
  cards?: CardType[];
}): ColumnClient => ({
  id,
  title,
  order,
  boardId,
  cards,
  cardsMap: new Map(cards.map((c) => [c.id, c])),
});

export const seedBoard = (
  queryClient: QueryClient,
  id: string,
  title: string,
  columns: ColumnSkeleton[],
) => {
  queryClient.setQueryData<BoardClient<ColumnSkeleton>>(board(id), {
    id,
    title,
    columns: new Map(columns.map((c) => [c.id, c])),
  });
};

export const seedColumn = (queryClient: QueryClient, columnData: ColumnClient) => {
  queryClient.setQueryData<ColumnClient>(column(columnData.id), columnData);
};

export const seedInBox = (
  queryClient: QueryClient,
  data: { id: string; cards: CardType[] },
) => {
  queryClient.setQueryData<InBoxClient>(inBoxCards, {
    id: data.id,
    cards: data.cards,
    cardsMap: new Map(data.cards.map((c) => [c.id, c])),
  });
};

export const selectBoardOption = async (user: UserEvent, label: string) => {
  const input = await screen.findByPlaceholderText("Pesquise um board...");
  await user.click(input);
  await user.click(screen.getByRole("button", { name: label }));
};

export const selectColumnOption = async (user: UserEvent, label: string) => {
  const input = await screen.findByPlaceholderText("Pesquise uma coluna...");
  await user.click(input);
  await user.click(screen.getByRole("button", { name: label }));
};

export const selectCardOption = async (user: UserEvent, value: string) => {
  const combobox = await screen.findByRole("combobox");
  await waitFor(() => {
    const values = Array.from(combobox.querySelectorAll("option")).map(
      (option) => (option as HTMLOptionElement).value,
    );
    expect(values).toContain(value);
  });
  await user.selectOptions(combobox, value);
};
