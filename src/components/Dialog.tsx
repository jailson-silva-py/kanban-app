"use client";
import { MouseEvent } from "react";
import dynamic from "next/dynamic";
import { TbX } from "react-icons/tb";
import { createPortal } from "react-dom";

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

  return createPortal(
    <>
      {state && (
        <div className="z-10 fixed top-0 left-0 w-screen h-screen tracking-widest font-geist">
          <dialog className="flex flex-col  text-text fixed p-4 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent w-[80vw] max-w-150 min-h-50 shadow-default shadow-shadow rounded-sm">
            <button
              className="p-1 ml-auto bg-accent hover:bg-text/30 cursor-pointer rounded-sm"
              onClick={handleCloseDialog}
            >
              <TbX
                size={24}
              />
            </button>
            {children}
          </dialog>
        </div>
      )}
    </>,
    document.body
  );
};

export default dynamic((async () => Dialog), { ssr: false });
