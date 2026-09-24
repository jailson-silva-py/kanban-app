"use client";
import BtnInputEditColumnTitle from "./BtnInputEditColumnTitle";
import CardsColumn from "./CardsColumn";
import CardsLoading from "@/components/CardsLoading";
import { useGetColumn } from "@/hooks/useGetColumn";
import { AddCartColumn } from "./AddCardColumnBtn";
import { CardsContainer } from "@/app/board/[id]/_components/CardsContainer";
import BtnDeleteColumn from "./MenuOperationsCol";
import { useParams } from "next/navigation";

type Iprops = {
  id: string;
} & React.ComponentProps<"li">;

function ColumnBoard({ id, ...props }: Iprops) {

  const { id: boardId } = useParams<{ id: string }>();
  const { isLoading, data, isPlaceholderData } = useGetColumn(
    id,
    boardId,
  );

  return (
    <li
      {...props}
      className={`flex flex-col shadow-shadow shadow-default bg-primary/30 rounded-sm w-65 shrink-0 grow-0 max-h-[75vh]`}
    >
      <BtnInputEditColumnTitle
        columnTitle={data?.title || ""}
        columnId={id}
        boardId={data?.boardId as string}
      >
        <BtnDeleteColumn boardId={boardId} columnId={id} />
      </BtnInputEditColumnTitle>

      <CardsColumn>
        <AddCartColumn
          columnId={data?.id as string}
          textForArea="Adicione um cartão gostosinho"
        >
          Adicionar um cartão
        </AddCartColumn>
        {!isLoading && data && !isPlaceholderData ? (
          <CardsContainer cardIds={data.cardIds} columnId={data.id} />
        ) :
          <CardsLoading />
        }
      </CardsColumn>
    </li>
  );
}

export default ColumnBoard;
