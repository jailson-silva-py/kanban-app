import { renderWithProviders } from "@/app/util/testImplementations"
import CreateColumnItemBtn from "./CreateColumn"
import { screen, waitFor } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import { createColumnFromBoard } from "@/actions/actions"

describe("CreateColumn Component testing", () => {
  beforeAll(() => {
    vi.clearAllMocks();
  })
  test("Possui um botão para criar coluna", () => {
    renderWithProviders(<CreateColumnItemBtn></CreateColumnItemBtn>);
    const btnNewColumn = screen.getByRole("button", { name: "create-new-column" });
    expect(btnNewColumn).toBeInTheDocument();
  })

  test("Ao clicar em criar coluna, aparece os campos do formulário", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateColumnItemBtn></CreateColumnItemBtn>);
    const btnNewColumn = screen.getByRole("button", { name: "create-new-column" });
    await user.click(btnNewColumn);
    const titleColumn = screen.getByRole("textbox", { name: "title-column" });
    const submitForm = screen.getByRole("button", { name: "create-column" });

    expect(titleColumn).toBeInTheDocument();
    expect(submitForm).toBeInTheDocument();

  })

  test("Os dados são enviados com os valores corretos", async () => {

    const user = userEvent.setup();
    renderWithProviders(<CreateColumnItemBtn></CreateColumnItemBtn>);
    const btnNewColumn = screen.getByRole("button", { name: "create-new-column" });
    await user.click(btnNewColumn);
    const titleColumn = screen.getByRole("textbox", { name: "title-column" });
    const submitForm = screen.getByRole("button", { name: "create-column" });

    expect(titleColumn).toBeInTheDocument();
    expect(submitForm).toBeInTheDocument();

    const serverAction = vi.mocked(createColumnFromBoard);
    await user.type(titleColumn, "Uma coluna legal")
    await user.click(submitForm);
    await waitFor(async () => {
      expect(serverAction).toHaveBeenCalledWith({ boardId: "board-123", idColumn: expect.any(String), titleColumn: "Uma coluna legal" },
      expect.objectContaining({mutationKey:["column", "create"]}))
    })
  })

})
