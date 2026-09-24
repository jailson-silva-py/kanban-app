"use client";
import { skipToken, useQuery, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { card } from "@/constrants/queryKeys";
import { Card } from "@/types/dataTypes";
import { useQueryCard } from "./useQueryCard";

/** Retorna um card do cache individual; não dispara uma nova busca quando ele ainda não existe. */
export const useGetCard = (cardId: string, queryOptions?: Omit<UseQueryOptions<Card | null>, 'queryKey' | 'queryFn'>): UseQueryResult<Card | null> => {

    const { getCard } = useQueryCard();
    const initialData = getCard(cardId);

    const result = useQuery({
        initialData,
        queryKey: card(cardId),
        queryFn: skipToken,
        staleTime: Infinity,
        ...queryOptions
    })
    return result


}
