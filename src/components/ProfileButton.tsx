"use client";
import useOutClick from "@/hooks/useOutClick";
import { User } from "@/types/dataTypes";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { Activity, useState, useTransition } from "react";
import { Separator } from "./Separator";
import Link from "next/link";

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

        <div className="w-full h-full flex itens-center justify-end font-light tracking-wider font-geist text-sm">

        <div className="relative flex justify-center items-center w-full">

          {user ?
            <button onClick={handleBtnProfile} className="relative h-8 w-8 rounded-full hover:scale-110 cursor-pointer duration-200 ease-in-out transition-transform shadow-default shadow-shadow">
              <Image src={user?.image || ""}  alt="profile-image" fill sizes="100%, 100%" className="rounded-full" loading="eager"/>
            </button>
            :
            <Link href="/signin" className="w-28 default-btn text-xs btn-secondary btn-sm font-semibold flex justify-center gap-2">
              Fazer login
            </Link>
          }
          <Activity mode={openDropdown && user ? "visible" : "hidden"}>

           <ul ref={ref} className="dropdown-md dropdown-primary rounded-sm w-[20vw] -bottom-2 right-1 translate-y-full">

              <li className="flex flex-col gap-1">
                  <span className="px-2 text-xs text-text-secondary">{user?.name}</span>
                  <Separator/>
              </li>
              <li>
              <Link href="/profile" className="flex items-center btn-ghost text-xs btn-xs w-full text-start">Profile</Link>
              </li>
              <li>
                  <button onClick={handleLogout}className="btn-ghost btn-xs text-xs w-full text-start">
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
