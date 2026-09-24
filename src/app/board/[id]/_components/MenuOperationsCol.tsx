"use client";
import DropdownMenuWithDots from "@/components/DropdownMenuWithDots";
import LoadingSpinner from "@/components/LoadingSpinner";
import { board } from "@/constrants/queryKeys";
import { useMutationColumns } from "@/hooks/useMutationColumns";
import { useParams } from "next/navigation";

type BtnDeleteColumnProps = {
  columnId: string;
  boardId: string,
};

const MenuOperationsCol = ({ columnId, boardId }: BtnDeleteColumnProps) => {
  const params = useParams();
  const queryKey = board(params.id as string);

  const { mutate, isPending } = useMutationColumns();

  const onDeleteColumn = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate({ operation: "delete", columnId, boardId });
  };

  return (
    <DropdownMenuWithDots>
      <DropdownMenuWithDots.Item>
        <form onSubmit={onDeleteColumn}>
          <button
            aria-label="delete-column"
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

export default MenuOperationsCol;
