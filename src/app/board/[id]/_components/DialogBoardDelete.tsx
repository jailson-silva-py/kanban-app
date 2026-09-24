"use client";
import { deleteBoard } from "@/actions/actions";
import { toast } from "@/app/util/toast";
import { ButtonGhost } from "@/components/ButtonGhost";
import Dialog from "@/components/Dialog";
import LoadingSpinner from "@/components/LoadingSpinner";
import { boards } from "@/constrants/queryKeys";
import { BoardSimple } from "@/types/dataTypes";
import { useMutation } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { MouseEvent, SetStateAction } from "react";


type DialogBoardDelete = {
  id: string,
  openDialog: boolean,
  setOpenDialog: React.Dispatch<SetStateAction<boolean>>
}

export default function DialogBoardDelete({ id, openDialog, setOpenDialog }: DialogBoardDelete) {

  const { mutate, isPending } = useMutation({
    mutationFn: deleteBoard, mutationKey: ["board", "delete"],
    onSuccess: async (data, variables, result, context) => {
      const boardsList = context.client.getQueryData<BoardSimple[]>(boards);
      if (boardsList) {
        const newBoards = boardsList?.filter(board => board.id !== id);
        context.client.setQueryData<BoardSimple[]>(boards, [...newBoards]);
      }
      await context.client.invalidateQueries({ queryKey: boards });
    }

  })

  const handleDeleteBoard = (e: React.SubmitEvent) => {
    e.preventDefault();
    mutate({ id }, {
      onSuccess: () => {
        setOpenDialog(false);
        toast.success("Board deletado com sucesso!")
        redirect("/home");
      },
    });
  }

  const handleCloseDialog = (e: MouseEvent) => {
    e.preventDefault();
    setOpenDialog(false);
  }

  return (
    <Dialog state={openDialog} setState={setOpenDialog}>
      <div className="p-2 flex min-h-30 max-sm:min-h-40 flex-col gap-2">
        <p className="text-sm/tight tracking-widest hyphens-auto text-justify break-after-all ">
          Ao excluir o quadro, todas as colunas e cartões também serão <b>excluídos permanentemente</b>, deseja excluí-los?
        </p>
        <form onSubmit={handleDeleteBoard} className="mt-auto self-end flex gap-2 items-center justify-center">
          <button type="submit" className="flex btn-sm w-24 btn-secondary focus-primary items-center justify-center">
            {isPending ? <LoadingSpinner className="text-primary" /> : <span>Confirmar</span>}
          </button>
          <button className="btn-sm w-24 btn-primary focus-secondary items-center justify-center" onClick={handleCloseDialog}>
            Cancelar
          </button>
        </form>
      </div>
    </Dialog>

  )


}
