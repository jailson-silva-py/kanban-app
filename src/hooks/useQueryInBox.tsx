import { useQueryClient } from "@tanstack/react-query";
import { inBoxCards, card as cardKey } from "@/constrants/queryKeys";
import { InBoxClient } from "@/types/clientDataTypes";
import { Card as CardType } from "@/types/dataTypes";
/** Manipula o cache da coluna especial de entrada e seus cards individuais. */
export function useQueryInBox() {
  const queryClient = useQueryClient();

  return {
    queryClient,
    getInBox: () => {
      const column = queryClient.getQueryData<InBoxClient>(
        inBoxCards
      );
      if (!column) return null;
      return column;
    },
    getCardsFromInBox: () => {
      const column = queryClient.getQueryData<InBoxClient>(
        inBoxCards
      );
      if (!column) return null;
      const cards = [];
      for (let i = 0; i < column.cardIds.length; i++) {
        const thisCardId = column.cardIds[i];
        if (!thisCardId) continue;
        const thisCard = queryClient.getQueryData<CardType>(
          cardKey(thisCardId),
        );
        if (thisCard) cards.push(thisCard);
      }
      return cards;
    },
    setInBox: (columnData: Partial<InBoxClient>) => {
      queryClient.setQueryData<InBoxClient>(inBoxCards, (old) => {
        if (!old) return;
        return { ...old, ...columnData };
      });
    },
    createCardInBox: (cardData: CardType) => {
      const column = queryClient.getQueryData<InBoxClient>(
        inBoxCards
      );
      if (!column) return;
      const cardIds = [cardData.id, ...column.cardIds];
      queryClient.setQueryData<InBoxClient>(inBoxCards, (old) => {
        if (!old) return;
        return { ...old, cardIds };
      });
      queryClient.setQueryData<CardType>(cardKey(cardData.id), cardData);
    },
    removeCardInBox: (cardId: string) => {
      queryClient.removeQueries({ queryKey: cardKey(cardId), exact: true });
      queryClient.setQueryData<InBoxClient>(inBoxCards, (old) => {
        if (!old) return;
        return {
          ...old,
          cardIds: [...old.cardIds.filter((id) => id !== cardId)],
        };
      });
    },

    removeCardsInBoxById: (cardIds: string[]) => {
      //Possível gargalo, revisar posteriormente
      for (let i = 0; i < cardIds.length; i++) {
        const id = cardIds[i];
        queryClient.setQueryData<InBoxClient>(
          inBoxCards,
          (old) => {
            if (!old) return;
            return {
              ...old,
              cardIds: [...old.cardIds.filter((thisId) => thisId !== id)],
            };
          },
        );
        const card = queryClient.getQueryData<CardType>(cardKey(id));
        if (!card) continue;
        queryClient.removeQueries({ queryKey: cardKey(id), exact: true });
      }
    },
  };
}
