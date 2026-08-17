"use client";
import { createCartForColumnInBox } from "@/actions/actions";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, describe, test } from "vitest";
import { renderWithProviders } from "@/app/util/testImplementations";
import { AddCartInBox } from "./AddCardInBoxBtn";


describe("AddCartInBoxBtn Component testing", () => {
  test("Botão de adicionar cartão presente", () => {
    renderWithProviders(
      <AddCartInBox textForArea="Crie uma tarefa aqui">
        Adicionar
      </AddCartInBox>
    );
    const btnAddCart = screen.getByRole("button", { name: "add-card-inbox" });
    expect(btnAddCart).toBeInTheDocument();
  });

  test("Quanto clickado em adicionar, um Formulário com todos os campos aparece", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <AddCartInBox textForArea="Crie uma tarefa aqui">
        Adicionar
      </AddCartInBox>
    );

    const btnAddCart = screen.getByRole("button", { name: "add-card-inbox" });
    await user.click(btnAddCart);

    const textArea = screen.getByRole("textbox", { name: "title-card-inbox" });
    const btnCreateCart = screen.getByRole("button", { name: "create-card-inbox" });
    const btnCancelCreate = screen.getByRole("button", { name: "cancel-create-card-inbox" })

    expect(textArea).toBeInTheDocument();
    expect(btnCreateCart).toBeInTheDocument();
    expect(btnCancelCreate).toBeInTheDocument();

  })

  test("A server action é chamada com os parâmetros corretos quando o formulário é enviado", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <AddCartInBox textForArea="Crie uma tarefa aqui">
        Adicionar
      </AddCartInBox>
    );

    const btnAddCart = screen.getByRole("button", { name: "add-card-inbox" });
    await user.click(btnAddCart);

    const textArea = screen.getByRole("textbox", { name: "title-card-inbox" });
    const btnCreateCart = screen.getByRole("button", { name: "create-card-inbox" });
    const textoTitleCart = "Meu cart legal!";
    await user.type(textArea, textoTitleCart)
    await user.click(btnCreateCart);
    expect(createCartForColumnInBox).toHaveBeenCalledWith({id:expect.any(String), title:textoTitleCart})

  })
});
