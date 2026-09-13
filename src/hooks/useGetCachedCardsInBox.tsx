import { getColumnForInBoxUser } from "@/actions/actions";
import { arrayTransformToMap } from "@/app/util/arrayTransformToMap";
import { inBoxCards as queryKey } from "@/constrants/queryKeys";
import { InBoxClient } from "@/types/clientDataTypes";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

export function useGetCachedCardsInBox(queryOptions?:UseQueryOptions<InBoxClient|null>) {

  return useQuery<InBoxClient|null>({
    ...queryOptions,
    queryFn: async () => {

      const result = await getColumnForInBoxUser();
      if (!result) {
        return null;
      };
      const cardsMap = arrayTransformToMap(result.cards);
      return {...result, cardsMap}

    },
    queryKey,
    enabled: false, gcTime: Infinity, staleTime: Infinity,
    ...queryOptions

  });


}
