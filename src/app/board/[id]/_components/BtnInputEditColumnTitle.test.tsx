import { renderWithProviders } from "@/app/util/testImplementations";
import { screen, waitFor } from "@testing-library/dom";
import BtnInputEditColumnTitle from "./BtnInputEditColumnTitle";
import userEvent from "@testing-library/user-event";
import { ChangeColumnTitle } from "@/actions/actions";

describe("BtnInputColumnTitle Component testing", () => {

  test("Possui o botão de editar o título", () => {
    renderWithProviders(
      <BtnInputEditColumnTitle
        columnId="col-1"
        columnTitle="Coluna bacana!"
        boardId="board-123"
      ><></></BtnInputEditColumnTitle>,
    );
    const btnEdit = screen.getByRole("button", { name: "edit-title-column" });
    expect(btnEdit).toBeInTheDocument();
  });

  test("Ao clicar em editar título, aparece os campos do formúlário corretamente.", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <BtnInputEditColumnTitle
        columnId="col-1"
        columnTitle="Coluna bacana!"
        boardId="board-123"
      ><></></BtnInputEditColumnTitle>,
    );
    const btnEdit = screen.getByRole("button", { name: "edit-title-column" });
    expect(btnEdit).toBeInTheDocument();
    await user.click(btnEdit);
    const textAreaTitle = screen.getByRole("textbox", { name: "title-column" });
    const submitChangeTitle = screen.getByRole("button", {
      name: "change-title-column",
    });

    expect(textAreaTitle).toBeInTheDocument();
    expect(submitChangeTitle).toBeInTheDocument();
  });

  test("Os dados são passados corretamente para a Server Action", async () => {
    const mockChangeTitleAction = vi.mocked(ChangeColumnTitle);
    const user = userEvent.setup();
    renderWithProviders(
      <BtnInputEditColumnTitle
        columnId="col-1"
        columnTitle="Coluna bacana!"
        boardId="board-123"
      ><></></BtnInputEditColumnTitle>,
    );
    const btnEdit = screen.getByRole("button", { name: "edit-title-column" });

    expect(btnEdit).toBeInTheDocument();

    await user.click(btnEdit);
    const textAreaTitle = screen.getByRole("textbox", { name: "title-column" });
    const submitChangeTitle = screen.getByRole("button", {
      name: "change-title-column",
    });
    const title = "Uma coluna legalzinha";

    await user.clear(textAreaTitle);
    await user.type(textAreaTitle, title);
    await user.click(submitChangeTitle);

    await waitFor(async () =>
      expect(mockChangeTitleAction).toHaveBeenCalledWith(
        { id: "col-1", title },
        expect.objectContaining({
          mutationKey: ["column", "change-title"],
        }),
      ),
    );
  });

})
