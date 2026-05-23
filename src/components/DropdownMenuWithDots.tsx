import useOutClick from "@/hooks/useOutClick";
import { useState } from "react";
import { TbDotsVertical } from "react-icons/tb";

type DropdownMenuWithDotsProps = {
  children: React.ReactNode;
} & React.ComponentProps<'ul'>;

const DropdownMenuWithDots = ({ children, ...props }: DropdownMenuWithDotsProps) => {
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
        className="absolute cursor-pointer right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-text/5"
        aria-label="Mais Opções"
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
  return <li className="p-1 bg-primary/60 h-max w-full">{children}</li>;
};

export default DropdownMenuWithDots;
