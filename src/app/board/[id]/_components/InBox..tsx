"use client"
import { AddCartInBox } from "./AddCartInBoxBtn";
import { memo } from "react";
import { TbMessagePlus } from "react-icons/tb";
import ColumnInBox from "./ColumnInBox";
import { Separator } from "@/components/Separator";
import useFloatMenuStorage from "@/hooks/useFloatMenuStorage";

const InBox = () => {
  const storage = useFloatMenuStorage()

  return (
    <div style={{display:!storage.openInBox ? "none": undefined, margin:"0 auto", width:!storage.openBoard && storage.openInBox ? "50%":undefined}}  className="relative shadow-shadow shadow-default bg-secondary/30  overflow-hidden min-w-62.5 max-[270px]:min-w-full h-full md:w-[22.5vw] rounded-sm flex flex-col items-center">
      <header className="bg-secondary/50 w-full basis-15 border-b-px border-white flex items-center justify-center shrink-0 grow-0">
        <div className="flex items-center justify-center gap-2">
          <TbMessagePlus size={24} />
          <span>Caixa de entrada</span>
        </div>
      </header>
      <Separator/>
      <AddCartInBox textForArea="Insira um título ou link">
        Adicionar um Cartão
      </AddCartInBox>
      <ColumnInBox/>
    </div>
  );
};

export default memo(InBox);
