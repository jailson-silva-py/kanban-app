import { renderWithProviders } from "@/app/util/testImplementations"
import MenuOperationsCol from "./MenuOperationsCol"
import { screen, waitFor } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import { DeleteColumn } from "@/actions/actions"

describe("BtnDeleteColumn Component testing", () => {
  test("Existe um botão para exibir o dropdown", async () => {
    renderWithProviders(<MenuOperationsCol columnId="col-1" />)
    const btnMoreOptions = screen.getByRole("button", { name: "more-options" })
    expect(btnMoreOptions).toBeInTheDocument();
  })
  test("Existe um botão de deletar a coluna", async () => {
    const user = userEvent.setup();
    renderWithProviders(<MenuOperationsCol columnId="col-1" />);
    const btnMoreOptions = screen.getByRole("button", { name: "more-options" });
    await user.click(btnMoreOptions);
    const btnDelete = screen.getByRole("button", { name: "delete-column" });
    expect(btnDelete).toBeInTheDocument();
  })

  test("Os dados são enviados corretamente para a Server Action ao deletar uma coluna", async () => {
    const deleteMockAction = vi.mocked(DeleteColumn)
    const user = userEvent.setup();
    renderWithProviders(<MenuOperationsCol columnId="col-1" />);
    const btnMoreOptions = screen.getByRole("button", { name: "more-options" });
    await user.click(btnMoreOptions);
    const btnDelete = screen.getByRole("button", { name: "delete-column" });
    expect(btnDelete).toBeInTheDocument();
    await user.click(btnDelete);
    await waitFor(() => {
      expect(deleteMockAction).toHaveBeenCalledWith({ id: "col-1" }, expect.objectContaining({ mutationKey:["column", "delete"]}))
    })
  })
})
