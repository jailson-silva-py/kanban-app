"use client";
import Card from "@/components/Card";
import { CardsContent } from "@/components/CardsContent";
import CardsLoading from "@/components/CardsLoading";
import { inBoxCards } from "@/constrants/queryKeys";
import { useGetCardsInBox } from "@/hooks/useGetCardsInBox";

const CardsInBox = () => {

  const { data:inBox, isLoading, isError, error } = useGetCardsInBox();

  if (isLoading && !inBox) {
    return <CardsLoading/>;
  } else if (!inBox || inBox.cards.size <= 0)
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
    <div className="w-full flex-6 overflow-y-auto px-4 py-2 duration-700 ease-in-out max-h-[75vh]">
      <CardsContent>
        {[...inBox.cards.values()].map((card) => {

          return (<Card key={card.id}  card={card} cardsKey={inBoxCards}/>)

        })}
      </CardsContent>
    </div>
  );
};

export default CardsInBox;
