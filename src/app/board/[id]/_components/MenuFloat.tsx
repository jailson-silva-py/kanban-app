"use client";
import { floatMenuStorage } from "@/app/util/floatMenuStorage";
import { BorderBottomSelected } from "@/components/BorderBottomSelected";
import useFloatMenuStorage from "@/hooks/useFloatMenuStorage";
import { useEffect, useState } from "react";
import { TbChalkboard, TbMessagePlus } from "react-icons/tb"

const MenuFloat = () => {
  const storage = useFloatMenuStorage()
  const [pauseAutoClose, setPauseAutoClose] = useState(true)

  useEffect(() => {

    const timeout = setTimeout(() => {

      if (pauseAutoClose) return;

      floatMenuStorage.closeMenu();

    }, 5000)

    return () => clearTimeout(timeout);

  }, [pauseAutoClose])

  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2">

      {!storage.isShow ?
      <ul className="px-2 flex justify-center  items-center  btn-md gap-2 bg-primary/10 w-fit max-w-[90vw] shadow-default shadow-shadow backdrop-blur-xs">

      <li>
        <button style={{color:storage.openInBox ? "var(--color-info)":undefined, background:storage.openInBox ?"oklch(from var(--color-info) l c h / 0.05)":undefined}} onClick={floatMenuStorage.invertOpenInbox} className="relative btn-sm btn-ghost flex items-center gap-1 text-xs">
          <TbMessagePlus size={24} className="text-inherit"/>
          <span>InBox</span>
          {storage.openInBox && <BorderBottomSelected/>}
        </button>
      </li>
      <li>
        <button style={{color:storage.openBoard ? "var(--color-info)":undefined, background:storage.openBoard ?"oklch(from var(--color-info) l c h / 0.05)":undefined}} onClick={floatMenuStorage.invertOpenBoard} className="relative btn-sm btn-ghost flex items-center gap-1 text-xs">
          <TbChalkboard size={24} className="text-inherit"/>
          <span>Board</span>
          {storage.openBoard && <BorderBottomSelected/>}
        </button>
      </li>
        </ul>
        :
        <button onClick={() => {}}></button>}
    </div>
  )

}

export default MenuFloat
