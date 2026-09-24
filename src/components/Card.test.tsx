import { QueryClient } from "@tanstack/react-query";
import { act } from "@testing-library/react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { card as cardKey, column } from "@/constrants/queryKeys";
import { renderWithProviders } from "@/app/util/testImplementations";
import { Card as CardType } from "@/types/dataTypes";
import { ColumnClient } from "@/types/clientDataTypes";
import * as cardActions from "@/actions/cardActions";
import Card from "../app/board/[id]/_components/Card";

const draggableConfigs: Array<Record<string, unknown>> = [];

vi.mock("@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter", () => ({
  draggable: vi.fn((config) => {
    draggableConfigs.push(config);
    return vi.fn();
  }),
}));

vi.mock("@/actions/cardActions", async () => {
  const actual = await vi.importActual<typeof import("@/actions/cardActions")>("@/actions/cardActions");
  return { ...actual, ChangeCompletedCard: vi.fn(), DeleteCard: vi.fn(), reOrderCardsFromColumns: vi.fn() };
});

const card: CardType = {
  id: "card-1",
  columnId: "col-1",
  completed: false,
  position: 300,
  title: "Cartão maneiro",
};

const createQueryClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
});

const createColumn = (cardIds = [card.id]): ColumnClient => ({
  id: "col-1", title: "Coluna Bacana", order: 100, boardId: "board-123", cardIds,
});

const seedCard = (queryClient: QueryClient, cardIds = [card.id]) => {
  queryClient.setQueryData(cardKey(card.id), card);
  queryClient.setQueryData(column(card.columnId), createColumn(cardIds));
};

const createCardList = (queryClient: QueryClient, cardIds = [card.id]) => {
  queryClient.setQueryData(column(card.columnId), createColumn(cardIds));
};

const renderCard = (queryClient: QueryClient) => {
  seedCard(queryClient);
  renderWithProviders(<Card id={card.id} index={0} />, queryClient);
};

describe("Card Component testing", () => {
  beforeEach(() => {
    draggableConfigs.length = 0;
    vi.mocked(cardActions.ChangeCompletedCard).mockResolvedValue({ ...card, completed: true });
    vi.mocked(cardActions.DeleteCard).mockResolvedValue(card);
    vi.mocked(cardActions.reOrderCardsFromColumns).mockResolvedValue({ reindexed: false, card });
  });

  it("renderiza o card salvo no cache e seus controles", async () => {
    const queryClient = createQueryClient();
    renderCard(queryClient);

    expect(screen.getByRole("listitem", { name: "card" })).toBeInTheDocument();
    expect(screen.getByText(card.title)).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "more-options" }));
    expect(screen.getByRole("button", { name: "delete-card-btn" })).toBeInTheDocument();
  });

  it("completa o card e altera o card individual no cache", async () => {
    const queryClient = createQueryClient();
    renderCard(queryClient);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "more-options" }));
    await user.click(screen.getByRole("button", { name: "completed-card-btn" }));

    await waitFor(() => expect(cardActions.ChangeCompletedCard).toHaveBeenCalledWith({ id: card.id }));
    expect(queryClient.getQueryData<CardType>(cardKey(card.id))?.completed).toBe(true);
  });

  it("remove o card do cache ao executar a exclusão", async () => {
    const queryClient = createQueryClient();
    renderCard(queryClient);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "more-options" }));
    await user.click(screen.getByRole("button", { name: "delete-card-btn" }));

    await waitFor(() => expect(cardActions.DeleteCard).toHaveBeenCalledWith({ id: card.id }));
    expect(queryClient.getQueryData<CardType>(cardKey(card.id))).toBeUndefined();
  });

  it("registra no draggable os dados do card e do índice atual", async () => {
    const queryClient = createQueryClient();
    const nextCard = { ...card, id: "card-2", position: 100 };
    queryClient.setQueryData(cardKey(card.id), card);
    queryClient.setQueryData(cardKey(nextCard.id), nextCard);
    createCardList(queryClient, [nextCard.id, card.id]);
    renderWithProviders(<Card id={card.id} index={0} />, queryClient);

    await waitFor(() => expect(draggableConfigs).toHaveLength(1));
    const getInitialData = draggableConfigs.at(-1)?.getInitialData as () => Record<string, unknown>;
    expect(getInitialData()).toEqual({ index: 0, cardId: card.id, columnId: card.columnId });
    expect(queryClient.getQueryData<CardType>(cardKey(card.id))?.position).toBe(card.position);
  });

  it("não chama a mutation quando o drop não possui alvo", async () => {
    const queryClient = createQueryClient();
    renderCard(queryClient);
    await waitFor(() => expect(draggableConfigs).toHaveLength(1));
    (draggableConfigs.at(-1)?.onDrop as (args: { location: { current: { dropTargets: [] } } }) => void)({
      location: { current: { dropTargets: [] } },
    });
    expect(cardActions.reOrderCardsFromColumns).not.toHaveBeenCalled();
  });
});
