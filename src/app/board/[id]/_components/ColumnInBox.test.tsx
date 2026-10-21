import { renderWithProviders } from "@/app/util/testImplementations"
import ColumnInBox from "./ColumnInBox"
import { screen } from "@testing-library/dom"
import { getColumnForInBoxUser } from "@/actions/actions"

describe("ColumnInBox Component Testing", () => {

  test("Aparece o loading inicial quando não tiver dados e loading for true", () => {
    renderWithProviders(<ColumnInBox></ColumnInBox>);
    const loading = screen.getByRole("list", { name: "cards-loading" });
    expect(loading).toBeInTheDocument();
  })


  test("Possui um CardsContent caso não der erro ou não esteja carregando", async () => {
    const mockAction = vi.mocked(getColumnForInBoxUser);
    mockAction.mockResolvedValue({ id: "col-1", cards: [{ columnId: "col-1", completed: false, id: "card", position: 100, title: "Oi", description: null }], title: "inBox", order: 100 })
    renderWithProviders(<ColumnInBox></ColumnInBox>);
    const cardsContent = await screen.findByRole("list", { name: "cards-content" });
    expect(cardsContent).toBeInTheDocument();

  })
})
