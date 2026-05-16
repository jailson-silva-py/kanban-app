"use client";
import useOutClick from "@/hooks/useOutClick";
import { User } from "@/types/dataTypes";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { Activity, useState, useTransition } from "react";
import { TbUserCircle } from "react-icons/tb"

interface Iprops {

    user:User|undefined|null;

}

const ProfileButton = ({user}:Iprops) => {
    

    const [openDropdown, setOpenDropdown] = useState(false);
    const [isPending, startTransition] = useTransition()
    const ref = useOutClick<HTMLUListElement>(() => setOpenDropdown(false));
    const handleBtnProfile = () => setOpenDropdown(prev => !prev);

    const handleLogout =  async () => {

        startTransition(async () => signOut())

    }

    return (

        <div className="w-full h-full flex itens-center justify-end font-light font-widest font-rethink text-sm">
            
            <div className="relative ">
            <button onClick={handleBtnProfile} className="relative h-8 w-8 rounded-full hover:scale-110 cursor-pointer duration-200 ease-in-out transition-transform shadow-xs shadow-text">
                {!user ? 
                <TbUserCircle className="w-full h-full stroke-px"/>
                :
                <Image src={user.image || ""}  alt="profile-image" fill sizes="100%, 100%" className="rounded-full" loading="eager"/>
                }
            </button>
            <Activity mode={openDropdown ? "visible": "hidden"}>

            <ul ref={ref} className="absolute flex flex-col gap-2 overflow-hidden bg-primary rounded-lg w-[20vw] -bottom-2 right-2 translate-y-full shadow-default shadow-shadow">
                {user ? 
                <li className="flex flex-col gap-1">
                    
                    <span className="px-2 pt-2">{user?.name}</span>
                    <div className="h-px bg-white opacity-20"/>
                </li>: <></>}
                <li>
                   
                    <button onClick={() => handleLogout()}className="button-ghost w-full bg-primary">
                        {isPending ? "Processando...":"Log out"}
                    </button>
                    
                    
                </li>
            </ul>

            </Activity>

            </div>

        </div>

    )

}

export default ProfileButton