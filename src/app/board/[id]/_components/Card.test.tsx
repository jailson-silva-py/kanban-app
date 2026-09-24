import { QueryClient } from "@tanstack/react-query";
import { act } from "@testing-library/react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { card as cardKey, column } from "@/constrants/queryKeys";
import { renderWithProviders } from "@/app/util/testImplementations";
import { Card as CardType } from "@/types/dataTypes";
import { ColumnClient } from "@/types/clientDataTypes";
import * as actions from "@/actions/cardActions";
import Card from "./Card";

const draggableConfigs: Array<Record<string, unknown>> = [];

vi.mock("@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter", () => ({
  draggable: vi.fn((config) => {
    draggableConfigs.push(config);
    return vi.fn();
  }),
}));

vi.mock("@/actions/cardActions", () => ({
  ChangeCompletedCard: vi.fn(),
  DeleteCard: vi.fn(),
  reOrderCardsFromColumns: vi.fn(),
  getCardById: vi.fn(),
}));


const card: CardType = {
  id: "card-1",
  columnId: "col-1",
  completed: false,
  position: 300,
  title: "Cartão maneiro",
};

const createQueryClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
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
    vi.mocked(actions.ChangeCompletedCard).mockResolvedValue({ ...card, completed: true });
    vi.mocked(actions.DeleteCard).mockResolvedValue(card);
    vi.mocked(actions.reOrderCardsFromColumns).mockResolvedValue({ reindexed: false, card });
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

    await waitFor(() => expect(actions.ChangeCompletedCard).toHaveBeenCalledWith({ id: card.id }));
    expect(queryClient.getQueryData<CardType>(cardKey(card.id))?.completed).toBe(true);
  });

  it("remove o card do cache ao executar a exclusão", async () => {
    const queryClient = createQueryClient();
    renderCard(queryClient);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "more-options" }));
    await user.click(screen.getByRole("button", { name: "delete-card-btn" }));

    await waitFor(() => expect(actions.DeleteCard).toHaveBeenCalledWith({ id: card.id }));
    expect(queryClient.getQueryData<CardType>(cardKey(card.id))).toBeUndefined();
  });

  it("faz o movimento pelo drag and drop com a posição calculada", async () => {
    const queryClient = createQueryClient();
    const nextCard = { ...card, id: "card-2", position: 100 };
    queryClient.setQueryData(cardKey(card.id), card);
    queryClient.setQueryData(cardKey(nextCard.id), nextCard);
    createCardList(queryClient, [nextCard.id, card.id]);
    renderWithProviders(<Card id={card.id} index={0} />, queryClient);

    await waitFor(() => expect(draggableConfigs).toHaveLength(1));
    const onDrop = draggableConfigs.at(-1)?.onDrop as (args: {
      location: { current: { dropTargets: Array<{ data: Record<string, unknown> }> } };
    }) => void;
    await act(async () => {
      onDrop({ location: { current: { dropTargets: [{ data: { columnId: "col-1", index: 0 } }] } } });
    });

    await waitFor(() => expect(actions.reOrderCardsFromColumns).toHaveBeenCalled());
    const [move] = vi.mocked(actions.reOrderCardsFromColumns).mock.calls.at(-1) ?? [];
    expect(move).toMatchObject({ cardId: card.id, columnTargetId: "col-1", positionCard: 200 });
    expect(queryClient.getQueryData<CardType>(cardKey(card.id))?.position).toBe(200);
  });

  it("não chama a mutation quando o drop não possui alvo", async () => {
    const queryClient = createQueryClient();
    renderCard(queryClient);
    await waitFor(() => expect(draggableConfigs).toHaveLength(1));
    (draggableConfigs.at(-1)?.onDrop as (args: { location: { current: { dropTargets: [] } } }) => void)({
      location: { current: { dropTargets: [] } },
    });
    expect(actions.reOrderCardsFromColumns).not.toHaveBeenCalled();
  });
});
