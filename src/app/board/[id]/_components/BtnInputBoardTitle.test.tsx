import { renderWithProviders } from "@/app/util/testImplementations";
import BtnInputEditBoardTitle from "./BtnInputEditBoardTitle";
import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { changeBoardTitle } from "@/actions/actions";

describe("BtnInputBoardTitle Component testing", () => {
  test("Possui o botão de editar o título", () => {
    renderWithProviders(
      <BtnInputEditBoardTitle
        id="board-123"
        title="Um board legal"
      ></BtnInputEditBoardTitle>,
    );
    const btnEdit = screen.getByRole("button", { name: "edit-title-board" });
    expect(btnEdit).toBeInTheDocument();
  });

  test("Ao clicar em editar título, aparece os campos do formúlário corretamente.", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <BtnInputEditBoardTitle
        id="board-123"
        title="Um board legal"
      ></BtnInputEditBoardTitle>,
    );
    const btnEdit = screen.getByRole("button", { name: "edit-title-board" });
    expect(btnEdit).toBeInTheDocument();
    await user.click(btnEdit);
    const textAreaTitle = screen.getByRole("textbox", { name: "title-board" });
    const submitChangeTitle = screen.getByRole("button", {
      name: "change-title-board",
    });

    expect(textAreaTitle).toBeInTheDocument();
    expect(submitChangeTitle).toBeInTheDocument();
  });

  test("Os dados são passados corretamente para a Server Action", async () => {
    const mockChangeTitleAction = vi.mocked(changeBoardTitle);
    const user = userEvent.setup();
    renderWithProviders(
      <BtnInputEditBoardTitle
        id="board-123"
        title="Um board legal"
      ></BtnInputEditBoardTitle>,
    );
    const btnEdit = screen.getByRole("button", { name: "edit-title-board" });

    expect(btnEdit).toBeInTheDocument();

    await user.click(btnEdit);
    const textAreaTitle = screen.getByRole("textbox", { name: "title-board" });
    const submitChangeTitle = screen.getByRole("button", {
      name: "change-title-board",
    });
    const title = "Um board legalzinho";

    await user.clear(textAreaTitle);
    await user.type(textAreaTitle, title);
    await user.click(submitChangeTitle);

    await waitFor(async () =>
      expect(mockChangeTitleAction).toHaveBeenCalledWith(
        { id: "board-123", title },
        expect.objectContaining({
          mutationKey: ["board", "change-title"],
        }),
      ),
    );
  });
});
