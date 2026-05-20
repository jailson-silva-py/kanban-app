import { AddCartInBox } from "@/components/AddCartInBoxBtn";
import Cards from "@/components/Cards";
import { memo } from "react";
import { TbMessagePlus } from "react-icons/tb";

const InBox = () => {
  return (
    <div className="shadow-shadow shadow-default bg-secondary/30  overflow-hidden  h-full flex-1 rounded-xl flex flex-col gap-1 items-center">
      <header className="bg-secondary/50 w-full h-15 border-b-px border-white flex items-center justify-center">
        <div className="flex items-center justify-center gap-2">
          <TbMessagePlus size={24} />
          <span>Caixa de entrada</span>
        </div>
      </header>

      <AddCartInBox textForArea="Insira um título ou link">
        Adicionar um Cartão
      </AddCartInBox>
      <Cards />
    </div>
  );
};

export default memo(InBox);
