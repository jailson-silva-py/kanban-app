"use client";
import { useMutation } from "@tanstack/react-query";
import { ChangeCompletedCard, DeleteCard, reOrderCardsFromColumns } from "@/actions/cardActions";
import { ColumnClient, InBoxClient } from "@/types/clientDataTypes";
import { useState } from "react";
import { column, inBoxCards, card as cardKey } from "@/constrants/queryKeys";
import { useQueryCard } from "./useQueryCard";
import { useQueryInBox } from "./useQueryInBox";
import { useQueryColumn } from "./useQueryColumn";
import { toast } from "@/app/util/toast";
import { logger } from "@/app/util/logger";
type MutationOperationProperty = "move" | "delete" | "change-completed";

type MutationProperties = {
  operation: "move";
  cardId: string;
  columnTargetId: string;
  positionCard: number;
  prevCardId: string | undefined;
  nextCardId: string | undefined;
  targetIndex: number;
  inBoxKey?: typeof inBoxCards,
  targetInBoxKey?: typeof inBoxCards,
}
  |
{
  operation: Exclude<MutationOperationProperty, "move">;
  cardId: string;
  columnTargetId?: string;
  positionCard?: number;
  prevCardId?: string;
  nextCardId?: string;
  targetIndex?: number;
  inBoxKey?: typeof inBoxCards,
  targetInBoxKey?: typeof inBoxCards,
};


/**
 * Executa mutations de cards e mantém o cache otimista sincronizado.
 * Recebe os dados da operação em `mutate` e retorna a API de `useMutation`,
 * além do estado do diálogo usado para mover um card.
 */
export function useMutationCards() {
  const { getCard, setCard } = useQueryCard()
  const { getInBox, removeCardInBox } = useQueryInBox()
  const { computePositionCard, getMovedPositionCard, getColumn, removeCard } = useQueryColumn()
  const [openDialog, setOpenDialog] = useState(false);
  const props = useMutation({
    mutationFn: async ({ operation, cardId, columnTargetId, positionCard, prevCardId, nextCardId }: MutationProperties) => {
      switch (operation) {
        case "change-completed":
          return ChangeCompletedCard({ id: cardId })
        case "delete":
          return DeleteCard({ id: cardId })
        case "move":
          return reOrderCardsFromColumns({ cardId, columnTargetId, positionCard, nextCardId, prevCardId });
      }
    },
    onMutate: async ({ columnTargetId, inBoxKey, cardId, targetInBoxKey, ...variables }, context) => {
      const targetColMoveCardKey = targetInBoxKey || column(columnTargetId as string)
      const card = getCard(cardId);
      if (!card) return;

      // Retorna os backups para o React Query poder usar no onError
      const previousSourceState = inBoxKey ? getInBox() : getColumn(card.columnId);
      const previousTargetState = context.client.getQueryData<ColumnClient | InBoxClient>(targetColMoveCardKey);
      if (variables.operation === "move") {
        if (!targetColMoveCardKey) {
          const prefix = "useMutationCards -> onMutate"
          logger.print(prefix, "error", "Coluna alvo não encontrada")
          return
        };

        // Cancela as requisições ativas para não sobrescrever o cache optimistic
        await context.client.cancelQueries({ queryKey: targetColMoveCardKey });
        await context.client.cancelQueries({ queryKey: inBoxKey ? inBoxCards : column(card.id) });
        computePositionCard(targetColMoveCardKey, inBoxKey || column(card.columnId), variables.targetIndex, variables.positionCard, cardId);


        return { previousSourceState, previousTargetState };

      }
      //Caso for só em uma coluna
      switch (variables.operation) {
        case "delete":
          if (!inBoxKey) {
            removeCard(cardId, card.columnId);
            break;
          }
          removeCardInBox(card.id)
          break;

        case "change-completed":
          setCard(card.id, { completed: !card.completed });
          break;
      }

      console.log("Posição correta do card é: ");
      return { previousState: card }
    },

    onSuccess: async (data, { inBoxKey, cardId, columnTargetId, targetInBoxKey, ...variables }, result, context) => {
      const targetColMoveCardKey = inBoxKey || column(columnTargetId as string);
      const card = getCard(cardId);
      if (!card) return;
      if (data && "reindexed" in data && data.reindexed === true) {
        await context.client.invalidateQueries({ queryKey: targetColMoveCardKey });
        return
      };

      if (variables.operation === "delete" || !data) return;
      if (variables.operation === "move") {
        const targetColumn = targetInBoxKey ? getInBox() : getColumn(columnTargetId as string);
        const sourceColumn = inBoxKey ? getInBox() : getColumn(card.columnId);
        const cardInTargetColumn = targetColumn?.cardIds.includes(cardId);
        const cardNotInSourceColumn = !sourceColumn?.cardIds.includes(cardId);
        const isCorrectPosition = card.position === variables.positionCard;

        //Apenas logando possíveis erros pra ajudar no debug
        logger.wrapperFn(() => {
          const prefix = "useMutationCard -> onSucess: Mutation Check";
          if (!cardInTargetColumn) logger.print(prefix, "warning", "Card não está na coluna de destino");
          if (cardNotInSourceColumn) logger.print(prefix, "warning", "Card não está na coluna de origem");
          if (!isCorrectPosition) logger.print(prefix, "warning", "Card não está com a posição correta");
        })

      }
    },
    onError: (error, { inBoxKey, cardId, columnTargetId, ...variables }, result, context) => {
      const targetColMoveCardKey = inBoxKey || column(columnTargetId as string)
      const card = getCard(cardId);
      if (!card) return;
      if (!result?.previousSourceState && !result?.previousState && !result?.previousTargetState) return;
      // 1. Reverte o estado local (UI) se foi uma tentativa de completar/descompletar
      if (variables.operation === "change-completed") {
        toast.error("Ocorreu um erro ao completar/descompletar o card.");
        return;
      }

      // Se não houver resultado de backup, não há o que reverter
      if (!result) return;

      // 2. Faz o Rollback do Cache do React Query
      if (variables.operation === "move") {
        // A. Reverte a coluna de origem
        if (result.previousSourceState) {
          const sourceColumnKey = inBoxKey || column(result.previousSourceState.id);
          context.client.setQueryData<ColumnClient | InBoxClient>(sourceColumnKey, { ...result.previousSourceState });
        }

        // B. Reverte a coluna de destino
        if (result.previousTargetState) {
          context.client.setQueryData<ColumnClient | InBoxClient>(targetColMoveCardKey!, result.previousTargetState);
        }
        toast.error("Não foi possível mover o card");
        return
      } else {
        // C. Reverte as operações de uma única coluna (delete, change-completed)
        // O seu onMutateFunction retorna o backup dentro da propriedade "previousState"
        if (variables.operation === "delete") {
          toast.error("Houve um erro ao deletar card.");
        }

        if (result.previousState) {
          setCard(cardId, card);
        }

      }
    },
  });

  return { ...props, openDialog, setOpenDialog }
}
