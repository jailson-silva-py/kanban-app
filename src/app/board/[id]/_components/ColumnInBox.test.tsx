import { renderWithProviders } from "@/app/util/testImplementations"
import ColumnInBox from "./ColumnInBox"
import { screen, waitFor } from "@testing-library/dom"
import { getColumnForInBoxUser } from "@/actions/actions"

describe("ColumnInBox Component Testing", () => {

  test("Aparece o loading inicial quando não tiver dados e loading for true", () => {
    renderWithProviders(<ColumnInBox></ColumnInBox>);
    const loading = screen.getByRole("list", { name: "cards-loading" });
    expect(loading).toBeInTheDocument();
  })

  test("Quando não há nenhum cartão ou não há data aparece um parágrafo avisando que n tem cartão", async () => {
    const mockAction = vi.mocked(getColumnForInBoxUser);
    //quando a lista for vazia aparece o parágrafo
    mockAction.mockResolvedValue({ id: "col-1", cards: [] });
    renderWithProviders(<ColumnInBox></ColumnInBox>);
    const paragraph = await screen.findByRole("paragraph", { name: "no-cards" });
    expect(paragraph).toBeInTheDocument();
    //quando não tiver dados também aparece o parágrago
    mockAction.mockRejectedValue(undefined);
    const newParagraph = await screen.findByRole("paragraph", { name: "no-cards" });
    expect(newParagraph).toBeInTheDocument();

  })

  test("Quando há um erro, aparece uma mensagem de erro (correta)", async () => {
    const mockAction = vi.mocked(getColumnForInBoxUser);
    mockAction.mockThrow(new Error("Erro Personalizado"));
    renderWithProviders(<ColumnInBox></ColumnInBox>);
    await waitFor(async () => {
      const paragraph = await screen.findByRole("paragraph", { name: "error-cards" });
      expect(paragraph).toBeInTheDocument();
      expect(paragraph.textContent).contains("Erro Personalizado");
    })
  })

  test("Possui um CardsContent caso não der erro ou não esteja carregando", async () => {
    const mockAction = vi.mocked(getColumnForInBoxUser);
    mockAction.mockResolvedValue({id:"col-1", cards:[{columnId:"col-1", completed:false, id:"card", position:100, title:"Oi"}]})
    renderWithProviders(<ColumnInBox></ColumnInBox>);
    const cardsContent = await screen.findByRole("list", { name: "cards-content" });
    expect(cardsContent).toBeInTheDocument();

  })
})
