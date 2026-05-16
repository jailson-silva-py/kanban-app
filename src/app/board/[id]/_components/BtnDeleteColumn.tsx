"use client";
import { DeleteColumn, type getBoardById } from "@/actions/actions";
import { toast } from "@/app/util/toast";
import DropdownMenuWithDots from "@/components/DropdownMenuWithDots";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useClientKeys } from "@/hooks/useClientKeys";
import { PromiseReturnType } from "@prisma/client/extension";
import { useMutation } from "@tanstack/react-query";

type BtnDeleteColumnProps = {
  columnId: string;
  boardId: string;
};

const BtnDeleteColumn = ({ columnId, boardId }: BtnDeleteColumnProps) => {
  const queryKey = useClientKeys().getBoardKey(boardId);
  const { isPending, mutate } = useMutation({
    mutationFn: DeleteColumn,
    onMutate: (variables, context) => {
      context.client.cancelQueries({ queryKey });
      const previusBoard =
        context.client.getQueryData<PromiseReturnType<typeof getBoardById>>(
          queryKey,
        );
      if (!previusBoard) return;

      const newColumns = previusBoard.columns.filter((c) => c.id !== columnId);
      const newBoard = { ...previusBoard, columns: newColumns };

      context.client.setQueryData(queryKey, newBoard);

      return { previusBoard };
    },

    onError: (error, variables, result, context) => {
      context.client.setQueryData(queryKey, result?.previusBoard);
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
            className="text-xs cursor-pointer w-full h-full p-1 flex items-center justify-center hover:bg-error/20 rounded-lg"
          >
            {!isPending ? <span>Deletar</span> : <LoadingSpinner />}
          </button>
        </form>
      </DropdownMenuWithDots.Item>
    </DropdownMenuWithDots>
  );
};

export default BtnDeleteColumn;
