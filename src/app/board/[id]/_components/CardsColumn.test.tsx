import { render, screen } from "@testing-library/react"
import CardsColumn from "./CardsColumn"

describe("Cards Column testing Component", () => {
  const Component = () => <span aria-label="test-component">Legal demais</span>
  test("Renderiza o children corretamente", () => {
    render(<CardsColumn><Component /></CardsColumn>)
    const comp = screen.getByRole("generic", { name: "test-component" });
    expect(comp).toBeInTheDocument();
  })

  test("Tem display grid e duas linhas, uma com auto e outra com 1fr (pra não bugar o overflow do cardsContent)", () => {
    render(<CardsColumn><Component /></CardsColumn>)
    const container = screen.getByRole("generic", { name: "cards-column" })

    expect(container).toHaveClass("grid", "grid-rows-[auto_1fr]", "w-full", "h-full")

  })

})
