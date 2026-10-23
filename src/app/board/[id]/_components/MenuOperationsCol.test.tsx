import { renderWithProviders, } from "@/app/util/testImplementations"
import { MenuOperationsCol } from "./MenuOperationsCol"
import { screen, waitFor } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import { deleteColumnById, changeColorColumn, ChangeColumnTitle } from "@/actions/columnActions"
import { QueryClient } from "@tanstack/react-query"
import { column } from "@/constrants/queryKeys"
import { ColumnClient } from "@/types/clientDataTypes"
import { act } from "@testing-library/react"

vi.mock("@/actions/columnActions", () => ({
  createColumnFromBoard: vi.fn(),
  deleteColumnById: vi.fn(),
  ChangeColumnTitle: vi.fn(),
  changeColorColumn: vi.fn(),
}));

const queryClient = new QueryClient();
const columnData = { boardId: "board-123", id: "col-1", cardIds: [], title: "Done", order: 100, color: "#ff0000" }
beforeEach(() => {


  queryClient.clear();
  queryClient.setQueryData
  queryClient.setQueryData<ColumnClient>(column("col-1"),
    columnData)
})


function renderMenu() {
  return renderWithProviders(<MenuOperationsCol columnId="col-1" boardId="board-123" />, queryClient)
}

describe("MenuOperationsCol", () => {
  test("Existe um botão para exibir o dropdown", async () => {
    renderMenu()
    const btnMoreOptions = screen.getByRole("button", { name: "more-options" })
    expect(btnMoreOptions).toBeInTheDocument();
  })

  describe("Botão de Deletar Coluna", () => {

    test("Existe um botão de deletar a coluna", async () => {
      const user = userEvent.setup();
      renderMenu();
      const btnMoreOptions = screen.getByRole("button", { name: "more-options" });
      await act(async () => {
        await user.click(btnMoreOptions);
      })
      const btnDelete = screen.getByRole("button", { name: "delete-column" });
      expect(btnDelete).toBeInTheDocument();
    })

    test("Ao clicar no botão de deletar a coluna, a coluna é deletada do cache", async () => {
      const user = userEvent.setup();
      renderMenu();
      const btnMoreOptions = screen.getByRole("button", { name: "more-options" });
      await act(async () => {
        await user.click(btnMoreOptions);
      })

      const btnDelete = screen.getByRole("button", { name: "delete-column" });
      expect(btnDelete).toBeInTheDocument();
      expect(queryClient.getQueryData(column("col-1"))).toMatchObject(columnData)
      await act(async () => {
        await user.click(btnDelete);
      })

      expect(queryClient.getQueryData(column("col-1"))).not.toBe(columnData);

    })


    test("Os dados são enviados corretamente para a Server Action ao deletar uma coluna", async () => {
      const deleteMockAction = vi.mocked(deleteColumnById)
      deleteMockAction.mockResolvedValueOnce({ id: "col-1", boardId: "board-123", title: "Coluna", order: 100, color: null });
      const user = userEvent.setup();
      renderMenu();
      const btnMoreOptions = screen.getByRole("button", { name: "more-options" });
      await act(async () => {
        await user.click(btnMoreOptions);
      })
      const btnDelete = screen.getByRole("button", { name: "delete-column" });
      expect(btnDelete).toBeInTheDocument();
      await act(async () => {
        await user.click(btnDelete);
      })

      await waitFor(() => {
        expect(deleteMockAction).toHaveBeenCalledWith({ id: "col-1" })
      })
    })

  })

  describe("Botão de mudar de cor da coluna", () => {

    test("Há o botão para mudar de cor da coluna no Menu", async () => {
      const user = userEvent.setup();
      renderMenu();

      const btnMoreOptions = screen.getByRole("button", { name: "more-options" });

      await user.click(btnMoreOptions);

      const btnChangeColor = screen.getByRole("button", { name: "btn-change-color" });
      expect(btnChangeColor).toBeInTheDocument();
    })

    test("Ao clicar no  botão pra mudar de cor da coluna, aparece um formulário", async () => {

      const user = userEvent.setup();
      renderMenu();

      const btnMoreOptions = screen.getByRole("button", { name: "more-options" });

      await user.click(btnMoreOptions);

      const btnChangeColor = screen.getByRole("button", { name: "btn-change-color" });
      expect(btnChangeColor).toBeInTheDocument();

      await user.click(btnChangeColor);

      const form = await screen.findByLabelText("form-change-color");

      expect(form).toBeInTheDocument();
      expect(form.tagName).toBe("FORM");

    })

    test("Chama o changeColumn Color quando o submit é clickado", async () => {

      const user = userEvent.setup();
      renderMenu();

      const btnMoreOptions = screen.getByRole("button", { name: "more-options" });

      await user.click(btnMoreOptions);

      const btnChangeColor = screen.getByRole("button", { name: "btn-change-color" });
      expect(btnChangeColor).toBeInTheDocument();

      await user.click(btnChangeColor);

      const btnSubmit = screen.getByLabelText("submit-change-color");
      await user.click(btnSubmit);

      expect(changeColorColumn).toHaveBeenCalledWith(
        expect.objectContaining({ id: columnData.id, color: columnData.color }),
        expect.anything()
      )
    })

    test("O botão de cancelar fecha o modal", async () => {

      const user = userEvent.setup();
      renderMenu();

      const btnMoreOptions = screen.getByRole("button", { name: "more-options" });

      await user.click(btnMoreOptions);

      const btnChangeColor = screen.getByRole("button", { name: "btn-change-color" });
      expect(btnChangeColor).toBeInTheDocument();

      await user.click(btnChangeColor);

      const cancelBtn = screen.getByLabelText("cancel-change-color");

      await user.click(cancelBtn);

      expect(screen.queryByLabelText("form-change-color")).not.toBeInTheDocument();

    })

  })
})
