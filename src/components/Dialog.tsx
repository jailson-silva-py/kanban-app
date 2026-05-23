"use client";
import { MouseEvent } from "react";
import { TbX } from "react-icons/tb";

type PropsType = {
  children: React.ReactNode;
  setState: React.Dispatch<React.SetStateAction<boolean>>;
  state: boolean;
};

const Dialog: React.FC<PropsType> = ({ children, state, setState }) => {
  const handleCloseDialog = (e: MouseEvent) => {
    e.preventDefault();
    setState(false);
  };

  return (
    <>
      {state && (
        <dialog className="flex flex-col backdrop-blur-sm text-text z-10 fixed p-4 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary/20 backdrop:backdrop-blur-sm w-[80vw] max-w-200 h-50 shadow-default shadow-shadow rounded-sm">
          <button
            className="flex-1 ml-auto  cursor-pointer rounded-sm group"
            onClick={handleCloseDialog}
          >
            <TbX
              size={32}
              className="group-hover:scale-115 duration-200 ease-in transition-transform"
            />
          </button>
          {children}
        </dialog>
      )}
    </>
  );
};

export default Dialog;
