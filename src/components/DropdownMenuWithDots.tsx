import useOutClick from "@/hooks/useOutClick";
import { useState } from "react";
import { TbDotsVertical } from "react-icons/tb";

type DropdownMenuWithDotsProps = {
  children: React.ReactNode;
  positionBtn?:"relative"|"absolute"|"fixed"
} & React.ComponentProps<'ul'>;

const DropdownMenuWithDots = ({ children, positionBtn,...props }: DropdownMenuWithDotsProps) => {
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
        className={`${positionBtn ?? "absolute"} cursor-pointer ${positionBtn && positionBtn !== "absolute" ? "":"right-2 top-1/2 -translate-y-1/2"}  rounded-full p-1 hover:bg-text/5`}
        aria-label="more-options"
        title="Mais Opções"
      >
        <TbDotsVertical size={18} />
      </button>
      <ul
        ref={refListOptions}
        style={{ display: openDrop ? "block" : "none" }}
        {...props}
        className={`z-3 hidden absolute w-25 h-max font-geist font-light right-2 bottom-1 backdrop-blur-sm translate-y-full shadow-shadow shadow-default rounded-sm overflow-hidden ${props.className??""}`}

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
  return <li className="p-1 bg-primary/70 h-max w-full tracking-widest font-geist">{children}</li>;
};

export default DropdownMenuWithDots;
