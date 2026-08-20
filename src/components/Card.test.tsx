import { renderWithProviders } from "@/app/util/testImplementations";
import Card from "./Card";
import { Card as CardType } from "@/types/dataTypes";
import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { ChangeCompletedCard } from "@/actions/actions";
import { QueryClient } from "@tanstack/react-query";
import { column } from "@/constrants/queryKeys";
import { ColumnClient } from "@/types/clientDataTypes";

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: { retry: false },
    queries: { retry: false },
  },
});

const card: CardType = {
  id: "card",
  columnId: "col-1",
  completed: false,
  position: 100,
  title: "Cartão maneiro",
};

beforeEach(() => {
  queryClient.setQueryData<ColumnClient>(column(card.columnId), () => {
    return {
      boardId: "board123",
      cardsMap: new Map().set(card.id, card),
      cards: [card],
      id: "card",
      order: 100,
      title:"Coluna Bacana"
    } satisfies ColumnClient

  })
})


describe("Card Component testing", () => {

  test("Card possui o Menu Flutuante com deletar e completar card junto com o checkbox completar", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Card card={card}></Card>, queryClient);
    const btnMenuDots = screen.getByRole("button", { name: "more-options" });
    const checkBoxCompleted = screen.getByRole("checkbox", {
      name: "checkbox-completed-card",
    });
    expect(btnMenuDots).toBeInTheDocument();
    expect(checkBoxCompleted).toBeInTheDocument();
    await user.click(btnMenuDots);
    const btnDeleteCard = screen.getByRole("button", {
      name: "delete-card-btn",
    });
    const btnCompletedCard = screen.getByRole("button", {
      name: "completed-card-btn",
    });
    expect(btnDeleteCard).toBeInTheDocument();
    expect(btnCompletedCard).toBeInTheDocument();
  });

  test("Ao clickar no checkbox, é chamado a server action pra mudar o estado do completed com os dados corretos", async () => {
    const mockChangeCompletedAction = vi.mocked(ChangeCompletedCard);
    const user = userEvent.setup();
    renderWithProviders(<Card card={card}></Card>);
    const checkBoxCompleted = screen.getByRole("checkbox", {
      name: "checkbox-completed-card",
    });
    await user.click(checkBoxCompleted);
    const checkedSVG = screen.getByRole("img", { name: "completed-svg" });
    expect(checkedSVG).toBeInTheDocument();
    expect(mockChangeCompletedAction).toHaveBeenCalledWith({ id: card.id });
  });

  test("Ao clickar no checkbox, é mutado optimisticamente o card correto tanto no cardsMap quando em cards", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Card card={card}></Card>, queryClient);
    const checkBoxCompleted = screen.getByRole("checkbox", {
      name: "checkbox-completed-card",
    });
    await user.click(checkBoxCompleted);
    const columnData = queryClient.getQueryData<ColumnClient>(column(card.columnId));
    const mutateCard = columnData?.cards[columnData?.cards.findIndex(() => card.id)]
    const mutateCardFromMap = columnData?.cardsMap.get(card.id)
    expect(mutateCard?.completed).toBe(true);
    expect(mutateCardFromMap?.completed).toBe(true);
  });

  test("Ao mutar (pode ser marcar como completo ou deletar) e der erro, o estado atual do card é restaurado", async () => {
    const mockChangeCompletedCardAction = vi.mocked(ChangeCompletedCard);
    mockChangeCompletedCardAction.mockRejectedValueOnce(new Error());
    const user = userEvent.setup();
    renderWithProviders(<Card card={card}></Card>, queryClient);
    const checkBoxCompleted = screen.getByRole("checkbox", {
      name: "checkbox-completed-card",
    });
    await user.click(checkBoxCompleted);

    await waitFor(async () => {
      const columnData = queryClient.getQueryData<ColumnClient>(column(card.columnId));
      const mutateCard = columnData?.cards[columnData?.cards.findIndex(() => card.id)];
      const mutateCardFromMap = columnData?.cardsMap.get(card.id);
      expect(mutateCard?.completed).toBe(false);
      expect(mutateCardFromMap?.completed).toBe(false);

    });
  });

  test("Ao clickar em deletar, é atualizado os dados da coluna correta optimisticamente tanto no map quanto no array", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Card card={card}></Card>, queryClient)
    const menuDots = screen.getByRole("button", { name: "more-options" });
    await user.click(menuDots);
    const deleteBtn = screen.getByRole("button", { name: "delete-card-btn" });
    await user.click(deleteBtn);

    const columnData = queryClient.getQueryData<ColumnClient>(column(card.columnId));
    expect(columnData?.cards.some(c => c.id === card.id)).toBeDefined();

    //o card tem que sumir do cards e cardsMap da coluna em que está
    expect(columnData?.cards.includes(card)).toBe(false);
    expect(columnData?.cardsMap.has(card.id)).toBe(false);

  });
});
