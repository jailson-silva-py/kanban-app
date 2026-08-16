"use client";
import { screen, waitFor } from "@testing-library/react"
import InBox from "./InBox."
import { renderWithProviders } from "@/app/util/testImplementations"

vi.mock("@/actions/actions", () => {
  return {createCartForColumn: vi.fn()}
});

describe("Inbox component testing", () => {
  test("Possui o cabeçalho correto.", () => {
    renderWithProviders(<InBox></InBox>)
    const header = screen.getByRole("banner")
    const spanHeader = screen.getByText("Caixa de entrada")

    expect(header).toBeInTheDocument();
    expect(spanHeader).toBeInTheDocument();
  })

  test("Possui os componentes para renderizar os cartões e o de adicionar cartões", async () => {
    renderWithProviders(<InBox></InBox>)
    const addCardsBtn = screen.getByRole("generic", { name: "content-add-card-inbox" })
    waitFor(async () => {
      const listCardsContent = await screen.findByRole("generic", { name: "column-inbox" })
      expect(listCardsContent).toBeInTheDocument();

    })
    expect(addCardsBtn).toBeInTheDocument();
  })

})
