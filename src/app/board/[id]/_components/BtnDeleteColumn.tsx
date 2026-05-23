"use client";
import { DeleteColumn } from "@/actions/actions";
import { onMutateFunction } from "@/app/util/mutations";
import { toast } from "@/app/util/toast";
import DropdownMenuWithDots from "@/components/DropdownMenuWithDots";
import LoadingSpinner from "@/components/LoadingSpinner";
import { board } from "@/constrants/queryKeys";
import { BoardClient, ColumnClient } from "@/types/clientDataTypes";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";

type BtnDeleteColumnProps = {
  columnId: string;
};

const BtnDeleteColumn = ({ columnId }: BtnDeleteColumnProps) => {
  const params = useParams();
  const queryKey = board(params.id as string);
  const { isPending, mutate } = useMutation({
    mutationKey: ["column", "delete"],
    mutationFn: DeleteColumn,
    onMutate: async (variables, context) => {
      // context.client.cancelQueries({ queryKey });
      // const previusBoard =
      //   context.client.getQueryData<PromiseReturnType<typeof getBoardById>>(
      //     queryKey,
      //   );
      // if (!previusBoard) return;

      // const newColumns = previusBoard.columns.filter((c) => c.id !== columnId);
      // const newBoard = { ...previusBoard, columns: newColumns };

      // context.client.setQueryData(queryKey, newBoard);

      // return { previusBoard };
      return await onMutateFunction<BoardClient<ColumnClient>>(context, queryKey, (old) => {

        const oldColumns = old.columns
        oldColumns.delete(variables.id)
        const columns = new Map(oldColumns);
        return {...old, columns}

      })
    },

    onError: (error, variables, result, context) => {
      if (!result?.previousState) return;
      context.client.setQueryData(queryKey, result?.previousState);
    },
    onSuccess: () => {
      toast.success("Coluna deletada com sucesso!");
    },
  });

  const onDeleteColumn = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate({ id: columnId });
  };

  return (
    <DropdownMenuWithDots>
      <DropdownMenuWithDots.Item>
        <form onSubmit={onDeleteColumn}>
          <button
            disabled={isPending}
            type="submit"
            className="text-xs cursor-pointer w-full h-full p-1 flex items-center justify-center hover:bg-error/20 rounded-sm"
          >
            {!isPending ? <span>Deletar</span> : <LoadingSpinner />}
          </button>
        </form>
      </DropdownMenuWithDots.Item>
    </DropdownMenuWithDots>
  );
};

export default BtnDeleteColumn;
