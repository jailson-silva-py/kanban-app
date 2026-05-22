import { getColumnForInBoxUser } from "@/actions/actions";
import { arrayTransformToMap } from "@/app/util/arrayTransformToMap";
import { inBoxCards as queryKey } from "@/constrants/queryKeys";
import { CardsClient } from "@/types/clientDataTypes";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

export function useGetCachedCardsInBox(queryOptions?:UseQueryOptions<CardsClient>) {

  return useQuery<CardsClient>({
    ...queryOptions,
    queryFn: async () => {

      const result = await getColumnForInBoxUser();
      if (!result) {
        return new Map();
      };
      const cardsMap = arrayTransformToMap(result.cards);
      return cardsMap

    },
    queryKey,
    enabled: false, gcTime: Infinity, staleTime: Infinity,
    ...queryOptions

  });


}
