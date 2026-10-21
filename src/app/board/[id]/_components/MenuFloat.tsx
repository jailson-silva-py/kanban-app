"use client";
import { BorderBottomSelected } from "@/components/BorderBottomSelected";
import useFloatMenuStorage from "@/hooks/useFloatMenuStorage";
import useOutClick from "@/hooks/useOutClick";
import { useLayoutEffect } from "react";
import { TbArrowBigUpLine, TbChalkboard, TbMessagePlus } from "react-icons/tb"

const MenuFloat = () => {
  const { storage, showMenu, closeMenu, closeBoard, openBoard, closeInBox, openInBox } = useFloatMenuStorage()
  const ref = useOutClick<HTMLUListElement>(closeMenu);

  const invertOpenBoard = (e: React.MouseEvent) => {
    e.preventDefault();
    if (storage.isOpenBoard) {
      closeBoard();
      return;
    }
    openBoard();
  }

  const invertOpenInBox = (e: React.MouseEvent) => {
    e.preventDefault();
    if (storage.isOpenInBox) {
      closeInBox();
      return;
    }
    openInBox();
  }

  useLayoutEffect(() => {
    const isMobile = window.innerWidth <= 748;
    console.log(window.innerWidth);
    if (isMobile && storage.isOpenInBox) {
      closeInBox();
      console.log("na condicional is mobile")
    }
    showMenu();

  }, [])
  console.log(storage)
  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2">

      {storage.isShow ?
        <ul aria-label="menu-float" ref={ref} className="px-2 flex justify-center  items-center  btn-md gap-2 bg-primary/10 w-fit max-w-[90vw] shadow-default shadow-shadow backdrop-blur-xs">

          <li>
            <button aria-label="inbox"
              style={{ color: storage.isOpenInBox ? "var(--color-info)" : undefined, background: storage.isOpenInBox ? "oklch(from var(--color-info) l c h / 0.05)" : undefined }} onClick={invertOpenInBox} className="relative btn-sm btn-ghost flex items-center gap-1 text-xs">
              <TbMessagePlus size={24} className="text-inherit" />
              <span>InBox</span>
              {storage.isOpenInBox && <BorderBottomSelected />}
            </button>
          </li>
          <li>
            <button aria-label="board"
              style={{ color: storage.isOpenBoard ? "var(--color-info)" : undefined, background: storage.isOpenBoard ? "oklch(from var(--color-info) l c h / 0.05)" : undefined }} onClick={invertOpenBoard} className="relative btn-sm btn-ghost flex items-center gap-1 text-xs">
              <TbChalkboard size={24} className="text-inherit" />
              <span>Board</span>
              {storage.isOpenBoard && <BorderBottomSelected />}
            </button>
          </li>
        </ul>
        :
        <button title="Exibir painel Board/InBox" aria-label="show-menu" onClick={() => {
          showMenu();
        }}
          className="bg-info/5  w-12 h-12 border-text  group fixed bottom-1/2 top-1/2 -translate-1/2 default-btn btn-sm rounded-full">
          <TbArrowBigUpLine size={24} className="animate-to-jump group-hover:text-info" />
        </button>}
    </div>
  )

}

export default MenuFloat
