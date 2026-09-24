"use client";
import { getColumnById } from "@/actions/actions";
import { useQuery, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { ColumnClient } from "@/types/clientDataTypes";
import { column } from "@/constrants/queryKeys";
import { useQueryColumn } from "./useQueryColumn";

/** Busca uma coluna, hidrata seus cards individuais e salva a versão reduzida no cache. */
export const useGetColumn = (columnId: string, boardId: string, queryOptions?: Omit<UseQueryOptions<ColumnClient | null>, 'queryKey' | 'queryFn'>): UseQueryResult<ColumnClient | null> => {

  const { getColumn, setColumn, createColumnClient, createCardsInitialData } = useQueryColumn();
  const initialData = getColumn(columnId);
  const result = useQuery({
    initialData,
    queryKey: column(columnId),
    queryFn: async () => {
      const columnData = await getColumnById(columnId, boardId);
      if (!columnData) {
        return null;
      }
      createCardsInitialData(columnData);
      const columnClient = createColumnClient(columnData);
      setColumn(columnId, columnClient);

      return columnClient
    },
    ...queryOptions,
  });

  return result

}
