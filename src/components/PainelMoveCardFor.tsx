"use client";
import { useQuery } from "@tanstack/react-query";
import { CustomSelect } from "./CustomSelect";
import { allColumnsKeyType, boards, column, inBoxCards } from "@/constrants/queryKeys";
import { ChangeEvent, useMemo, useReducer } from "react";
import { getAllBoardFromUser } from "@/actions/boardActions";
import LoadingSpinner from "./LoadingSpinner";
import { useMutationCards } from "@/hooks/useMutationCards";
import { toast } from "@/app/util/toast";
import { useGetColumn } from "@/hooks/useGetColumn";
import { useGetCachedCardsInBox } from "@/hooks/useGetCachedCardsInBox";
import { useQueryCard } from "@/hooks/useQueryCard"
import { useQueryColumn } from "@/hooks/useQueryColumn";
import { useQueryBoard } from "@/hooks/useQueryBoard";
import { useQueryInBox } from "@/hooks/useQueryInBox";
import { logger } from "@/app/util/logger";

type ActionsTypes = "select_board" | "select_column" | "select_card" | "select_column_inbox"
type Action = {
  type: ActionsTypes, payload: { id: string, idx: number }
} | { type: "reset" }
type InitialState = {
  board: { boardId: string | null, index: number | null },
  column: { columnId: string | null, index: number | null, isInBox: boolean },
  card: { cardId: string | null, index: number | null },
}
const initialState = {
  board: { boardId: null, index: null },
  column: { columnId: null, index: null, isInBox: false },
  card: { cardId: null, index: null },
} satisfies InitialState

function reducer(state: InitialState, action: Action): InitialState {

  switch (action.type) {
    case "select_board":
      return { ...state, board: { boardId: action.payload.id, index: action.payload.idx } }
    case "select_column":
      return { ...state, column: { columnId: action.payload.id, index: action.payload.idx, isInBox: false } }
    case "select_column_inbox":
      return { ...state, column: { columnId: action.payload.id, index: action.payload.idx, isInBox: true } }
    case "select_card":
      return { ...state, card: { cardId: action.payload.id, index: action.payload.idx } }
    case "reset":
      return { ...initialState };
    default:
      return { ...state }
  }
}


export function PainelMoveCardFor({ cardId, inBoxKey }: { cardId: string, inBoxKey: allColumnsKeyType | undefined }) {
  const { getCard } = useQueryCard();
  const { getAllColumnsBoard } = useQueryBoard();
  const { getCardsFromColumn, getMovedPositionCard } = useQueryColumn();
  const { getCardsFromInBox } = useQueryInBox();

  const card = getCard(cardId)!;
  const [state, dispatch] = useReducer(reducer, initialState)
  const queryKey = state.column.isInBox ? inBoxCards : column(state?.column.columnId as string);
  const { isPending, mutate } = useMutationCards();
  const { data } = useQuery({ queryKey: boards, queryFn: getAllBoardFromUser });
  const { data: columnInbox, isSuccess: isInBoxSuccess } = useGetCachedCardsInBox({ queryKey: inBoxCards as unknown as string[], enabled: !!state.board.boardId });
  const { data: columnData } = useGetColumn(state.column.columnId as string, state.board.boardId as string, { enabled: !!state.column.columnId && !state.column.isInBox });

  const boardsOptions = useMemo(() => {
    return data ? data.map(({ id: value, title: label }) => ({ value, label })) : null;
  }, [data]);

  const columnsArray = useMemo(() => {
    if (!state.board.boardId) return null;
    const inBoxItem = isInBoxSuccess && columnInbox ? [{ id: columnInbox.id, title: "InBox", order: 100 }] : [];
    const boardColumns = getAllColumnsBoard(state.board.boardId);
    const result = boardColumns ? inBoxItem.concat(boardColumns) : inBoxItem
    return result;

  }, [state.board.boardId, columnInbox, isInBoxSuccess, getAllColumnsBoard, columnData]);

  const columnsOptions = useMemo(() => {
    return columnsArray ? columnsArray.map(({ id: value, title: label }) => ({ value, label })) : null;
  }, [columnsArray]);

  const cardsArray = useMemo(() => {
    if (!state.column.columnId) return null;
    const finalColumn = state.column.isInBox ? columnInbox : columnData
    if (!finalColumn) return null;
    const cards = state.column.isInBox ? getCardsFromInBox() : getCardsFromColumn(finalColumn.id);
    return cards;
  }, [state.column.columnId, state.column.isInBox, columnInbox, columnData, getCardsFromColumn, getCardsFromInBox]);

  const cardsOptions = useMemo(() => {
    if (!cardsArray || cardsArray.length === 0) {
      return [{ label: "0", value: "null" }];
    }
    return cardsArray.map(({ id: value }, idx) => ({ label: idx.toString(), value }));
  }, [cardsArray]);

  const handleBoardSelect = ({ id, idx }: { id: string, idx: number },) => {
    dispatch({ type: "select_board", payload: { id, idx } })
  }

  const handleColumnSelect = ({ id, idx }: { id: string, idx: number },) => {

    if (columnsOptions && columnsOptions.length > 0 && columnsOptions?.[idx].label === "InBox") {
      dispatch({ type: "select_column_inbox", payload: { id, idx } });
      return
    }
    dispatch({ type: "select_column", payload: { id, idx } });
  }
  const handleCardSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    const id = e.target.value;
    const idx = e.target.selectedIndex - 1;
    dispatch({ type: "select_card", payload: { id, idx } })
  }

  const onSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    const columnTarget = columnsArray?.[state.column.index as number];
    if (!columnTarget) {
      toast.error("A coluna alvo não foi encontrada.");
      return
    }
    if (card.id && state.card.cardId && card.id === state.card.cardId) {
      toast.error("A posição atual do cartão é a mesma que a posição alvo.");
      return;
    };
    // A lista tá ordenada em ordem decrescente de posição
    // Portanto, o card atual está na posição `currentIndex` e o anterior está em `currentIndex - 1`
    const currentIndex = state.card.index as number;
    const isEqualColumns = state.column.columnId === card.columnId;
    const isPositionCardGiantTo = cardsArray && cardsArray.length > 0 && card.position > cardsArray?.[currentIndex]?.position;
    const targetIndex = isEqualColumns && isPositionCardGiantTo ? currentIndex + 1 : currentIndex;
    const targetCard = cardsArray?.[targetIndex];
    const movedPosition = getMovedPositionCard(state.column.isInBox ? inBoxCards : column(columnTarget.id), targetIndex)
    const tryPrevCard = cardsArray?.[targetIndex - 1];
    const prevCard = tryPrevCard?.id && tryPrevCard.id !== card.id ? tryPrevCard : cardsArray?.[targetIndex + 1];
    if (!movedPosition) {
      logger.print("PainelMoveCardFor > onSubmit", "error", "A posição do card está undefined");
      return
    }
    mutate({
      operation: "move", cardId: card.id, columnTargetId: columnTarget.id,
      nextCardId: targetCard?.id, positionCard: movedPosition.position, prevCardId: prevCard?.id,
      targetIndex: currentIndex, inBoxKey: state.column.isInBox ? inBoxCards : undefined,
    }, {
      onSettled: () => {
        dispatch({ type: "reset" });

      }
    })
  }
  return (
    <div className="relative z-1  h-max w-full">
      <form className="h-full w-full flex flex-col gap-4" onSubmit={onSubmit}>
        {boardsOptions && boardsOptions?.length > 0 && <CustomSelect handleSelect={handleBoardSelect} options={boardsOptions} placeholder="Pesquise um board..." />}
        {columnsOptions && columnsOptions.length > 0 && state.board.boardId ?
          <CustomSelect handleSelect={handleColumnSelect} options={columnsOptions} placeholder="Pesquise uma coluna..." />
          :
          <div className="default-input opacity-20 h-8 flex items-center">Pesquise uma coluna...</div>
        }
        {cardsOptions && cardsOptions?.length > 0 && state.column.columnId ?
          <select name="new_position_card" defaultValue={state.card.cardId || ""} className="bg-accent h-8 shadow-shadow default-shadow focus-primary *:text-inherit font-geist text-sm font-medium text-center rounded-sm" onChange={handleCardSelect} required>
            <option value="">--Selecione uma opção--</option>
            {cardsOptions.length > 0 ?
              cardsOptions.map(({ value: id, label: text }) => (<option value={id} key={id}>{text}</option>))
              :
              <p className="btn-sm btn-primary focus-secondary">Selecione a posição:</p>
            }
          </select>
          :
          <div className="default-input opacity-20 h-8 flex items-center">Selecione a posição:</div>
        }
        <button type="submit" className="btn-secondary btn-sm focus-primary flex items-center justify-center" disabled={isPending || !state.board.boardId || !state.column.columnId || !state.card.cardId}>
          {isPending ? <LoadingSpinner></LoadingSpinner> : <span>Mover Card</span>}
        </button>
      </form>
    </div>
  )

}
