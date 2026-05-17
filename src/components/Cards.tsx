"use client";
import { getCardsForInBoxUser } from "@/actions/actions";
import { useClientKeys } from "@/hooks/useClientKeys";
import Card from "./Card";
import { Card as CardType } from "@/types/dataTypes";
import { useQuery } from "@tanstack/react-query";

type CardsContentProps = {
  cards: CardType[];
  cardsKey?: (string | undefined)[];
} & React.ComponentProps<"ul">;

export const CardsContent: React.FC<CardsContentProps> = ({
  cards,
  cardsKey,
  ...props
}) => {
  return (
    <ul
      key={cards.length}
      {...props}
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

export const Cards = () => {
  const { cardsKey: queryKey } = useClientKeys();

  const { isPending, error, data, isError } = useQuery({
    queryFn: getCardsForInBoxUser,
    queryKey,
  });

  if (isPending && !data) {
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
    <div className="w-full flex-6 overflow-y-auto scroll-smooth px-4 py- duration-700 ease-in-out">
      <CardsContent cards={data.cards} cardsKey={queryKey} />
    </div>
  );
};
