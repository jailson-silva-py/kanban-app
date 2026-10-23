import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { changeColorColumn } from "@/actions/columnActions";
import { toast } from "@/app/util/toast";
import { createColumnClient } from "@/app/util/testImplementations";
import { column } from "@/constrants/queryKeys";
import { ColumnClient } from "@/types/clientDataTypes";
import useMutationColumnChangeColor from "./useMutationColumnChangeColor";

vi.mock("@/actions/columnActions", () => ({
  changeColorColumn: vi.fn(),
}));

vi.mock("@/app/util/toast", () => ({
  toast: { error: vi.fn() },
}));

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false, gcTime: 0 },
    mutations: { retry: false },
  },
});

const renderMutation = (queryClient: QueryClient) => renderHook(
  () => useMutationColumnChangeColor(),
  {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  },
);

const seedColumn = (queryClient: QueryClient) => {
  const initialColumn = {
    ...createColumnClient({
      id: "column-1",
      title: "Em andamento",
      boardId: "board-1",
      cardIds: ["card-1"],
      color: null,
    }),
    color: "#ffffff",
  };
  queryClient.setQueryData(column(initialColumn.id), initialColumn);
  return initialColumn;
};

describe("useMutationColumnChangeColor - mutationFn", () => {
  it("chama a action com o id da coluna e a nova cor", async () => {
    const queryClient = createQueryClient();
    seedColumn(queryClient);
    vi.mocked(changeColorColumn).mockResolvedValue({ id: "column-1", color: "#123456" });
    const { result } = renderMutation(queryClient);

    await result.current.mutateAsync({ id: "column-1", color: "#123456" });

    expect(changeColorColumn).toHaveBeenCalledWith(
      expect.objectContaining({ id: "column-1", color: "#123456" }),
      expect.anything());
  });
});

describe("useMutationColumnChangeColor - atualização otimista", () => {
  it("atualiza a cor no cache sem alterar os outros dados da coluna", async () => {
    const queryClient = createQueryClient();
    const initialColumn = seedColumn(queryClient);
    vi.mocked(changeColorColumn).mockResolvedValue({ id: initialColumn.id, color: "#123456" });
    const cancelQueries = vi.spyOn(queryClient, "cancelQueries");
    const { result } = renderMutation(queryClient);

    await result.current.mutateAsync({ id: initialColumn.id, color: "#123456" });

    expect(cancelQueries).toHaveBeenCalledWith({ queryKey: column(initialColumn.id) });
    expect(queryClient.getQueryData<ColumnClient>(column(initialColumn.id))).toEqual({
      ...initialColumn,
      color: "#123456",
    });
  });
});

describe("useMutationColumnChangeColor - tratamento de erro", () => {
  it("restaura o cache anterior e exibe uma mensagem de erro quando a action falha", async () => {
    const queryClient = createQueryClient();
    const initialColumn = seedColumn(queryClient);
    vi.mocked(changeColorColumn).mockRejectedValue(new Error("Falha ao atualizar cor"));
    const { result } = renderMutation(queryClient);

    await expect(
      result.current.mutateAsync({ id: initialColumn.id, color: "#123456" }),
    ).rejects.toThrow("Falha ao atualizar cor");

    expect(queryClient.getQueryData<ColumnClient>(column(initialColumn.id))).toEqual(initialColumn);
    expect(toast.error).toHaveBeenCalledWith(
      "Não foi possível mudar a cor da coluna. Tente novamente!",
    );
  });

  it("exibe o erro sem alterar o cache quando a coluna não está armazenada", async () => {
    const queryClient = createQueryClient();
    vi.mocked(changeColorColumn).mockRejectedValue(new Error("Falha ao atualizar cor"));
    const { result } = renderMutation(queryClient);

    await expect(
      result.current.mutateAsync({ id: "missing-column", color: "#123456" }),
    ).rejects.toThrow("Falha ao atualizar cor");

    expect(queryClient.getQueryData(column("missing-column"))).toBeUndefined();
    expect(toast.error).toHaveBeenCalledWith(
      "Não foi possível mudar a cor da coluna. Tente novamente!",
    );
  });
});