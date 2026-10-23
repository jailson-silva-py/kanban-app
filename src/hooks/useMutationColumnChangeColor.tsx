import { changeColorColumn } from "@/actions/columnActions";
import { useMutation } from "@tanstack/react-query";
import { useQueryColumn } from "./useQueryColumn";
import { column } from "@/constrants/queryKeys";
import { toast } from "@/app/util/toast";

export default function useMutationColumnChangeColor() {

  const { queryClient, setColumn, getColumn } = useQueryColumn();
  const props = useMutation({
    mutationFn: changeColorColumn,
    onMutate: async ({ color, id }) => {
      await queryClient.cancelQueries({ queryKey: column(id) });
      const previousState = getColumn(id);

      setColumn(id, { color });
      return { previousState }
    },

    onError: (error, { id }, result) => {
      toast.error("Não foi possível mudar a cor da coluna. Tente novamente!");
      if (!result?.previousState) return;
      setColumn(id, result.previousState)
    }
  })

  return props

}