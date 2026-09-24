"use client";
import { getBoardById } from "@/actions/actions"
import { BoardClient } from "@/types/clientDataTypes";
import { BoardFull } from "@/types/dataTypes";
import { useQuery, UseQueryOptions, UseQueryResult } from "@tanstack/react-query"
import { useQueryBoard } from "./useQueryBoard";

export const useGetInitialBoard = (initialData: BoardFull, queryOptions?: Omit<UseQueryOptions<BoardClient | null>, 'queryKey' | 'queryFn'>): UseQueryResult<BoardClient | null, Error> => {
  const { createBoardClient } = useQueryBoard();
  const result = useQuery<BoardClient | null>({
    initialData: createBoardClient(initialData),
    queryKey: ['board', initialData.id],
    queryFn: async () => {
      const boardData = await getBoardById(initialData.id)
      if (!boardData) return null;
      const boardClient = createBoardClient(boardData);
      return boardClient satisfies BoardClient | null
    },
    ...queryOptions
  })

  return result

}
