"use client";
import { getAllColumnsById } from "@/actions/actions";
import { useQuery, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { ColumnClient } from "@/types/clientDataTypes";
import { columnsBoard } from "@/constrants/queryKeys";
import { useQueryColumn } from "./useQueryColumn";
import { useQueryBoard } from "./useQueryBoard";

export const useGetAllColumnsBoard = (boardId: string, columnsIds: string[], queryOptions?: Omit<UseQueryOptions<ColumnClient[] | null>, 'queryKey' | 'queryFn'>): UseQueryResult<ColumnClient[] | null> => {

  const { createColumn, getAllColumnsBoard } = useQueryBoard();
  const { createColumnClient, createCardsInitialData } = useQueryColumn();
  const placeholderData = getAllColumnsBoard(boardId);
  const result = useQuery({
    placeholderData,
    queryKey: columnsBoard(boardId),
    queryFn: async () => {
      const data = await getAllColumnsById(columnsIds, boardId);
      const columnsClient: ColumnClient[] = data.map((column) => {

        const columnClient = createColumnClient(column)
        createCardsInitialData(column);
        createColumn(columnClient);
        return columnClient

      });
      return columnsClient
    },
    enabled: !!boardId && !!columnsIds,
    ...queryOptions,
  });

  return result

}
