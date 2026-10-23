"use client";
import { logger } from "@/app/util/logger";
import Dialog from "@/components/Dialog";
import DropdownMenuWithDots from "@/components/DropdownMenuWithDots";
import LoadingSpinner from "@/components/LoadingSpinner";
import { columnArrayColors } from "@/constrants/columnColors";
import useMutationColumnChangeColor from "@/hooks/useMutationColumnChangeColor";
import { useMutationColumns } from "@/hooks/useMutationColumns";
import { useQueryColumn } from "@/hooks/useQueryColumn";
import React, { useState } from "react";


type MenuOperationsColProps = {
  columnId: string;
  boardId: string,
};

export const MenuOperationsCol = ({ columnId, boardId }: MenuOperationsColProps) => {

  const [isOpenColorModal, setIsOpenColorModal] = useState(false);

  const { mutate, isPending } = useMutationColumns();

  const onDeleteColumn = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate({ operation: "delete", columnId, boardId });
  };

  const handleOpenColorModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpenColorModal(true)
  }

  return (
    <>
      <DropdownMenuWithDots>
        <DropdownMenuWithDots.Item>
          <button className="flex items-center justify-center w-full btn-ghost rounded-sm text-xs btn-xs"
            aria-label="btn-change-color" onClick={handleOpenColorModal}>
            Mudar Cor
          </button>
        </DropdownMenuWithDots.Item>
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
      <ChangeColorModal state={isOpenColorModal} setState={setIsOpenColorModal} columnId={columnId} />
    </>
  );
};

type ChangeColorModalProps = {
  state: boolean,
  setState: React.Dispatch<React.SetStateAction<boolean>>,
  columnId: string,
}


function ChangeColorModal({ state, setState, columnId }: ChangeColorModalProps) {


  const { getColumn } = useQueryColumn();
  const { mutate, isPending } = useMutationColumnChangeColor()
  const column = getColumn(columnId);
  const columnColor = column?.color ?? "Sem cor definida";
  const [color, setColor] = useState<string>(column?.color || "#000000");
  const handleChangeColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const value = e.target.value.toString();
    setColor(value);
  }

  const onSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const color = formData.get("change-color")?.toString();
    if (!color) {
      logger.print("MenuOperationsCol -> ChangeColorModal -> onSubmit", "error",
        "Campo color não encotrado. Verifique se está no DOM ou se está com o name correto.");
      return
    }
    mutate({ color, id: columnId });

  }

  const onReset: React.ReactEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setState(false);
  }

  return (
    <Dialog state={state} setState={setState}>
      <form onSubmit={onSubmit} className="flex flex-col items-start justify-center grow w-full gap-2" onReset={onReset}
        aria-label="form-change-color">
        <label className="flex items-center justify-center gap-2">
          <input type="color" name="change-color" value={color} onChange={handleChangeColor} className="w-12 h-8 rounded-sm"
            aria-label="change-color" />
          <span className="text-xs font-medium ">
            {color || columnColor}
          </span>
        </label>

        <ListOfColors setColor={setColor} />

        <div className="mt-auto self-end flex gap-1">
          <button type="reset" className="btn-ghost btn-xs shadow-shadow shadow-default font-medium w-20" aria-label="cancel-change-color">
            Cancelar
          </button>
          <button className="flex items-center justify-center btn-secondary btn-xs font-medium w-20 disabled:opacity-50"
            aria-label="submit-change-color" disabled={isPending}>
            {isPending ? <LoadingSpinner size={18} /> : <p>Salvar</p>}
          </button>
        </div>
      </form>
    </Dialog >
  )

}

const ListOfColors = ({ setColor }: { setColor: React.Dispatch<React.SetStateAction<string>> }) => {


  return (

    <ul className="flex gap-2 flex-wrap">
      {columnArrayColors.map((color, index) => <Color setColor={setColor} color={color} key={`${color}-${index}`} />)}
    </ul>

  )

}

const Color = ({ color, setColor }: { color: string, setColor: React.Dispatch<React.SetStateAction<string>> }) => {

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setColor(color);
  }

  return (
    <li style={{ background: color }} className="w-12 h-6 rounded-sm hover:opacity-90 hover:border hover:border-text">
      <button type="button" className="w-full h-full cursor-pointer" onClick={handleClick}>
      </button>
    </li>
  )
}