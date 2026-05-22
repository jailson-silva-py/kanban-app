import { Column } from "@/types/dataTypes";
import { BoardClient, CardsClient, ColumnClient, InBoxClient } from "@/types/clientDataTypes";
import { ColumnSkeleton } from "@/types/dataTypes";
import { MutationFunctionContext } from "@tanstack/react-query";

export async function onMutateFunction
<A extends BoardClient<Column | ColumnSkeleton> | ColumnClient | CardsClient | InBoxClient>
(context: MutationFunctionContext,
queryKey: string[], callbackSetData: (old:A) => A, conditions?:boolean) {

  await context.client.cancelQueries({ queryKey });
  const previousState:A|undefined = context.client.getQueryData<A>(queryKey);
  if (!previousState || conditions) return;
  context.client.setQueryData(queryKey, (old: A) => {

    return callbackSetData(old)

  })

  return { previousState } as {previousState:A}

}
