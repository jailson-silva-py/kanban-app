import { renderWithProviders } from "@/app/util/testImplementations";
import { PainelMoveCardFor } from "./PainelMoveCardFor";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient } from "@tanstack/react-query";
import { card as cardKey, column, inBoxCards } from "@/constrants/queryKeys";
import { ColumnClient, InBoxClient } from "@/types/clientDataTypes";
import { Column } from "@/types/dataTypes";
import { getAllBoardFromUser } from "@/actions/boardActions";
import { getColumnById, getColumnForInBoxUser } from "@/actions/actions";
import { reOrderCardsFromColumns } from "@/actions/cardActions";
import { toast } from "@/app/util/toast";
import {
  createCard,
  seedBoardColumns,
  seedInBox,
  selectBoardOption,
  selectColumnOption,
  selectCardOption,
} from "@/app/util/testImplementations";

vi.mock("@/actions/boardActions", () => ({
  getAllBoardFromUser: vi.fn(),
}));

vi.mock("@/actions/cardActions", () => ({
  ChangeCompletedCard: vi.fn(),
  DeleteCard: vi.fn(),
  reOrderCardsFromColumns: vi.fn(),
}));

const mockGetAllBoardFromUser = vi.mocked(getAllBoardFromUser);
const mockGetColumnById = vi.mocked(getColumnById);
const mockGetColumnForInBoxUser = vi.mocked(getColumnForInBoxUser);
const mockReOrderCardsFromColumns = vi.mocked(reOrderCardsFromColumns);

let queryClient: QueryClient;

const card = createCard({ id: "card", columnId: "col-1", position: 300 });
const cardBelow = createCard({ id: "c1b", columnId: "col-1", position: 200, title: "Cartão abaixo" });
const sourceColumn: Column = {
  id: "col-1", boardId: "board-123", title: "Coluna Bacana", order: 100,
  cards: [card, cardBelow],
};
const targetColumn: Column = {
  id: "col-2", boardId: "board-123", title: "Coluna Chida", order: 200,
  cards: [
    createCard({ id: "c2a", columnId: "col-2", position: 300, title: "Topo" }),
    createCard({ id: "c2b", columnId: "col-2", position: 200, title: "Meio" }),
    createCard({ id: "c2c", columnId: "col-2", position: 100, title: "Fundo" }),
  ],
};

const seedCard = (cardData: ReturnType<typeof createCard>) =>
  queryClient.setQueryData(cardKey(cardData.id), cardData);

beforeEach(() => {
  queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false, gcTime: Infinity },
    },
  });

  mockGetAllBoardFromUser.mockResolvedValue([{ id: "board-123", title: "Board Legal", gradient: "gradient" }]);

  seedBoardColumns(queryClient, "board-123", "Board Legal", [
    { id: "col-1", title: "Coluna Bacana", order: 100, boardId: "board-123", cardIds: [card.id, cardBelow.id] },
    { id: "col-2", title: "Coluna Chida", order: 200, boardId: "board-123", cardIds: targetColumn.cards.map(({ id }) => id) },
  ]);

  seedCard(card);
  seedCard(cardBelow);
  targetColumn.cards.forEach(seedCard);

  mockGetColumnById.mockImplementation(async (columnId) =>
    columnId === "col-1" ? sourceColumn : targetColumn,
  );
  mockGetColumnForInBoxUser.mockResolvedValue(null as never);

  vi.spyOn(toast, "error").mockImplementation(() => { });
});

describe("PainelMoveCardFor Component testing", () => {
  test("Renderiza o select de boards e os placeholders de coluna e posição", async () => {
    renderWithProviders(<PainelMoveCardFor cardId={card.id} inBoxKey={column("col-1")} />, queryClient);

    const inputBoard = await screen.findByPlaceholderText("Pesquise um board...");
    expect(inputBoard).toBeInTheDocument();
    expect(screen.getByText("Pesquise uma coluna...")).toBeInTheDocument();
    expect(screen.getByText("Selecione a posição:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mover Card" })).toBeDisabled();
  });

  test("O botão Mover Card se habilita só quando board, coluna e card estão selecionados", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PainelMoveCardFor cardId={card.id} inBoxKey={column("col-1")} />, queryClient);

    await selectBoardOption(user, "Board Legal");
    expect(screen.getByRole("button", { name: "Mover Card" })).toBeDisabled();

    await selectColumnOption(user, "Coluna Chida");
    expect(screen.getByRole("button", { name: "Mover Card" })).toBeDisabled();

    await selectCardOption(user, "c2a");
    expect(screen.getByRole("button", { name: "Mover Card" })).toBeEnabled();
  });

  test("Permite buscar um board pelo texto dentro do CustomSelect", async () => {
    const user = userEvent.setup();
    mockGetAllBoardFromUser.mockResolvedValue([
      { id: "board-1", title: "Board Legal", gradient: "gradient" },
      { id: "board-2", title: "Proyecto Kanban", gradient: "gradient" },
    ]);
    renderWithProviders(<PainelMoveCardFor cardId={card.id} inBoxKey={column("col-1")} />, queryClient);

    const inputBoard = await screen.findByPlaceholderText("Pesquise um board...");
    await user.click(inputBoard);
    await user.type(inputBoard, "kanban");
    expect(screen.getByRole("button", { name: "Proyecto Kanban" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Board Legal" })).not.toBeInTheDocument();
  });

  test("Mover o card ao topo de outra coluna (positionCard = target.position + 100)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PainelMoveCardFor cardId={card.id} inBoxKey={column("col-1")} />, queryClient);

    await selectBoardOption(user, "Board Legal");
    await selectColumnOption(user, "Coluna Chida");
    await selectCardOption(user, "c2a");
    await user.click(screen.getByRole("button", { name: "Mover Card" }));

    await waitFor(() => {
      expect(mockReOrderCardsFromColumns).toHaveBeenCalledWith(expect.objectContaining({
        cardId: "card",
        columnTargetId: "col-2",
        positionCard: 400,
        nextCardId: "c2a",
        prevCardId: "c2b",
      }));
    });
  });

  test("Move o card ao fundo de outra coluna (positionCard = média com o último card)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PainelMoveCardFor cardId={card.id} inBoxKey={column("col-1")} />, queryClient);

    await selectBoardOption(user, "Board Legal");
    await selectColumnOption(user, "Coluna Chida");
    await selectCardOption(user, "c2c");
    await user.click(screen.getByRole("button", { name: "Mover Card" }));

    await waitFor(() => {
      expect(mockReOrderCardsFromColumns).toHaveBeenCalledWith(expect.objectContaining({
        cardId: "card",
        columnTargetId: "col-2",
        positionCard: 150,
        nextCardId: "c2c",
        prevCardId: "c2b",
      }));
    });
  });

  test("Move o card ao meio de outra coluna (positionCard = média entre prev e target)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PainelMoveCardFor cardId={card.id} inBoxKey={column("col-1")} />, queryClient);

    await selectBoardOption(user, "Board Legal");
    await selectColumnOption(user, "Coluna Chida");
    await selectCardOption(user, "c2b");
    await user.click(screen.getByRole("button", { name: "Mover Card" }));

    await waitFor(() => {
      expect(mockReOrderCardsFromColumns).toHaveBeenCalledWith(expect.objectContaining({
        cardId: "card",
        columnTargetId: "col-2",
        positionCard: 250,
        nextCardId: "c2b",
        prevCardId: "c2a",
      }));
    });
  });

  test("Move o card dentro da mesma coluna (abaixo do card atual)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PainelMoveCardFor cardId={card.id} inBoxKey={column("col-1")} />, queryClient);

    await selectBoardOption(user, "Board Legal");
    await selectColumnOption(user, "Coluna Bacana");
    await selectCardOption(user, "c1b");
    await user.click(screen.getByRole("button", { name: "Mover Card" }));

    await waitFor(() => {
      expect(mockReOrderCardsFromColumns).toHaveBeenCalledWith(expect.objectContaining({
        cardId: "card",
        columnTargetId: "col-1",
        positionCard: 100,
        nextCardId: undefined,
        prevCardId: "c1b",
      }));
    });
  });

  test("Mostra um toast de erro quando se seleciona a mesma posição do card", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PainelMoveCardFor cardId={card.id} inBoxKey={column("col-1")} />, queryClient);

    await selectBoardOption(user, "Board Legal");
    await selectColumnOption(user, "Coluna Bacana");
    await selectCardOption(user, "card");
    await user.click(screen.getByRole("button", { name: "Mover Card" }));

    expect(toast.error).toHaveBeenCalledWith("A posição atual do cartão é a mesma que a posição alvo.");
    expect(mockReOrderCardsFromColumns).not.toHaveBeenCalled();
  });

  test("Move o card ao InBox", async () => {
    const user = userEvent.setup();
    const inboxCard = createCard({ id: "card-inbox", columnId: "inbox-col", position: 100, title: "Card InBox" });
    mockGetColumnForInBoxUser.mockResolvedValue({ id: "inbox-col", cards: [inboxCard] } as never);
    seedInBox(queryClient, { id: "inbox-col", order: 100, title: "InBox", cardIds: [inboxCard.id] });
    queryClient.setQueryData(cardKey(inboxCard.id), inboxCard);
    renderWithProviders(<PainelMoveCardFor cardId={card.id} inBoxKey={column("col-1")} />, queryClient);

    await selectBoardOption(user, "Board Legal");
    await selectColumnOption(user, "InBox");
    await selectCardOption(user, "card-inbox");
    await user.click(screen.getByRole("button", { name: "Mover Card" }));

    await waitFor(() => {
      expect(mockReOrderCardsFromColumns).toHaveBeenCalledWith(expect.objectContaining({
        cardId: "card",
        columnTargetId: "inbox-col",
        positionCard: 100,
        nextCardId: "card-inbox",
        prevCardId: undefined,
      }));
    });
  });

  test("Atualiza o cache de forma otimista ao mover o card", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PainelMoveCardFor cardId={card.id} inBoxKey={column("col-1")} />, queryClient);

    await selectBoardOption(user, "Board Legal");
    await selectColumnOption(user, "Coluna Chida");
    await selectCardOption(user, "c2a");
    await user.click(screen.getByRole("button", { name: "Mover Card" }));

    await waitFor(() => {
      const source = queryClient.getQueryData<ColumnClient>(column("col-1"));
      expect(source?.cardIds.includes("card")).toBe(false);

      const target = queryClient.getQueryData<ColumnClient>(column("col-2"));
      expect(target?.cardIds.includes("card")).toBe(true);

      const moved = queryClient.getQueryData<ReturnType<typeof createCard>>(cardKey("card"));
      expect(moved?.position).toBe(400);
      expect(moved?.columnId).toBe("col-2");
    });
  });
});
