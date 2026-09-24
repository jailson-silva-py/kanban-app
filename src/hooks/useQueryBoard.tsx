import { useQueryClient } from "@tanstack/react-query";
import { board, column as columnKey, columnsBoard, prefixKeysFromDynamic } from "@/constrants/queryKeys"
import { BoardClient, ColumnClient } from "@/types/clientDataTypes";
import { useParams } from "next/navigation";
import { BoardFull, Card } from "@/types/dataTypes";
import { useQueryColumn } from "./useQueryColumn";

/**
 * Lê e atualiza o board, suas colunas e os cards associados no cache.
 * As operações preservam a lista `columns-board` e removem os cards de uma
 * coluna excluída para evitar referências obsoletas no React Query.
 */
export function useQueryBoard() {
  const { queryClient, removeAllCardsFromColumn, removeCard } = useQueryColumn();

  const params = useParams<{ id: string }>();

  const createBoardClient = (boardData: BoardFull) => {
    const columnIdsBoard = boardData.columns.map(({ id }) => id);
    const boardClient: BoardClient = { id: boardData.id, title: boardData.title, columnIds: columnIdsBoard }
    return boardClient
  }
  const createColumnsPlaceholder = (boardData: BoardFull) => {
    const columns = boardData.columns
    console.log(boardData.columns)
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i]
      queryClient.setQueryData<ColumnClient>(columnKey(column.id), { ...column, boardId: boardData.id, cardIds: [] })
    }

  }
  const getAllColumnsBoard = (boardId: string) => {
    const boardData = queryClient.getQueryData<BoardClient>(board(boardId));
    if (!boardData) return null;

    const columnsBoardData = queryClient.getQueryData<ColumnClient[]>(columnsBoard(boardId)) || null;


    return columnsBoardData;
  }

  const setBoard = (boardData: Partial<BoardClient>) => {
    if (!params.id) return;
    queryClient.setQueryData<BoardClient>(board(params.id), (old) => {
      if (!old) return;
      return { ...old, ...boardData };
    });
  }
  const createColumn = (columnData: ColumnClient) => {
    const boardData = queryClient.getQueryData<BoardClient>(board(columnData.boardId));
    if (!boardData) return;
    const columnIdInBoardData = boardData.columnIds.includes(columnData.id)
    if (!columnIdInBoardData) {
      const columnIds = [...boardData.columnIds, columnData.id];
      setBoard({ columnIds });
      queryClient.setQueryData<ColumnClient[]>(columnsBoard(columnData.boardId), (old) => {
        if (!old) return;
        return [...old, columnData]
      });
    }
    queryClient.setQueryData(columnKey(columnData.id), { ...columnData });

  }
  const removeColumnById = (columnId: string, boardId: string) => {

    const column = queryClient.getQueryData<ColumnClient>(columnKey(columnId));
    if (!column) return;
    queryClient.setQueryData<BoardClient>(board(boardId), (old) => {
      if (!old) return;
      const columnIds = [...old.columnIds.filter((thisId) => columnId !== thisId)];
      return { ...old, columnIds };
    })
    queryClient.setQueryData<ColumnClient[]>(columnsBoard(boardId), (old) => {
      if (!old) return;
      return [...old.filter(({ id: thisId }) => thisId !== columnId)]
    })
    queryClient.removeQueries({ queryKey: columnKey(columnId), exact: true });

    removeAllCardsFromColumn(columnId)

  }

  const removeColumnsById = (columnIds: string[], boardId: string) => {
    for (let i = 0; i < columnIds.length; i++) {
      const id = columnIds[i]
      const column = queryClient.getQueryData<ColumnClient>(columnKey(id));
      if (!id || !column) continue;
      removeColumnById(id, boardId);
    }
  }

  return {
    queryClient,
    createBoardClient,
    createColumn,
    createColumnsPlaceholder,
    getAllColumnsBoard,
    setBoard,
    removeColumnById,
    removeColumnsById,

  };
}



