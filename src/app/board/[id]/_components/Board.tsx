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

interface Iprops {
  initialData: BoardFull;
}


const Board = ({ initialData }: Iprops) => {

  const router = useRouter();
  const pathname = usePathname();
  const [openDialog, setOpenDialog] = useState(false);
  const { createColumnsPlaceholder, getAllColumnsBoard } = useQueryBoard();
  const refListColumnsBoard = useRef<HTMLUListElement>(null);
  const storage = useFloatMenuStorage()
  const { data: board, isLoading } = useGetInitialBoard(initialData);

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
    const hash = window.location.hash;

    if (!hash || isLoading || !board) return;

    const executeScroll = (el: Element) => {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
      router.replace(pathname);
    };

    const elementoImediato = document.querySelector(hash);


    if (elementoImediato) {
      executeScroll(elementoImediato);
      return;
    }

    const callback = (mutations: MutationRecord[], obs: MutationObserver) => {
      const elemento = document.querySelector(hash);
      if (!elemento) return;
      executeScroll(elemento);
      obs.disconnect();
    };

    const observer = new MutationObserver(callback);

    observer.observe(document.body, { subtree: true, childList: true });

    return () => observer.disconnect();
  }, [isLoading, pathname, router, board]);

  useEffect(() => {

    const el = refListColumnsBoard.current;
    if (!el) return;
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
            <BtnInputEditBoardTitle id={board.id} title={board.title} />
            <DropdownMenuWithDots className="w-25">
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
