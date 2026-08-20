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
        <dialog className="flex flex-col  text-text z-10 fixed p-4 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-secondary/70 backdrop-blur-xl w-[80vw] max-w-150 h-50 shadow-default shadow-shadow rounded-sm">
          <button
            className="p-2 ml-auto bg-secondary hover:bg-text/10 cursor-pointer rounded-sm"
            onClick={handleCloseDialog}
          >
            <TbX
              size={24}
            />
          </button>
          {children}
        </dialog>
      )}
    </>
  );
};

export default Dialog;
