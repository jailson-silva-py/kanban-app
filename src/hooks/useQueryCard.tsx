import { Card as CardType } from "@/types/dataTypes";
import { useQueryClient } from "@tanstack/react-query";
import { card as cardKey } from "@/constrants/queryKeys"

/** Fornece acesso ao card individual no cache e atualiza somente seus campos alterados. */
export function useQueryCard() {
  const queryClient = useQueryClient();

  return {
    queryClient,
    getCard: (cardId: string) => {
      const card = queryClient.getQueryData<CardType>(cardKey(cardId));
      if (!card) return null
      return card;
    },

    setCard: (cardId: string, cardData: Partial<CardType>) => {
      queryClient.setQueryData<CardType>(cardKey(cardId), (old) => {
        if (!old) return;
        return { ...old, ...cardData };
      });
    },
  };
}
