import { createCartForColumn } from "@/actions/actions"
import { AddCartColumn } from "./AddCartColumnBtn"
import { onMutateFunction } from "@/app/util/mutations"
import { ColumnClient } from "@/types/clientDataTypes"
import { QueryClient } from "@tanstack/react-query"

vi.mock("@actions/action.ts", () => ({
  createCartForColumn: vi.fn(),
}))

vi.mock("@/app/util/mutations", () => ({
  onMutateFunction: vi.fn((context, queryKey, callbackSetData):{previousState:ColumnClient} => {
    return { previousState: { id: 'col-1', cards: [], cardsMap: new Map(), title: "coluna", order: 100, boardId: "board-1" } }
  })
}))

const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry:false },
  }})
}

const renderWithProviders = () => {

}

describe("AddCartColumnBtn testing", () => {
  test("Botão de adicionar cartão presente", () => {
    render(<AddCartColumn/>)
  })
})
