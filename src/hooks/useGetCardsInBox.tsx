import { getColumnForInBoxUser } from "@/actions/actions";
import { arrayTransformToMap } from "@/app/util/arrayTransformToMap";
import { inBoxCards as queryKey } from "@/constrants/queryKeys";
import { InBoxClient } from "@/types/clientDataTypes";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

export function useGetCardsInBox(queryOptions?:UseQueryOptions<InBoxClient|null>) {

  return useQuery({
    queryKey,
    queryFn: async () => {

      const result = await getColumnForInBoxUser();
      if (!result) {
        return null;
      };
      const cardsMap = arrayTransformToMap(result.cards);
      return {...result, cards:cardsMap}

    },

     ...queryOptions

  })


}
