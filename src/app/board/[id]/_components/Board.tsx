"use client";

import { BoardFull } from "@/types/dataTypes";
import { TbChalkboard } from "react-icons/tb";
import BtnInputEditBoardTitle from "./BtnInputEditBoardTitle";
import { useQuery } from "@tanstack/react-query";
import { useClientKeys } from "@/hooks/useClientKeys";
import { getBoardById } from "@/actions/actions";
import ColumnBoard from "./ColumnBoard";
import CreateColumnItemBtn from "./CreateColumn";
import { redirect } from "next/navigation";

interface Iprops {
  initialData: BoardFull;
}

const Board = ({ initialData }: Iprops) => {
  const queryKey = useClientKeys().getBoardKey(initialData.id);
  const { data: board } = useQuery({
    initialData,
    queryKey,
    queryFn: () => getBoardById(initialData.id),
  });
  if (!board) redirect("/home");

  return (
    <div className=" shadow-shadow shadow-default bg-secondary/30  overflow-hidden h-full flex-4 rounded-xl flex flex-col gap-4">
      <header className="flex items-center flex-3 basis-15 shrink-0 grow-0 px-8 w-full bg-secondary/10">
        <div className="flex items-center justify-center gap-2">
          <TbChalkboard size={24} />
          <BtnInputEditBoardTitle id={board.id} title={board.title} />
        </div>
      </header>

      <ul className="px-8 py-4 flex gap-8 flex-7 shrink-0 w-full overflow-x-auto overflow-y-hidden">
        {board?.columns?.map((column) => {
          return (
            <ColumnBoard
              id={column.id}
              key={column.id}
              initialData={{ boardId: board.id, ...column, cards: [] }}
            />
          );
        })}

        {board && (
          <CreateColumnItemBtn boardId={board.id} columns={board.columns} />
        )}
      </ul>
    </div>
  );
};

export default Board;
