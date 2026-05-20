import { AddCartColumn } from "@/components/AddCartColumnBtn";
import { CardsContent } from "@/components/Cards";
import { Column } from "@/types/dataTypes";

interface Iprops {
  data: Column;
}

const CardsColumn: React.FC<Iprops> = ({ data }) => {
  //   "render-cards-column",
  // );
  return (
    <div className="flex flex-col justify-baseline w-full h-full">
      <AddCartColumn column={data} textForArea="Adicione um cartão gostosinho">
        Adicionar um cartão
      </AddCartColumn>
      <CardsContent
        columnId={data.id}
        id={`column-${data.id}`}
        cards={data.cards}
        className="p-4 flex-8 overflow-y-auto shrink-0 basis-96 duration-2000 ease-in-out"
      />
    </div>
  );
};

export default CardsColumn;
