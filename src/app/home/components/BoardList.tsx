"use client";
import { getAllBoardFromUser } from "@/actions/actions";
import { BoardSimple } from "@/types/dataTypes";
import { useQuery } from "@tanstack/react-query";
import { ComponentProps } from "react";
import BoardLink from "./BoardLink";
import { TbChalkboard } from "react-icons/tb";
import { Separator } from "@/components/Separator";
import { getRandomGradient } from "@/constrants/boardGradients";

type PropsType = {
  type?: "recent" | undefined;
  initialData: BoardSimple[];
  children?: React.ReactNode;
} & ComponentProps<"ul">;

export const BoardList: React.FC<PropsType> = ({
  children,
  type,
  initialData,
  ...props
}) => {
  const queryKey = ["boards"]

  const { data } = useQuery({
    queryKey,
    queryFn: getAllBoardFromUser,
    initialData,
  });

  const displayBoards = type === "recent" ? data.slice(0, 4) : data;

  return (
    <ul
      className="grid max-sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] w-full gap-4"
      {...props}
    >
      {children}

      {displayBoards.map((board, idx) => (
        <BoardLink href={`/board/${board.id}`} key={idx} className="relative">
          <div className={`relative flex flex-col justify-end ${board.gradient} h-full w-full rounded-sm shadow-bottom shadow-shadow overflow-hidden`}>
            <Separator />
            <p className="relative z-1 p-2 text-xs font-geist font-light bg-accent tracking-wider truncate">
              {board.title}
            </p>
          </div>
        </BoardLink>
      ))
      }
    </ul >
  );
};

export default BoardList;
