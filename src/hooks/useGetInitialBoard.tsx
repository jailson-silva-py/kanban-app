import { getBoardById } from "@/actions/actions"
import { arrayTransformToMap } from "@/app/util/arrayTransformToMap"
import { BoardClient } from "@/types/clientDataTypes"
import { BoardFull, ColumnSkeleton } from "@/types/dataTypes"
import { useQuery, UseQueryOptions, UseQueryResult } from "@tanstack/react-query"

export const useGetInitialBoard = (initialData: BoardFull, queryOptions?: Omit<UseQueryOptions<BoardClient<ColumnSkeleton> | null>, 'queryKey' | 'queryFn'>): UseQueryResult<BoardClient<ColumnSkeleton> | null, Error> => {

  const getConvertedData = () => {
    const length = initialData.columns.length
    const map = new Map();
    for (let i = 0; i < length; ++i) {
      const column = initialData.columns[i]
      map.set(column.id, column)

    }
    return { id:initialData.id, title:initialData.title, columns:map } satisfies BoardClient<ColumnSkeleton>
  }

  const result = useQuery<BoardClient<ColumnSkeleton> | null>({
    initialData:getConvertedData(),
    queryKey: ['board', initialData.id],
    queryFn: async () => {
      const boardData = await getBoardById(initialData.id)
      if (!boardData) return null;

      const boardClient:BoardClient<ColumnSkeleton> = {id:boardData.id, title:boardData.title, columns:arrayTransformToMap<ColumnSkeleton>(boardData.columns) as  Map<string, ColumnSkeleton>}


      return boardClient satisfies  BoardClient<ColumnSkeleton>|null
    },
    ...queryOptions

  })


  return result

}
