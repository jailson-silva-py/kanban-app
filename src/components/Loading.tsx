"use client";
import { useLinkStatus } from "next/link";

const Loading = () => {

    const { pending } = useLinkStatus();

    return (
    <>
    { pending ? 
        <div className="absolute top-0 left-0 h-1 w-full bg-linear-90 from-text  via-primary to-text animate-up-width"/>
        :
        <></>}
    </>
    )
    

}

export default Loading