import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, RenderOptions, screen, waitFor } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event";
import { board, card as cardKey, column, columnsBoard, inBoxCards } from "@/constrants/queryKeys";
import { ColumnClient, InBoxClient } from "@/types/clientDataTypes";
import { BoardFull, BoardSimple, Card as CardType, ColumnSkeleton } from "@/types/dataTypes";


const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { gcTime: 0, retry: false }, // gcTime: 0 evita vazamento de cache entre testes
    },
  });
};

export const renderWithProviders = (children: React.ReactElement, queryClient?: QueryClient, options?: RenderOptions) => {
  return render(
    <QueryClientProvider client={queryClient ?? createQueryClient()}>
      {children}
    </QueryClientProvider>, { ...options }
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
  cardIds = []
}: Omit<ColumnClient, "order"> & { order?: number }): ColumnClient => ({
  id,
  title,
  order,
  boardId,
  cardIds,
});

export const seedBoard = (
  queryClient: QueryClient,
  id: string,
  title: string,
  columns: ColumnSkeleton[],
) => {
  queryClient.setQueryData<BoardFull>(board(id), {
    id,
    title,
    columns,
  });
};

/**
 * Popula o cache como o Board faz ao montar: skeleton do board, lista
 * `columns-board` e o card individual de cada `cardIds`.
 */
export const seedBoardColumns = (
  queryClient: QueryClient,
  boardId: string,
  boardTitle: string,
  columns: ColumnClient[],
) => {
  seedBoard(
    queryClient,
    boardId,
    boardTitle,
    columns.map(({ id, title, order }) => ({ id, title, order })),
  );
  queryClient.setQueryData<ColumnClient[]>(columnsBoard(boardId), columns.map((column) => ({ ...column })));
  for (let i = 0; i < columns.length; i++) {
    const columnData = columns[i];
    queryClient.setQueryData<ColumnClient>(column(columnData.id), { ...columnData });
    for (let j = 0; j < columnData.cardIds.length; j++) {
      const card = queryClient.getQueryData<CardType>(cardKey(columnData.cardIds[j]));
      if (card) continue;
      queryClient.setQueryData<CardType>(cardKey(columnData.cardIds[j]), {
        id: columnData.cardIds[j],
        columnId: columnData.id,
        completed: false,
        position: (j + 1) * 100,
        title: columnData.cardIds[j],
      });
    }
  }
};

export const seedColumn = (queryClient: QueryClient, columnData: ColumnClient) => {
  seedColumnCardIds(queryClient, columnData);
  queryClient.setQueryData<ColumnClient>(column(columnData.id), { ...columnData });
};

/**
 * Garante que todo id de `cardIds` tenha um card individual no cache,
 * permitindo que hooks como `getCardsFromColumn` funcionem nos testes.
 */
export const seedColumnCardIds = (queryClient: QueryClient, columnData: ColumnClient) => {
  const boardId = columnData.boardId;
  const columns = queryClient.getQueryData<ColumnClient[]>(columnsBoard(boardId));
  if (columns) {
    queryClient.setQueryData<ColumnClient[]>(columnsBoard(boardId), (old) => {
      if (!old) return old;
      return old.map((thisColumn) => thisColumn.id === columnData.id
        ? { ...thisColumn, cardIds: [...columnData.cardIds] }
        : thisColumn);
    });
  }
  for (let i = 0; i < columnData.cardIds.length; i++) {
    const cardId = columnData.cardIds[i];
    const existingCard = queryClient.getQueryData<CardType>(cardKey(cardId));
    if (existingCard) continue;
    queryClient.setQueryData<CardType>(cardKey(cardId), {
      id: cardId,
      columnId: columnData.id,
      completed: false,
      position: (i + 1) * 100,
      title: cardId,
    });
  }
};

export const seedInBox = (
  queryClient: QueryClient,
  data: InBoxClient,
) => {
  queryClient.setQueryData<InBoxClient>(inBoxCards, { ...data });
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
