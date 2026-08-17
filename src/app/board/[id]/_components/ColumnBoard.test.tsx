import { renderWithProviders } from "@/app/util/testImplementations"
import ColumnBoard from "./ColumnBoard"
import { screen } from "@testing-library/dom";
import * as obj from "@/hooks/useGetColumn";

const spyCustomHook = vi.spyOn(obj, "useGetColumn");

describe("ColumnBoard Component testing", () => {
  test("Quando tiver o placeholder data e não tiver os dados reais mostra o CardsLoading ", async () => {
    renderWithProviders(<ColumnBoard boardId="board-123" id="col-1"></ColumnBoard>)
    await screen.findByRole("list", {name:"cards-loading"})
  })

  test("Quando possuir os dados, mostra o CardsContent corretamente!", async () => {

    renderWithProviders(<ColumnBoard boardId="board-123" id="col-1"></ColumnBoard>)
    const listCards = await screen.findByRole("list", { name: "cards-content" })
    expect(listCards).toBeInTheDocument();

  })

  test("Possui o botão de mudar o título da coluna, adicionar cartão e os cartões", async () => {
    renderWithProviders(<ColumnBoard boardId="board-123" id="col-1"></ColumnBoard>)
    const btnEdit = screen.getByRole("button", {name:"edit-title-column"})
    const addCardBtn = screen.getByRole("button", {name:"add-card"})
    const listCards = await screen.findByRole("list", { name: "cards-content" })
    expect(btnEdit).toBeInTheDocument();
    expect(addCardBtn).toBeInTheDocument();
    expect(listCards).toBeInTheDocument();
  })

  test("São passados os dados corretos pro Custom Hook useGetColumn.", async () => {

    renderWithProviders(<ColumnBoard boardId="board-123" id="col-1"></ColumnBoard>)
    expect(spyCustomHook).toHaveBeenCalledWith("col-1", "board-123")

  })
})
