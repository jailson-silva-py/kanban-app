"use client";

import { createBoardFromUser } from "@/actions/actions";
import Dialog from "@/components/Dialog";
import LoadingSpinner from "@/components/LoadingSpinner";
import { BoardSimple } from "@/types/dataTypes";
import { useMutation } from "@tanstack/react-query";
import { MouseEvent, SubmitEvent, TouchEvent, useState } from "react";
import { TbPlus } from "react-icons/tb";

type PropsType = React.ComponentProps<"li">;

const BoardAdd: React.FC<PropsType> = ({ ...props }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const queryKey = ["boards"]

  const { mutate, isPending } = useMutation({
    mutationKey: ["board", "create"],
    mutationFn: createBoardFromUser,
    onMutate(variables, context) {
      context.client.cancelQueries({ queryKey });
    },
    onSuccess: (data, variables, result, context) => {
      context.client.setQueryData(queryKey, (oldData: BoardSimple[]) => [
        data,
        ...oldData,
      ]);
    },
  });

  const handleOpenDialog = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    setOpenDialog(true);
  };

  const onCreateBoard = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = (formData.get("title_board") as string).trim();
    const id = crypto.randomUUID();
    mutate({ id, title }, { onSuccess: () => setOpenDialog(false) });
  };

  return (
    <>
      <li className="flex flex-col rounded-lg w-full h-37.5" {...props}>
        <button
          type="submit"
          className="bg-primary z-1 h-8/10 w-full flex flex-col text-xs gap-2 items-center justify-center shadow-default shadow-shadow rounded-lg hover:brightness-150 cursor-pointer"
          onClick={handleOpenDialog}
        >
          <TbPlus size={32} />

          <span>Criar um novo quadro</span>
        </button>
      </li>
      <Dialog state={openDialog} setState={setOpenDialog}>
        <form
          onSubmit={onCreateBoard}
          className="w-full flex-9 flex flex-col items-center justify-center"
        >
          <label className="my-auto w-full flex flex-col gap-2">
            <input
              className="default-input text-sm"
              name="title_board"
              placeholder="Digite o título do quadro: "
              required
            />
          </label>

          <button
            type="submit"
            className="flex items-center justify-center default-button bg-secondary/20 ml-auto h-10 min-w-25 disabled:opacity-60 hover:brightness-135"
            disabled={isPending}
          >
            {isPending ? <LoadingSpinner size={24} /> : <span>Criar</span>}
          </button>
        </form>
      </Dialog>
    </>
  );
};

export default BoardAdd;
