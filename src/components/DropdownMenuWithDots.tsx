"use client";
import useOutClick from "@/hooks/useOutClick";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { TbDotsVertical } from "react-icons/tb";

type DropdownMenuWithDotsProps = {
  children: React.ReactNode;
} & React.ComponentProps<'ul'>;

const DropdownMenuWithDots = ({ children, ...props }: DropdownMenuWithDotsProps) => {
  const [openDrop, setOpenDrop] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const refButton = useRef<HTMLButtonElement>(null);
  const refListOptions = useOutClick<HTMLUListElement>(() =>
    setOpenDrop(false),
  );
  const [coordList, setCoordList] = useState<{ width: number; height: number } | null>(null);
  const posYFinalList = buttonRect && coordList?.height && buttonRect?.bottom + 4 + (coordList?.height || 0) > window.innerHeight ? window.innerHeight - (coordList?.height || 0) - 4 : buttonRect?.bottom
  const posXFinalList = buttonRect && coordList?.width && buttonRect?.left + 4 + coordList.width > window.innerWidth ? window.innerWidth - (coordList?.width || 0) - 4 : buttonRect?.left

  useLayoutEffect(() => {
    if (!refListOptions?.current) return;
    const element = refListOptions.current
    setCoordList((prev) => ({ ...prev, width: element.clientWidth, height: element.clientHeight }));
  }, [refListOptions, openDrop])


  const handleOpenDropdown = () => {
    if (refButton.current) {
      setButtonRect(refButton.current.getBoundingClientRect());
    }
    setOpenDrop(true);
  };

  return (
    <div className="realtive ml-auto h-full w-5 flex items-center justify-center">
      <button
        ref={refButton}
        onClick={handleOpenDropdown}
        className={`rounded-full p-1 hover:bg-text/5 flex items-center justify-center`}
        aria-label="more-options"
        title="Mais Opções"
      >
        <TbDotsVertical size={18} />
      </button>

      {openDrop && buttonRect && createPortal(<ul
        ref={refListOptions}
        style={{ top: `${posYFinalList}px`, left: `${posXFinalList}px` }}
        {...props}
        className={`z-3 fixed w-25 h-max font-geist font-light -right-20 bottom-1 backdrop-blur-sm  shadow-shadow shadow-default rounded-sm overflow-hidden *:border-b *:border-b-shadow  ${props.className ?? ""}`}
      >
        {children}
      </ul>,
        document.body,
      )}
    </div>
  );
};

DropdownMenuWithDots.Item = function DropdownMenuWithDotsItem({
  children,
}: {
  children: React.ReactNode;
}) {
  return <li className="p-1 bg-primary/70 h-max w-full tracking-widest font-geist">{children}</li>;
};

export default DropdownMenuWithDots;
