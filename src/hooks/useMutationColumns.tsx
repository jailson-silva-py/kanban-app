import { ChangeColumnTitle, createColumnFromBoard, deleteColumnById } from "@/actions/columnActions";
import { useMutation } from "@tanstack/react-query";
import { useQueryColumn } from "./useQueryColumn";
import { useQueryBoard } from "./useQueryBoard";
import { logger } from "@/app/util/logger";
import { toast } from "@/app/util/toast";


type MutationColumnsVariables = {

    operation: "delete",
    columnId: string,
    boardId: string,
    title?: string,

} | { operation: "create", title: string, columnId: string, boardId: string }
    | { operation: "edit-title", boardId?: string, title: string, columnId: string };

type MutationsReturn = ReturnType<typeof createColumnFromBoard> | ReturnType<typeof deleteColumnById> | ReturnType<typeof ChangeColumnTitle>;


export function useMutationColumns() {

    const { getColumn, setColumn } = useQueryColumn();
    const { createColumn, removeColumnById } = useQueryBoard();

    const props = useMutation({
        mutationFn: ({ operation, columnId, title, boardId }: MutationColumnsVariables): MutationsReturn => {
            if (operation === "create") {
                return createColumnFromBoard({ boardId, idColumn: columnId, titleColumn: title })
            }
            else if (operation === "delete") {
                return deleteColumnById({ id: columnId })

            } else if (operation === "edit-title") {

                return ChangeColumnTitle({ id: columnId, title });
            }
            throw new Error("Operação Inválida: Nenhuma ação será realizada com a coluna.!");

        },
        onMutate: async ({ operation, boardId, columnId, title }, context) => {

            const previousState = getColumn(columnId);
            if (operation === "delete") {

                removeColumnById(columnId, boardId);

            } else if (operation === "create") {

                createColumn({ boardId, id: columnId, cardIds: [], order: Infinity, title });

            } else if (operation === "edit-title") {

                setColumn(columnId, { title });
            }

            return { previousState }

        },
        onError: (error, { boardId, columnId, operation }, result) => {

            if (!result?.previousState) {
                logger.print("useMutationColumns -> onError", "error", "Impossível fazer backup dos dados sem o previousState");
                return;
            }

            if (operation === "create") {
                toast.error("Ocorreu um erro na criação da coluna. Tente novamente.");
                removeColumnById(columnId, boardId);
            } else if (operation === "delete") {
                toast.error("Houve um erro inesperado ao deletar a coluna desejada.");
                createColumn(result.previousState);
            }
        },

        onSuccess: (data, { boardId, columnId, operation, title }) => {

            if (operation === "create" && "order" in data) {
                setColumn(columnId, { order: data?.order as number });
            }

            if (operation === "edit-title") {
                setColumn(columnId, { title: data.title });
            }
            return;

        },
    })

    return props
}