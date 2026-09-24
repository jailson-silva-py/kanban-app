import { renderWithProviders } from "@/app/util/testImplementations"
import CreateColumnItemBtn from "./CreateColumn"
import { screen, waitFor } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import { createColumnFromBoard } from "@/actions/columnActions"

vi.mock("@/actions/columnActions", () => ({
  createColumnFromBoard: vi.fn(),
  deleteColumnById: vi.fn(),
  ChangeColumnTitle: vi.fn(),
}));

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

    const serverAction = vi.mocked(createColumnFromBoard);
    serverAction.mockResolvedValueOnce({ id: "col-nova", title: "Uma coluna legal", order: 100 });
    const user = userEvent.setup();
    renderWithProviders(<CreateColumnItemBtn></CreateColumnItemBtn>);
    const btnNewColumn = screen.getByRole("button", { name: "create-new-column" });
    await user.click(btnNewColumn);
    const titleColumn = screen.getByRole("textbox", { name: "title-column" });
    const submitForm = screen.getByRole("button", { name: "create-column" });

    expect(titleColumn).toBeInTheDocument();
    expect(submitForm).toBeInTheDocument();

    await user.type(titleColumn, "Uma coluna legal")
    await user.click(submitForm);
    await waitFor(() => {
      expect(serverAction).toHaveBeenCalledWith({
        boardId: "board-123",
        idColumn: expect.any(String),
        titleColumn: "Uma coluna legal",
      })
    })
  })

})
