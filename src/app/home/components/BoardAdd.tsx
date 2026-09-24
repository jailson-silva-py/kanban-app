"use client";
import { createBoardFromUser } from "@/actions/actions";
import Dialog from "@/components/Dialog";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getRandomGradient } from "@/constrants/boardGradients";
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
    const gradient = getRandomGradient();
    mutate({ id, title, gradient }, { onSuccess: () => setOpenDialog(false) });
  };

  return (
    <>
      <li className="flex flex-col rounded-sm w-full h-30 tracking-widest font-rethink" {...props}>
        <button
          type="submit"
          className="h-full bg-linear-to-br from-primary to-accent z-1 w-full flex flex-col text-xs gap-2 items-center justify-center border border-l-6 border-b-6 border-shadow shadow-shadow rounded-sm hover:brightness-125 hover:border-text-secondary hover:-translate-y-0.5 cursor-pointer"
          onClick={handleOpenDialog}
        >
          <TbPlus size={32} />

          <span className="font-medium text-sm">Criar novo quadro</span>
        </button>
      </li>
      <Dialog state={openDialog} setState={setOpenDialog}>
        <form
          onSubmit={onCreateBoard}
          className="py-2 pt-4 sm:py-4 sm:px-4 w-full flex-9 flex flex-col items-center justify-start"
        >
          <label className="w-full flex flex-col gap-2">
            <input
              className="default-input text-sm focus-primary"
              name="title_board"
              placeholder="Digite o título do quadro: "
              required
            />
          </label>

          <button
            type="submit"
            className="self-end mt-auto w-24 flex items-center justify-center btn-sm btn-secondary focus-primary"
            disabled={isPending}
          >
            {isPending ? <LoadingSpinner size={24} className="text-primary" /> : <span>Criar</span>}
          </button>
        </form>
      </Dialog>
    </>
  );
};

export default BoardAdd;
