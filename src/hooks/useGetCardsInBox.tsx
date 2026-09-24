"use client";
import { getColumnForInBoxUser } from "@/actions/actions";
import { inBoxCards as queryKey } from "@/constrants/queryKeys";
import { InBoxClient } from "@/types/clientDataTypes";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useQueryInBox } from "./useQueryInBox";

export function useGetCardsInBox(queryOptions?:UseQueryOptions<InBoxClient|null>) {
  const {createCardInBox, queryClient} = useQueryInBox()
  return useQuery({
    queryKey,
    queryFn: async () => {

      const result = await getColumnForInBoxUser();
      if (!result) {
        return null;
      };
      const { cards, ...data } = result;
      const cardIds = result.cards.map(({ id }) => id);
      queryClient.setQueryData(queryKey, { ...data, cardIds });
      for (let i = 0; i < cardIds.length; i++) {
        const card = cards[i];
        createCardInBox(card);
      }
      return {...data, cardIds}

    },
     ...queryOptions

  })


}
