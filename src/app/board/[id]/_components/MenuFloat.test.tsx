import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import MenuFloat from "./MenuFloat";
import userEvent from "@testing-library/user-event";

describe("Menu Float Testing", () => {

  test('MenuFloat possui o botão Board', () => {
    render(<MenuFloat />);
    const btnBoard = screen.getByRole("button", {name:"board"})
    expect(btnBoard);
    expect(btnBoard).toHaveTextContent("Board");
  })

  test('MenuFloat possui o botão InBox', () => {
    render(<MenuFloat />);
    const btnInBox = screen.getByRole("button", {name:"inbox"})
    expect(btnInBox).toBeInTheDocument();
    expect(btnInBox).toHaveTextContent("InBox");
  })

  test('MenuFloat some quando clicado fora!', async () => {
    const user = userEvent.setup()
    render(<MenuFloat />);
    const menu = screen.getByRole("list", { name: "menu-float" });
    expect(menu).toBeInTheDocument();
    await user.click(document.body);
    expect(menu).not.toBeInTheDocument();
  })

  test('Botão para exibir MenuFloat aparece quando ele some!', async () => {
    const user = userEvent.setup()
    render(<MenuFloat />);
    const menu = screen.getByRole("list", { name: "menu-float" });
    await user.click(document.body);
    expect(menu).not.toBeInTheDocument();
    const btnShowMenu = screen.getByRole("button", { name: "show-menu" });
    expect(btnShowMenu).toBeInTheDocument();
  })

  test('Menu float reaparece quando há um click no btn show-menu', async () => {
    const user = userEvent.setup()
    render(<MenuFloat />);
    const menu = screen.getByRole("list", { name: "menu-float" });
    await user.click(document.body);
    expect(menu).not.toBeInTheDocument();
    const btnShowMenu = screen.getByRole("button", { name: "show-menu" });
    expect(btnShowMenu).toBeInTheDocument();
    await user.click(btnShowMenu);
    const newMenu = screen.getByRole("list", {name:"menu-float"})
    expect(newMenu).toBeInTheDocument();
  })
})
