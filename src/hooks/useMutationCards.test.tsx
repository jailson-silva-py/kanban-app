import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { column, columnsBoard, card as cardKey } from "@/constrants/queryKeys";
import { createCard, createColumnClient } from "@/app/util/testImplementations";
import { ColumnClient } from "@/types/clientDataTypes";
import { ChangeCompletedCard, DeleteCard, reOrderCardsFromColumns } from "@/actions/cardActions";
import { useMutationCards } from "./useMutationCards";

vi.mock("@/actions/cardActions", () => ({
    ChangeCompletedCard: vi.fn(),
    DeleteCard: vi.fn(),
    reOrderCardsFromColumns: vi.fn(),
}));

const createQueryClient = () => new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
});

const renderMutation = (queryClient: QueryClient) => renderHook(() => useMutationCards(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
});

const seedCard = (queryClient: QueryClient, card = createCard()) => {
    queryClient.setQueryData(cardKey(card.id), card);
    queryClient.setQueryData(column(card.columnId), createColumnClient({
        id: card.columnId,
        title: "Coluna",
        boardId: "board-123",
        cardIds: [card.id],
    }));
    return card;
};

const seedBoardColumns = (queryClient: QueryClient, source: ColumnClient, target?: ColumnClient) => {
    queryClient.setQueryData(columnsBoard(source.boardId), target ? [source, target] : [source]);
    queryClient.setQueryData(column(source.id), source);
    if (target) queryClient.setQueryData(column(target.id), target);
};

describe("useMutationCards - mutationFn", () => {
    beforeEach(() => {
        vi.mocked(ChangeCompletedCard).mockResolvedValue(createCard({ completed: true }));
        vi.mocked(DeleteCard).mockResolvedValue(createCard());
        vi.mocked(reOrderCardsFromColumns).mockResolvedValue({ reindexed: false, card: createCard() });
    });

    it("chama a action correspondente para cada operação", async () => {
        const queryClient = createQueryClient();
        const card = seedCard(queryClient);
        const { result } = renderMutation(queryClient);

        await result.current.mutateAsync({ operation: "change-completed", cardId: card.id });
        await result.current.mutateAsync({ operation: "delete", cardId: card.id });
        await result.current.mutateAsync({
            operation: "move", cardId: card.id, columnTargetId: "col-2", positionCard: 150,
            prevCardId: "prev", nextCardId: undefined, targetIndex: 0,
        });

        expect(ChangeCompletedCard).toHaveBeenCalledWith({ id: card.id });
        expect(DeleteCard).toHaveBeenCalledWith({ id: card.id });
        expect(reOrderCardsFromColumns).toHaveBeenCalledWith({
            cardId: card.id, columnTargetId: "col-2", positionCard: 150,
            prevCardId: "prev", nextCardId: undefined,
        });
    });
});

describe("useMutationCards - onMutate", () => {
    it("alterna completed no cache individual e preserva a lista da coluna", async () => {
        const queryClient = createQueryClient();
        const card = seedCard(queryClient);
        const { result } = renderMutation(queryClient);

        await result.current.mutateAsync({ operation: "change-completed", cardId: card.id });

        expect(queryClient.getQueryData<typeof card>(cardKey(card.id))?.completed).toBe(true);
        expect(queryClient.getQueryData<ColumnClient>(column(card.columnId))?.cardIds).toEqual([card.id]);
    });

    it("remove o card individual e seu id da coluna ao excluir", async () => {
        const queryClient = createQueryClient();
        const card = seedCard(queryClient);
        const { result } = renderMutation(queryClient);

        await result.current.mutateAsync({ operation: "delete", cardId: card.id });

        expect(queryClient.getQueryData(cardKey(card.id))).toBeUndefined();
        expect(queryClient.getQueryData<ColumnClient>(column(card.columnId))?.cardIds).toEqual([]);
    });

    it("move o card entre colunas, atualiza posição e sincroniza columns-board", async () => {
        const queryClient = createQueryClient();
        const card = createCard({ id: "a", position: 300 });
        const source = createColumnClient({ id: "col-1", title: "Origem", boardId: "board-123", cardIds: [card.id] });
        const target = createColumnClient({ id: "col-2", title: "Destino", boardId: "board-123", cardIds: [] });
        queryClient.setQueryData(cardKey(card.id), card);
        seedBoardColumns(queryClient, source, target);
        const { result } = renderMutation(queryClient);

        await result.current.mutateAsync({
            operation: "move", cardId: card.id, columnTargetId: target.id,
            positionCard: 150, prevCardId: undefined, nextCardId: undefined, targetIndex: 0,
        });

        expect(queryClient.getQueryData<typeof card>(cardKey(card.id))).toMatchObject({ columnId: target.id, position: 150 });
        expect(queryClient.getQueryData<ColumnClient>(column(source.id))?.cardIds).toEqual([]);
        expect(queryClient.getQueryData<ColumnClient>(column(target.id))?.cardIds).toEqual([card.id]);
        expect(queryClient.getQueryData<ColumnClient[]>(columnsBoard("board-123"))?.map(({ id, cardIds }) => ({ id, cardIds }))).toEqual([
            { id: source.id, cardIds: [] }, { id: target.id, cardIds: [card.id] },
        ]);
    });
});

describe("useMutationCards - onSuccess e onError", () => {
    it("invalida a coluna quando a action informa reindexação", async () => {
        const queryClient = createQueryClient();
        const card = seedCard(queryClient);
        vi.mocked(reOrderCardsFromColumns).mockResolvedValueOnce({ reindexed: true, card });
        const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
        const { result } = renderMutation(queryClient);

        await result.current.mutateAsync({
            operation: "move", cardId: card.id, columnTargetId: card.columnId,
            positionCard: 200, prevCardId: undefined, nextCardId: undefined, targetIndex: 0,
        });

        expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: column(card.columnId) });
    });

    it("restaura a origem e o destino quando mover falha", async () => {
        const queryClient = createQueryClient();
        const card = createCard({ id: "a" });
        const source = createColumnClient({ id: "col-1", title: "Origem", boardId: "board-123", cardIds: [card.id] });
        const target = createColumnClient({ id: "col-2", title: "Destino", boardId: "board-123", cardIds: [] });
        queryClient.setQueryData(cardKey(card.id), card);
        seedBoardColumns(queryClient, source, target);
        vi.mocked(reOrderCardsFromColumns).mockRejectedValueOnce(new Error("falha"));
        const { result } = renderMutation(queryClient);

        await expect(result.current.mutateAsync({
            operation: "move", cardId: card.id, columnTargetId: target.id,
            positionCard: 150, prevCardId: undefined, nextCardId: undefined, targetIndex: 0,
        })).rejects.toThrow("falha");

        expect(queryClient.getQueryData<ColumnClient>(column(source.id))?.cardIds).toEqual([card.id]);
        expect(queryClient.getQueryData<ColumnClient>(column(target.id))?.cardIds).toEqual([]);
    });

    it("não falha antes da action quando o card não está no cache", async () => {
        const queryClient = createQueryClient();
        vi.mocked(ChangeCompletedCard).mockResolvedValueOnce(null as never);
        const { result } = renderMutation(queryClient);

        await act(async () => {
            await result.current.mutateAsync({ operation: "change-completed", cardId: "ausente" });
        });
        expect(ChangeCompletedCard).toHaveBeenCalledWith({ id: "ausente" });
    });
});
