"use client";
import { createCartForColumn } from "@/actions/actions";
import { AddCartColumn } from "./AddCartColumnBtn";
import { ColumnClient } from "@/types/clientDataTypes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, describe, test, vi } from "vitest";

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { name: "Test User" } },
    status: "authenticated",
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/actions/actions", () => ({
  createCartForColumn: vi.fn(),
}));

vi.mock("@/app/util/mutations", () => ({
  onMutateFunction: vi.fn((context, queryKey, callbackSetData): { previousState: ColumnClient } => {
    return {
      previousState: {
        id: "col-1",
        cards: [],
        cardsMap: new Map(),
        title: "coluna",
        order: 100,
        boardId: "board-1",
      },
    };
  }),
}));

const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });
};

const renderWithProviders = (ui: React.JSX.Element) => {
  render(
    <QueryClientProvider client={createQueryClient()}>
      {ui}
    </QueryClientProvider>
  );
};

describe("AddCartColumnBtn testing", () => {
  test("Botão de adicionar cartão presente", () => {
    renderWithProviders(
      <AddCartColumn columnId="col-1" textForArea="Crie uma tarefa aqui">
        Adicionar
      </AddCartColumn>
    );
    const btnAddCart = screen.getByRole("button", { name: "add-cart" });
    expect(btnAddCart).toBeInTheDocument();
  });

  test("Quanto clickado em adicionar, um Formulário com todos os campos aparece", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <AddCartColumn columnId="col-1" textForArea="Crie uma tarefa aqui">
        Adicionar
      </AddCartColumn>
    );

    const btnAddCart = screen.getByRole("button", { name: "add-cart" });
    await user.click(btnAddCart);

    const textArea = screen.getByRole("textbox", { name: "title-cart" });
    const btnCreateCart = screen.getByRole("button", { name: "create-cart" });
    const btnCancelCreate = screen.getByRole("button", { name: "create-cancel" })

    expect(textArea).toBeInTheDocument();
    expect(btnCreateCart).toBeInTheDocument();
    expect(btnCancelCreate).toBeInTheDocument();

  })

  test("createCartFromColumn é chamado com os parâmetros corretos quando o formulário é enviado", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <AddCartColumn columnId="col-1" textForArea="Crie uma tarefa aqui">
        Adicionar
      </AddCartColumn>
    );

    const btnAddCart = screen.getByRole("button", { name: "add-cart" });
    await user.click(btnAddCart);

    const textArea = screen.getByRole("textbox", { name: "title-cart" });
    const btnCreateCart = screen.getByRole("button", { name: "create-cart" });
    const textoTitleCart = "Meu cart legal!";
    await user.type(textArea, textoTitleCart)
    await user.click(btnCreateCart);
    expect(createCartForColumn).toHaveBeenCalledWith({id:expect.any(String), title:textoTitleCart, columnId:"col-1"})

  })
});
