"use client";
import { getCardsForInBoxUser } from "@/actions/actions";
import { useClientKeys } from "@/hooks/useClientKeys";
import Card from "./Card";
import { Card as CardType } from "@/types/dataTypes";
import { useQuery } from "@tanstack/react-query";
import { useDroppable } from "@dnd-kit/react";

type CardsContentProps = {
  cards: CardType[];
  cardsKey?: (string | undefined)[];
  columnId?: string;
} & React.ComponentProps<"ul">;

export const CardsContent: React.FC<CardsContentProps> = ({
  cards,
  columnId,
  cardsKey,
  ...props
}) => {
  const { ref, droppable } = useDroppable({
    id: `column-${columnId}`,
    type: "column",
    accept: "card",
  });

  return (
    <ul
      style={{ border: droppable.isDropTarget ? "2px dashed red" : "none" }}
      {...props}
      ref={ref}
      className={`flex flex-col items-center gap-2 ${props.className ?? ""}`}
    >
      {cards.map((card) => (
        <Card
          key={card.id}
          card={card}
          cardsKey={cardsKey}
          id={`card-${card.id}`}
        />
      ))}
    </ul>
  );
};

const Cards = () => {
  const { cardsKey: queryKey } = useClientKeys();

  const { isLoading, error, data, isError } = useQuery({
    queryFn: getCardsForInBoxUser,
    queryKey,
  });

  if (isLoading && !data) {
    return <p className="flex-7">Carregando ...</p>;
  } else if (!data || data.cards.length <= 0)
    return (
      <p className="text-lg tracking-widest flex-6">Não há nenhum cartão.</p>
    );
  else if (isError)
    return (
      <p className="text-error text-lg tracking-widest flex-6">
        Error: {String(error.message)}
      </p>
    );

  return (
    <div className="w-full flex-6 overflow-y-auto px-4 py- duration-700 ease-in-out">
      <CardsContent cards={data.cards} cardsKey={queryKey} />
    </div>
  );
};

export default Cards;
