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
  } else if (isError)
    return (
      <p className="text-error text-xs/relaxed tracking-widest flex-6 hyphens-auto text-justify" aria-label="error-cards">
        Error: {String(error.message)}, Por favor recarregue a página.
      </p>
    ); else if (!inBox || inBox.cards.length <= 0)
      return (
        <p className="text-lg tracking-widest flex-6" aria-label="no-cards">Não há nenhum cartão.</p>
      );

  return (
    <div className="w-full flex-6 overflow-y-auto px-4 py-2 duration-700 ease-in-out max-h-[75vh]" aria-label="column-inbox">
      <CardsContent>
        {inBox.cards.map((card) => {

          return (<Card key={card.id}  card={card} cardsKey={inBoxCards}/>)

        })}
      </CardsContent>
    </div>
  );
};

export default CardsInBox;
