import { render, screen } from "@testing-library/react"
import CardsColumn from "./CardsColumn"

describe("Cards Column testing Component", () => {
  const Component = () => <span aria-label="test-component">Legal demais</span>
  test("Renderiza o children corretamente", () => {
    render(<CardsColumn><Component /></CardsColumn>)
    const comp = screen.getByRole("generic", { name: "test-component" });
    expect(comp).toBeInTheDocument();
  })

  test("Tem display flex em coluna e altura e largura de 100% do content", () => {
    render(<CardsColumn><Component /></CardsColumn>)
    const container = screen.getByRole("generic", { name: "cards-column" })

    expect(container).toHaveClass("flex", "flex-col", "w-full", "h-full")

  })

})
