import { BoardClient } from "@/types/clientDataTypes"
import { ColumnSkeleton } from "@/types/dataTypes";
import { useQuery, UseQueryOptions, UseQueryResult } from "@tanstack/react-query"

export const useGetCachedBoard = (boardId:string, queryOptions?:Omit<UseQueryOptions<BoardClient<ColumnSkeleton> | null>, 'queryKey' | 'queryFn'>): UseQueryResult<BoardClient<ColumnSkeleton> | null, Error> => {

  const result = useQuery({ queryKey: ["board", boardId], enabled:false, gcTime:Infinity, staleTime:Infinity, ...queryOptions});

  return result

}
