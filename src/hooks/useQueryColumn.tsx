import { allColumnsKeyType, column as columnKey, columnsBoard, inBoxCards, prefixKeysFromDynamic } from "@/constrants/queryKeys";
import { ColumnClient } from "@/types/clientDataTypes";
import { card as cardKey } from "@/constrants/queryKeys";
import { Card as CardType, Column } from "@/types/dataTypes";
import { logger } from "@/app/util/logger";
import { useQueryCard } from "./useQueryCard";

/**
 * Manipula colunas, cards e os índices relacionados no cache do React Query.
 * Os métodos que alteram uma coluna também sincronizam `columns-board`, quando
 * essa lista já estiver em cache, sem criar cache parcial quando ela não existir.
 */
export function useQueryColumn() {
  const { setCard, queryClient } = useQueryCard();

  const createCardsInitialData = (columnData: Column) => {
    const cards = columnData.cards
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      queryClient.setQueryData(cardKey(card.id), { ...card })
    }
  }

  const createColumnClient = (columnData: Column) => {
    const cardIds = columnData.cards.map(({ id }) => id);
    const { cards: _, ...data } = columnData;
    const columnClient = { ...data, cardIds } satisfies ColumnClient
    return columnClient
  }

  const getColumn = (columnId: string) => {
    const column = queryClient.getQueryData<ColumnClient>(
      columnKey(columnId),
    );
    if (!column) return null;
    return column;
  };

  const getCardsFromColumn = (columnId: string) => {
    const column = queryClient.getQueryData<ColumnClient>(
      columnKey(columnId),
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
  };

  const setColumn = (columnId: string, columnData: Partial<ColumnClient>) => {
    queryClient.setQueryData<ColumnClient>(columnKey(columnId), (old) => {
      if (!old) return;
      return { ...old, ...columnData };
    });
  };

  const createCard = (columnId: string, cardData: CardType) => {
    const column = queryClient.getQueryData<ColumnClient>(
      columnKey(columnId),
    );
    if (!column) return;
    const cardIds = [cardData.id, ...column.cardIds];

    queryClient.setQueryData<ColumnClient[]>(columnsBoard(column.boardId), (old) => {
      if (!old) return;
      const newColumns = [...old];
      for (let i = 0; i < newColumns.length; i++) {
        const thisColumn = newColumns[i];
        if (thisColumn.id !== columnId) continue;
        newColumns[i] = { ...thisColumn, cardIds: [...cardIds] }
      }
      return [...newColumns]
    })

    queryClient.setQueryData<ColumnClient>(columnKey(columnId), (old) => {
      if (!old) return;
      return { ...old, cardIds: [...cardIds] };
    });

    queryClient.setQueryData<CardType>(cardKey(cardData.id), cardData);

  };

  const removeCard = (cardId: string, columnId: string) => {
    const column = queryClient.getQueryData<ColumnClient>(columnKey(columnId));

    queryClient.setQueryData<ColumnClient[]>(columnsBoard(column?.boardId as string), (old) => {
      if (!old) return;
      const newColumns = [...old];
      for (let i = 0; i < newColumns.length; i++) {
        const thisColumn = newColumns[i];
        if (thisColumn.id !== columnId) continue;
        newColumns[i] = { ...thisColumn, cardIds: [...thisColumn.cardIds.filter((thisCardId) => thisCardId !== cardId)] }
      }
      return [...newColumns]
    })

    queryClient.setQueryData<ColumnClient>(columnKey(columnId), (old) => {
      if (!old) return;
      const cardIds: string[] = [];
      for (let i = 0; i < old.cardIds.length; i++) {
        if (old.cardIds[i] !== cardId) cardIds.push(old.cardIds[i]);
      }
      return {
        ...old,
        cardIds,
      };
    });
    queryClient.removeQueries({ queryKey: cardKey(cardId), exact: true });
  };

  /** Atualiza os cardIds de uma coluna também na lista resumida do board. */
  const setCardIdsInBoard = (columnId: string, boardId: string, cardIds: string[]) => {
    queryClient.setQueryData<ColumnClient[]>(columnsBoard(boardId), (old) => {
      if (!old) return old;
      return old.map((thisColumn) => thisColumn.id === columnId
        ? { ...thisColumn, cardIds: [...cardIds] }
        : thisColumn);
    });
  };

  const removeCardsById = (cardIds: string[], columnId: string) => {

    for (let i = 0; i < cardIds.length; i++) {
      const id = cardIds[i];
      removeCard(id, columnId)
    }
  };

  const removeAllCardsFromColumn = (columnId: string) => {
    const column = queryClient.getQueryData<ColumnClient>(columnKey(columnId));
    if (!column) return;
    queryClient.removeQueries({
      queryKey: [prefixKeysFromDynamic.card], exact: false, predicate: ({ state: { data } }) => {
        if (data) {
          return (data as CardType)?.columnId == columnId
        }
        return false
      }
    })
  }

  const getMovedPositionCard = (
    columnTargetKey: allColumnsKeyType,
    targetIndex: number,
  ) => {
    const GAP_POSITION = 100;
    const prefix = "useQueryColumn -> getMovedPositionCard";
    const columnTarget = queryClient.getQueryData<ColumnClient>(columnTargetKey);

    if (!columnTarget) {
      logger.print(prefix, "error", "A coluna alvo não foi encontrada!");
      return;
    }

    //Pra quando no dnd, o usuário soltar o draggable no último target. diminui -1 porque o valor === length era apenas pra saber
    //Se era para inserir no final do array ou não.
    const trueIndex = targetIndex >= columnTarget.cardIds.length ? targetIndex - 1 : targetIndex;
    const originalCardsTarget = columnTarget.cardIds;

    const nextCardIndex = trueIndex + 1;
    const prevCardIndex = trueIndex - 1;
    const targetCardId = originalCardsTarget[trueIndex];

    const nextCardId = originalCardsTarget[nextCardIndex];
    const prevCardId = originalCardsTarget[prevCardIndex];
    const nextCard = nextCardId ? queryClient.getQueryData<CardType>(cardKey(nextCardId)) : null;
    const prevCard = prevCardId ? queryClient.getQueryData<CardType>(cardKey(prevCardId)) : null;
    const targetCard = queryClient.getQueryData<CardType>(cardKey(targetCardId));


    const initialObj = { nextCardId, prevCardId };
    if (!targetCard) {
      if (columnTarget.cardIds.length === 0) {
        return { nextCardId: undefined, prevCardId: undefined, position: GAP_POSITION };
      }
      logger.print(prefix, "error", "O card alvo não foi encontrado na lista de Ids da coluna alvo");
      return null;
    }
    if (!nextCard && !prevCard) return { ...initialObj, position: GAP_POSITION };
    else if (!nextCard && prevCard || prevCard && nextCard) {
      //
      if (originalCardsTarget.length === targetIndex) {
        return { ...initialObj, position: targetCard.position - GAP_POSITION }
      }

      return { ...initialObj, position: (targetCard.position + prevCard.position) / 2 };

    }

    else if (!prevCard && nextCard) return { ...initialObj, position: targetCard.position + GAP_POSITION };

  }

  const computePositionCard = (
    columnTargetKey: allColumnsKeyType,
    columnSourceKey: allColumnsKeyType,
    targetIndex: number,
    positionCard: number,
    cardId: string,
  ) => {


    const isInBoxKeyEquals = columnSourceKey[0] === inBoxCards[0] && columnTargetKey[0] === inBoxCards[0];
    const isColumnKeyEquals = columnSourceKey[0] === prefixKeysFromDynamic.column && columnTargetKey[0] === prefixKeysFromDynamic.column && columnSourceKey[1] === columnTargetKey[1];

    const isEqualColumnKey = isInBoxKeyEquals || isColumnKeyEquals;
    const prefixCompute = "useQueryColumn -> computePositionCard";
    const card = queryClient.getQueryData<CardType>(cardKey(cardId));
    if (!card) {
      logger.print(prefixCompute, "error", "O card com a chave passada não foi encontrado!");
      return;
    }
    const columnTarget = queryClient.getQueryData<ColumnClient>(
      columnTargetKey,
    );
    const columnSource = queryClient.getQueryData<ColumnClient>(
      columnSourceKey,
    );
    if (!columnTarget) {
      logger.print(prefixCompute, "error", "A coluna alvo não foi encontrada!");
      return;
    }
    if (!columnSource) {
      logger.print(prefixCompute, "error", "A coluna de origem não foi encontrada!");
      return;
    }

    const newCard = {
      ...card,
      columnId: columnTarget.id,
      position: positionCard,
    };

    setCard(cardId, newCard);

    let newCardIdsTarget: string[] = isEqualColumnKey ? [...columnTarget.cardIds.filter((thisId) => thisId !== cardId)] : [...columnTarget.cardIds];
    const newCardIdsSource = isEqualColumnKey ? [...columnSource.cardIds] : [
      ...columnSource.cardIds.filter((thisId) => thisId !== cardId),
    ];

    //Com targetIndex como 0 e sem sem nenhum elemento no array da coluna alvo,
    //Quer dizer que está indo pra uma coluna vazia: Early return pra economizar recursos
    if (targetIndex === 0 && columnTarget.cardIds.length === 0) {

      queryClient.setQueryData<ColumnClient>(
        columnTargetKey,
        (old) => {
          if (!old) {
            logger.print(
              prefixCompute + " -> setQueryData (columnTargetId)",
              "warning",
              "A coluna target não foi atualizada optimisticamente.",
            );
            return;
          }
          const cardIds = new Array(cardId);
          return { ...old, cardIds };
        },
      );

      queryClient.setQueryData<ColumnClient>(
        columnSourceKey,
        (old) => {
          if (!old) return;
          const cardIds = [...newCardIdsSource];

          return {
            ...old,
            cardIds,
          };
        },
      );

      setCardIdsInBoard(columnTarget.id, columnTarget.boardId, [cardId]);
      if (columnSource.id !== columnTarget.id) {
        setCardIdsInBoard(columnSource.id, columnSource.boardId, newCardIdsSource);
      }

    }


    const originalIndex = columnTarget.cardIds.indexOf(cardId);


    const lastIndex = newCardIdsTarget.length - 1;
    const arrLength = isEqualColumnKey ? newCardIdsTarget.length + 1 : newCardIdsTarget.length;
    const trueIndex = isEqualColumnKey && originalIndex < targetIndex || targetIndex === lastIndex && isColumnKeyEquals && originalIndex < targetIndex ? targetIndex - 1 : targetIndex;

    // Se o targetIndex for menor que o índice original do card quando for a mesma coluna
    // Subtrai -1 porque sua movimentação nos índices posteriores do array vai fazê-los cair
    // quando ele  for removido do array de cardIds da coluna alvo
    if (targetIndex === 0) newCardIdsTarget = [cardId, ...newCardIdsTarget];
    else if (targetIndex === arrLength) newCardIdsTarget.push(cardId);

    else newCardIdsTarget = [...newCardIdsTarget.slice(0, trueIndex), cardId, ...newCardIdsTarget.slice(trueIndex)];


    queryClient.setQueryData<ColumnClient>(
      columnTargetKey,
      (old) => {
        if (!old) {
          logger.print(
            prefixCompute + " -> setQueryData (columnTargetId)",
            "warning",
            "A coluna target não foi atualizada optimisticamente.",
          );
          return;

        }
        return { ...old, cardIds: [...newCardIdsTarget] };
      },
    );

    setCardIdsInBoard(columnTarget.id, columnTarget.boardId, newCardIdsTarget);

    if (isEqualColumnKey) return;

    queryClient.setQueryData<ColumnClient>(
      columnSourceKey,
      (old) => {

        if (!old) return;

        return {
          ...old,
          cardIds: [...newCardIdsSource],
        };
      },
    );
    setCardIdsInBoard(columnSource.id, columnSource.boardId, newCardIdsSource);
  };


  return {
    queryClient,
    getColumn,
    getCardsFromColumn,
    setColumn,
    createCard,
    removeCard,
    removeAllCardsFromColumn,
    getMovedPositionCard,
    computePositionCard,
    removeCardsById,
    createCardsInitialData,
    createColumnClient
  };
}