"use client";
import { BoardFull } from "@/types/dataTypes";
import { TbChalkboard } from "react-icons/tb";
import BtnInputEditBoardTitle from "./BtnInputEditBoardTitle";
import ColumnBoard from "./ColumnBoard";
import CreateColumnItemBtn from "./CreateColumn";
import { redirect, usePathname, useRouter } from "next/navigation";
import { MouseEvent, useEffect, useRef, useState } from "react";
import { useGetInitialBoard } from "@/hooks/useGetInitialBoard";
import { Separator } from "@/components/Separator";
import useFloatMenuStorage from "@/hooks/useFloatMenuStorage";
import DialogBoardDelete from "./DialogBoardDelete";
import DropdownMenuWithDots from "@/components/DropdownMenuWithDots";
import { useGetAllColumnsBoard } from "@/hooks/useGetAllColumnsBoard";
import { useQueryBoard } from "@/hooks/useQueryBoard"
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { ButtonGhost } from "@/components/ButtonGhost";
import useCardsColumnsStorage from "@/hooks/useCardsColumnsStorage";
import { storage as mainStorageCardsColumns } from "@/app/util/cardsColumnsStorage";
import Link from "next/link";

interface Iprops {
  initialData: BoardFull;
}


const Board = ({ initialData }: Iprops) => {

  const refButtonEditBoardTitle = useRef<HTMLButtonElement>(null);
  const cardsColumnsStorage = useCardsColumnsStorage();
  const [openDialog, setOpenDialog] = useState(false);
  const { createColumnsPlaceholder, getAllColumnsBoard } = useQueryBoard();
  const refListColumnsBoard = useRef<HTMLUListElement>(null);
  const storage = useFloatMenuStorage()
  const { data: board } = useGetInitialBoard(initialData);

  const { data } = useGetAllColumnsBoard(board?.id!, board?.columnIds!);

  const handleOpenDialogDelete = (e: MouseEvent) => {
    e.preventDefault();
    setOpenDialog(true);
  }

  useEffect(() => {

    const columnsBoard = getAllColumnsBoard(initialData.id)
    if (columnsBoard) return;
    createColumnsPlaceholder(initialData);

  }, [initialData])


  if (!board) redirect("/home");


  useEffect(() => {

    const objTarget = mainStorageCardsColumns.getTarget();

    if (!objTarget) return;


    const elementCard = cardsColumnsStorage.cards.get(objTarget.id);
    const elementColumn = cardsColumnsStorage.columns.get(objTarget.id);
    const el = objTarget.type === "card" ? elementCard : elementColumn;


    if (!el?.current) return

    const executeScroll = (el: Element) => {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    };

    executeScroll(el.current)
    el.current.animate([{ border: "1px solid var(--color-text)" }, { border: "1px solid var(--color-shadow)" }], { easing: "ease", duration: 800, iterations: 4 });
    mainStorageCardsColumns.resetTarget();

  }, [cardsColumnsStorage.cards, cardsColumnsStorage.columns]);

  useEffect(() => {

    const el = refListColumnsBoard.current;
    if (!el) return
    return autoScrollForElements({
      element: el,
    })

  }, [data, board.columnIds])


  return (
    <div style={{ display: !storage.openBoard ? "none" : undefined }} className="relative shadow-shadow shadow-default bg-primary overflow-hidden  w-full h-full rounded-sm flex flex-col">
      <header className="flex items-center flex-3 basis-15 shrink-0 grow-0 px-6 md:px-8 w-full bg-secondary">
        <div className="flex relative items-center justify-center gap-4 w-full h-full">
          <div className="w-full flex gap-2 justify-between items-center">
            <TbChalkboard className="size-6 shrink-0" />
            <BtnInputEditBoardTitle id={board.id} title={board.title} ref={refButtonEditBoardTitle} />
            <DropdownMenuWithDots className="w-25">
              <DropdownMenuWithDots.Item>
                <Link href="/home" className="flex items-center justify-center btn-xs btn-ghost w-full p-1">
                  <span>Voltar</span>
                </Link>
              </DropdownMenuWithDots.Item>
              <DropdownMenuWithDots.Item>
                <ButtonGhost mode="delete" onClick={handleOpenDialogDelete}>
                  <span>Deletar</span>
                </ButtonGhost>
              </DropdownMenuWithDots.Item>
            </DropdownMenuWithDots>
            <DialogBoardDelete id={board.id} openDialog={openDialog} setOpenDialog={setOpenDialog} />
          </div>
        </div>
      </header>
      <Separator />

      <ul
        className="px-8 py-4 flex gap-8 flex-7 shrink-0 w-full overflow-x-auto overflow-y-hidden duration-700 ease-in-out"
        ref={refListColumnsBoard}
      >

        {board.columnIds.map((id) => (<ColumnBoard id={id} key={id} />))}
        {board && <CreateColumnItemBtn />}
      </ul>

    </div >
  );
};

export default Board;
