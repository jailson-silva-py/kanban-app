import { getBoardById, getColumnById } from "@/actions/actions";
import {  useQuery, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import {  ColumnClient, ColumnsClient } from "@/types/clientDataTypes";
import { Card } from "@/generated/client";
import { arrayTransformToMap } from "@/app/util/arrayTransformToMap";
import { Column } from "@/types/dataTypes";

export const useGetColumn = (columnId: string, boardId: string, queryOptions?:Omit<UseQueryOptions<ColumnClient | null>, 'queryKey' | 'queryFn'>): UseQueryResult<ColumnClient|null> => {

  const { data: board, isLoading } = useQuery({ queryKey: ["board", boardId], queryFn: async () => getBoardById(boardId), enabled: false, gcTime: Infinity, staleTime: Infinity });


  const column = (board?.columns as ColumnsClient<Column> | undefined)?.get(columnId)

  const result = useQuery({
    placeholderData: {
      ...column, cards: new Map<string, Card>()
    } as ColumnClient,
    queryKey:['column', columnId],
    queryFn: async () => {
      const columnData = await getColumnById(columnId)

      if (!columnData) {
        return null;

      }

      const result: ColumnClient = {
        ...columnData,
        cards: arrayTransformToMap(columnData.cards),
      }

      return result
    },
    enabled: !isLoading,
    ...queryOptions,
  });

  return result

}
