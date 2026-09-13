"use client";
import { useMutation } from "@tanstack/react-query";
import  { Card as CardType } from "@/types/dataTypes";
import { ChangeCompletedCard, DeleteCard, reOrderCardsFromColumns } from "@/actions/cardActions";
import { onMutateFunction } from "@/app/util/mutations";
import { ColumnClient } from "@/types/clientDataTypes";
import { useState } from "react";
import { column } from "@/constrants/queryKeys";
type MutationOperationProperty = "move" | "delete" | "change-completed";

type MutationProperties = {
    operation: "move";
    cardId: string;
    columnTargetId: string;
    positionCard: number;
    prevCardId: string | undefined;
    nextCardId: string | undefined;
  }
  |
  {
    operation: Exclude<MutationOperationProperty, "move">;
    cardId?: string;
    columnTargetId?: string;
    positionCard?: number;
    prevCardId?: string;
    nextCardId?: string;
  };


export function useMutationCards({ targetColMoveCardKey, card, cardsKey }: { targetColMoveCardKey?: string[], card: CardType, cardsKey?:string[] }) {

  const [completed, setCompleted] = useState(card.completed)
  const [openDialog, setOpenDialog] = useState(false);
  const props = useMutation({
    mutationFn: async ({operation, cardId, columnTargetId, nextCardId, positionCard, prevCardId}:MutationProperties) => {
      switch (operation) {
        case "change-completed":
          return ChangeCompletedCard({ id: card.id })
        case "delete":
          return DeleteCard({ id: card.id })
        case "move":
          return reOrderCardsFromColumns({cardId, columnTargetId, positionCard, nextCardId, prevCardId});
      }
    },
    onMutate: async (variables, context) => {
      if (variables.operation === "move") {
        if (!targetColMoveCardKey) return;
        const actualCardColumnKey = cardsKey ?? column(card.columnId);
        // 1.1 Cancela as requisições ativas para não sobrescrever o cache otimista
        await context.client.cancelQueries({ queryKey: targetColMoveCardKey });
        await context.client.cancelQueries({ queryKey: targetColMoveCardKey });

        // 1.2 Salva o backup dos dois estados para o onError
        const previousSourceState = context.client.getQueryData<ColumnClient>(actualCardColumnKey);
        const previousTargetState = context.client.getQueryData<ColumnClient>(targetColMoveCardKey);

        if (targetColMoveCardKey?.[0] === actualCardColumnKey?.[0] && targetColMoveCardKey?.[1] === actualCardColumnKey?.[1]) {
          context.client.setQueryData<ColumnClient|undefined>(actualCardColumnKey, (old) => {
            if (!old || old.cards.length === 0) return
            const indexCardNewPosition = old.cards.findIndex((actual) => card.id === actual.id);
            const cards = [...old.cards];
            cards[indexCardNewPosition].position = variables.positionCard;
            cards.sort((a, b) => b.position - a.position);
            const cardTarget = old.cardsMap.get(card.id);
            const cardsMap = new Map().set(card.id, {...cardTarget, position:variables.positionCard});
            return { ...old, cards, cardsMap } satisfies ColumnClient;
            })
        } else {
          // 1.3 Altera a coluna DESTINO
          context.client.setQueryData<ColumnClient>(targetColMoveCardKey, (old) => {
            if (!old) return old;
            const targetCard = previousSourceState?.cardsMap.get(variables.cardId) || previousTargetState?.cardsMap.get(variables.cardId);
            if (!targetCard) return old;

            const movedCard = { ...targetCard, position: variables.positionCard, columnId: variables.columnTargetId };
            const filteredCards = old.cards.filter((c) => c.id !== variables.cardId);

            // Ordenação decrescente
            const cardsMove = [...filteredCards, movedCard].sort((a, b) => b.position - a.position);

            const cardsMap = new Map(old.cardsMap);
            cardsMap.set(movedCard.id, movedCard);
            return { ...old, cards: cardsMove, cardsMap };
          });

          // 1.4 Altera a coluna de origem
          context.client.setQueryData<ColumnClient>(actualCardColumnKey, (old) => {
            if (!old) return old;
            const cardsMap = new Map(old.cardsMap);
            cardsMap.delete(variables.cardId);

            const cardsMoveOriginalColumn = old.cards.filter((c) => c.id !== variables.cardId);
            return { ...old, cards: cardsMoveOriginalColumn, cardsMap };
          });
        }

          // 1.5 Retorna os backups para o React Query poder usar no onError
          return { previousSourceState, previousTargetState, targetQueryKey: targetColMoveCardKey };
        }

        // =======================================================
        // 2. OUTROS CASOS: AFETAM SÓ UMA COLUNA (Usa onMutateFunction, SEM async)
        // =======================================================
      return await onMutateFunction<ColumnClient>(context, cardsKey ?? column(card.columnId), (old) => {
        const cardsMap = new Map(old.cardsMap);
        const oldCards = [...old.cards];

        switch (variables.operation) {
          case "delete":
            cardsMap.delete(card.id);
            const cardsDelete = oldCards.filter((target) => target.id !== card.id);
            return { ...old, cardsMap, cards: cardsDelete };

          case "change-completed":
            const oldCard = cardsMap.get(card.id) as CardType;
            const newCard = { ...oldCard, completed: !oldCard?.completed };
            const index = oldCards.findIndex((target) => target.id === card.id);
            oldCards[index] = newCard;
            cardsMap.set(card.id, newCard);
            return { ...old, cardsMap, cards: oldCards };

          default:
            return { ...old, cardsMap, cards: oldCards };
        }
      })
    },
    onSuccess: (data, variables, result, context) => {
      if (variables.operation === "move" || variables.operation === "delete" || !result || !data) return;
      if (!("previousState" in result!)) return;
      if (("reindexed" in data) || !data.id) return;
      const cards = [...result.previousState.cards]
      cards.forEach(((actual) => {
        if (actual.id === data.id) return { ...actual }
      }));
      const cardsMap = new Map(result.previousState.cardsMap).set(data.id, data);

  context.client.setQueryData<ColumnClient>(cardsKey ?? column(card.columnId), { ...result.previousState, cards, cardsMap });

    },
    onError: (error, variables, result, context) => {
      // 1. Reverte o estado local (UI) se foi uma tentativa de completar/descompletar
      if (variables.operation === "change-completed") {
        setCompleted(!completed);
      }

      // Se não houver resultado de backup, não há o que reverter
      if (!result) return;

      // 2. Faz o Rollback do Cache do React Query
      if (variables.operation === "move") {
        // A. Reverte a coluna de origem
        if ("previousSourceState" in result) {
          context.client.setQueryData(cardsKey ?? column(card.columnId), result.previousSourceState);
        }

        // B. Reverte a coluna de destino
        if ("previousTargetState" in result) {
          context.client.setQueryData(result.targetQueryKey, result.previousTargetState);
        }
      } else {
        // C. Reverte as operações de uma única coluna (delete, change-completed)
        // O seu onMutateFunction retorna o backup dentro da propriedade "previousState"
        if ("previousState" in result) {
          context.client.setQueryData(cardsKey ?? column(card.columnId), result.previousState);
        }
      }
    },
  });

  return { ...props, completed, setCompleted, openDialog, setOpenDialog }
}
