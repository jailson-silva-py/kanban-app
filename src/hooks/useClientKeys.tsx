"use client";
import { getSession } from "next-auth/react";
import { use } from "react";

const promise = getSession();

export const useClientKeys  = () => {

    const session  = use(promise)

    return { cardsKey:['cards', session?.user?.id], boardsKey:['boards', session?.user?.id],
        getBoardKey:(id:string) => ["board", id], getColumnKey:(id:string) => ["column", id]}

}