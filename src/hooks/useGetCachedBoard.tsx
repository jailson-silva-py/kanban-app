"use client";
import { BoardClient } from "@/types/clientDataTypes";
import { skipToken, useQuery, UseQueryOptions, UseQueryResult } from "@tanstack/react-query"

export const useGetCachedBoard = (boardId:string, queryOptions?:Omit<UseQueryOptions<BoardClient| null>, 'queryKey' | 'queryFn'>): UseQueryResult<BoardClient | null, Error> => {

  const result = useQuery({ queryKey: ["board", boardId], queryFn:skipToken, enabled:false, gcTime:Infinity, staleTime:Infinity, ...queryOptions});

  return result

}
