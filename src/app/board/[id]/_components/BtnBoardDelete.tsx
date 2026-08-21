"use client";
import { deleteBoard } from "@/actions/actions";
import { toast } from "@/app/util/toast";
import Dialog from "@/components/Dialog";
import LoadingSpinner from "@/components/LoadingSpinner";
import { boards } from "@/constrants/queryKeys";
import { BoardSimple } from "@/types/dataTypes";
import { useMutation } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { MouseEvent, useState } from "react";

export default function BtnBoardDelete({ id }: { id: string }) {
  const [openDialog, setOpenDialog] = useState(false);
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

  const handleDeleteBoard = (e:React.SubmitEvent) => {
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
  const handleOpenDialog = (e: MouseEvent) => {
    e.preventDefault();
    setOpenDialog(true);
  }

  return (
      <>
      <button onClick={handleOpenDialog} className="w-full btn-sm btn-ghost items-center justify-center hover:bg-error/20" disabled={ isPending }>
      {isPending ? <span>Processando ...</span> : <span className="text-xs">Deletar Board</span>}
      </button>
      <Dialog state={openDialog} setState={setOpenDialog}>
        <p className="text-sm/relaxed tracking-widest hyphens-auto text-justify">
          Ao excluir o quadro, todas as colunas e cartões também serão <b>excluídos permanentemente</b>, deseja excluí-los?
        </p>
        <form onSubmit={handleDeleteBoard} className="my-auto ml-auto flex gap-2 items-center justify-center">
          <button type="submit" className="flex btn-sm w-24 btn-secondary focus-primary items-center justify-center">
            {isPending ? <LoadingSpinner className="text-primary"/> : <span>Confirmar</span>}
          </button>
          <button className="btn-sm w-24 btn-primary focus-secondary items-center justify-center" onClick={handleCloseDialog}>
            Cancelar
          </button>
        </form>
      </Dialog>
      </>
    )


}
