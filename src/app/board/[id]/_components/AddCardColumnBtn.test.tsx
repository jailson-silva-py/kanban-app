"use client";
import { createCartForColumn } from "@/actions/actions";
import { AddCartColumn } from "./AddCardColumnBtn";
import userEvent from "@testing-library/user-event";
import { expect, describe, test } from "vitest";
import { renderWithProviders } from "@/app/util/testImplementations";
import { screen } from "@testing-library/dom";


describe("AddCartColumnBtn Component testing", () => {
  test("Botão de adicionar cartão presente", () => {
    renderWithProviders(
      <AddCartColumn columnId="col-1" textForArea="Crie uma tarefa aqui">
        Adicionar
      </AddCartColumn>
    );
    const btnAddCart = screen.getByRole("button", { name: "add-card" });
    expect(btnAddCart).toBeInTheDocument();
  });

  test("Quanto clickado em adicionar, um Formulário com todos os campos aparece", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <AddCartColumn columnId="col-1" textForArea="Crie uma tarefa aqui">
        Adicionar
      </AddCartColumn>
    );

    const btnAddCart = screen.getByRole("button", { name: "add-card" });
    await user.click(btnAddCart);

    const textArea = screen.getByRole("textbox", { name: "title-card" });
    const btnCreateCart = screen.getByRole("button", { name: "create-card" });
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

    const btnAddCart = screen.getByRole("button", { name: "add-card" });
    await user.click(btnAddCart);

    const textArea = screen.getByRole("textbox", { name: "title-card" });
    const btnCreateCart = screen.getByRole("button", { name: "create-card" });
    const textoTitleCart = "Meu cart legal!";
    await user.type(textArea, textoTitleCart)
    await user.click(btnCreateCart);
    expect(createCartForColumn).toHaveBeenCalledWith({id:expect.any(String), title:textoTitleCart, columnId:"col-1"})

  })
});
