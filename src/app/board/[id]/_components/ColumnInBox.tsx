"use client";
import { CardsContainer } from "@/app/board/[id]/_components/CardsContainer";
import CardsLoading from "@/components/CardsLoading";
import { inBoxCards } from "@/constrants/queryKeys";
import { useGetCardsInBox } from "@/hooks/useGetCardsInBox";

const CardsInBox = () => {

  const { data: inBox, isLoading } = useGetCardsInBox();
  if (isLoading && !inBox) {
    return <CardsLoading />;
  }
  return (
    <>
      {inBox && <CardsContainer cardIds={inBox.cardIds} columnId={inBox.id} inBoxKey={inBoxCards} />}
    </>

  );
};

export default CardsInBox;
