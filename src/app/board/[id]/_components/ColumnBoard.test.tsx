import { screen } from "@testing-library/react";
import { useGetColumn } from "@/hooks/useGetColumn";
import { renderWithProviders } from "@/app/util/testImplementations";
import ColumnBoard from "./ColumnBoard";

vi.mock("@/hooks/useGetColumn", () => ({ useGetColumn: vi.fn() }));

const mockUseGetColumn = vi.mocked(useGetColumn);
const columnData = {
  id: "col-1", title: "Coluna Bacana!", order: 100, boardId: "board-123", cardIds: ["card-1"],
};

describe("ColumnBoard Component testing", () => {
  beforeEach(() => {
    mockUseGetColumn.mockReturnValue({
      isLoading: false,
      isPlaceholderData: false,
      data: columnData,
    } as ReturnType<typeof useGetColumn>);
  });

  it("mostra o loading enquanto os dados reais estão indisponíveis", () => {
    mockUseGetColumn.mockReturnValueOnce({
      isLoading: false,
      isPlaceholderData: true,
      data: columnData,
    } as ReturnType<typeof useGetColumn>);

    renderWithProviders(<ColumnBoard id="col-1" />);
    expect(screen.getByRole("list", { name: "cards-loading" })).toBeInTheDocument();
  });

  it("renderiza os cartões a partir dos cardIds da coluna", () => {
    renderWithProviders(<ColumnBoard id="col-1" />);
    expect(screen.getByRole("list", { name: "cards-content" })).toBeInTheDocument();
  });

  it("renderiza os controles e passa os dados corretos ao hook", () => {
    renderWithProviders(<ColumnBoard id="col-1" />);
    expect(screen.getByRole("button", { name: "edit-title-column" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "add-card" })).toBeInTheDocument();
    expect(mockUseGetColumn).toHaveBeenCalledWith("col-1", "board-123");
  });
});
