"use client";
import BtnInputEditColumnTitle from "./BtnInputEditColumnTitle";
import CardsColumn from "./CardsColumn";
import { useDroppable } from "@dnd-kit/react";
import { CollisionPriority } from "@dnd-kit/abstract";
import CardsLoading from "@/components/CardsLoading";
import { useGetColumn } from "@/hooks/useGetColumn";
import { AddCartColumn } from "./AddCartColumnBtn";
import { CardsContent } from "@/components/CardsContent";
import Card from "@/components/Card";
import BtnDeleteColumn from "./BtnDeleteColumn";


type Iprops = {
  id: string;
  boardId: string;
} & React.ComponentProps<"li">;

function ColumnBoard({ id, boardId,  ...props }: Iprops) {

  const { data, isPlaceholderData } = useGetColumn(id, boardId as string)

  const { ref } = useDroppable({
    id: `column-${id}`,
    type: "column",
    accept: "card",
    collisionPriority: CollisionPriority.Low,
  });

  return (

    <li
      {...props}
      ref={ref}
      className={`flex flex-col shadow-shadow shadow-default bg-primary/30 rounded-lg w-65 shrink-0 grow-0 max-h-[75vh]`}
    >
      <BtnInputEditColumnTitle
        columnTitle={data?.title as string}
        columnId={id}
        boardId={data?.boardId as string}
          >
          <BtnDeleteColumn columnId={id} />
      </BtnInputEditColumnTitle>

          <CardsColumn>
          <AddCartColumn columnId={data?.id as string} textForArea="Adicione um cartão gostosinho">
              Adicionar um cartão
          </AddCartColumn>
            {!isPlaceholderData && data ?
              <CardsContent
            columnId={data.id}
            id={`column-${data.id}`}

            className="p-4 flex-8 overflow-y-auto shrink-0 basis-96 duration-2000 ease-in-out"
            >
            {[...data.cards.values()].map((card,index) => {

              return (<Card style={ {animationDelay:`${(index+1)*50}ms`} } key={card.id} card={card}/>)

            })}
              </CardsContent>
              :
              <CardsLoading/>
            }
          </CardsColumn>
    </li>

  );
}

export default ColumnBoard;
