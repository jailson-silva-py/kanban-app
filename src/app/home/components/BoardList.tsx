"use client";
import { getAllBoardFromUser } from "@/actions/actions";
import { useClientKeys } from "@/hooks/useClientKeys";
import { BoardSimple } from "@/types/dataTypes";
import { useQuery } from "@tanstack/react-query";
import { ComponentProps } from "react";
import BoardLink from "./BoardLink";
import { TbChalkboard } from "react-icons/tb";

type PropsType = {type?:"recent"|undefined, initialData:BoardSimple[], children?:React.ReactNode} & ComponentProps<'ul'>

export const BoardList:React.FC<PropsType> = ({children, type, initialData, ...props}) => {

    const {boardsKey:queryKey} = useClientKeys();

    const {data} = useQuery({queryKey, queryFn:getAllBoardFromUser, initialData})

    const displayBoards = type === 'recent' ? data.slice(0,4):data

    return (

        <ul className="grid grid-cols-[repeat(auto-fill,minmax(75px,200px))] gap-8" {...props}>
            {children}
                    
            { 

            displayBoards.map((value, idx) => (

            <BoardLink href={`/board/${value.id}`} key={idx}>
                            
                <div className="relative flex flex-col justify-end bg-gray h-full w-full rounded-lg shadow-sm shadow-shadow">

                    <TbChalkboard size={32} className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 animate-bounce"/>
                    <p className="relative z-1 p-2 text-xs txt bg-primary/50 truncate">{value.title}</p>

                </div>
                


            </BoardLink>

            ))

            }

        </ul>

    )

}

export default BoardList