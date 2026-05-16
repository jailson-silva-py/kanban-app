import useOutClick from "@/hooks/useOutClick";
import { useState } from "react";
import { TbDotsVertical } from "react-icons/tb";

type DropdownMenuWithDotsProps = {
  children: React.ReactNode;
};

const DropdownMenuWithDots = ({ children }: DropdownMenuWithDotsProps) => {
  const [openDrop, setOpenDrop] = useState(false);
  const refListOptions = useOutClick<HTMLUListElement>(() =>
    setOpenDrop(false),
  );

  const handleOpenDropdown = () => {
    setOpenDrop(true);
  };

  return (
    <>
      <button
        onClick={handleOpenDropdown}
        className="z-1 absolute backdrop-blur-sm cursor-pointer right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-text/5"
        aria-label="Mais Opções"
        title="Mais Opções"
      >
        <TbDotsVertical size={18} />
      </button>
      <ul
        ref={refListOptions}
        style={{ display: openDrop ? "block" : "none" }}
        className="hidden absolute z-3 w-25 h-max font-geist font-light bottom-0 backdrop-blur-sm translate-y-full right-0  shadow-shadow/80 shadow-sm rounded-lg overflow-hidden"
      >
        {children}
      </ul>
    </>
  );
};

DropdownMenuWithDots.Item = function DropdownMenuWithDotsItem({
  children,
}: {
  children: React.ReactNode;
}) {
  return <li className="p-1 bg-primary/60 h-max w-full">{children}</li>;
};

export default DropdownMenuWithDots;
