"use client";
import { getColumnForInBoxUser } from "@/actions/actions";
import { inBoxCards as queryKey } from "@/constrants/queryKeys";
import { InBoxClient } from "@/types/clientDataTypes";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

export function useGetCachedCardsInBox(queryOptions?:UseQueryOptions<InBoxClient|null>) {

  return useQuery<InBoxClient | null>({
    ...queryOptions,
    queryFn: async () => {

      const result = await getColumnForInBoxUser();
      if (!result) {
        return null;
      };
      const cardIds = result.cards.map(({ id }) => id);
      return {...result, cardIds}
    },
    queryKey,
    enabled: false, gcTime: Infinity, staleTime: Infinity,
    ...queryOptions

  });


}
