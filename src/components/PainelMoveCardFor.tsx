"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CustomSelect } from "./CustomSelect";
import { board, boards, column, inBoxCards } from "@/constrants/queryKeys";
import { BoardFull, Card } from "@/types/dataTypes";
import { ChangeEvent, useReducer } from "react";
import { ColumnClient, InBoxClient } from "@/types/clientDataTypes";
import { getAllBoardFromUser } from "@/actions/boardActions";
import LoadingSpinner from "./LoadingSpinner";
import { useMutationCards } from "@/hooks/useMutationCards";
import { toast } from "@/app/util/toast";

type ActionsTypes =  "select_board"|"select_column"|"select_card"|"select_column_inbox"
type Action = {
type:ActionsTypes, payload:{id:string, idx:number}
}
type InitialState = {
  board:{boardId:string|null, index:number|null},
  column:{columnId:string|null, index:number|null, isInBox:boolean},
  card:{cardId:string|null, index:number|null},
  boardOptions:[]
  columnOptions:[]
  cardOptions:[]
}
const initialState = {
  board:{boardId:null, index:null},
  column:{columnId:null, index:null, isInBox:false},
  card: {cardId:null, index:null},
  boardOptions: [],
  columnOptions: [],
  cardOptions:[],
} satisfies InitialState

function reducer(state: InitialState, action: Action): InitialState {

  switch (action.type) {
    case "select_board":
      return { ...state, board: { boardId:action.payload.id, index:action.payload.idx } }
    case "select_column":
      return { ...state, column: { columnId:action.payload.id, index:action.payload.idx, isInBox:false}}
    case "select_column_inbox":
      return {...state, column: { columnId:action.payload.id, index:action.payload.idx, isInBox:true}}
    case "select_card":
      return { ...state, card: { cardId:action.payload.id, index:action.payload.idx} }

    default:
      return {...state}
  }
}


export function PainelMoveCardFor({ card, cardsKey }: {card:Card, cardsKey:string[]|undefined}) {
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(reducer, initialState)
  const queryKey = state.column.isInBox ? inBoxCards : column(state?.column.columnId as string);
  const {isPending, mutate} = useMutationCards({card, targetColMoveCardKey:queryKey, cardsKey})
  const { data } = useQuery({ queryKey: boards, queryFn: getAllBoardFromUser });
  const boardsOptions = data ? data.map(({ id: value, title: label }) => ({ value, label })):null;
  const columnInbox = state.board.boardId ? queryClient.getQueryData<InBoxClient>(inBoxCards) : null;
  const columnsArray = state.board.boardId ? (columnInbox && [{ id: columnInbox.id, title: "InBox", order: 100 }] || []).concat(Array.from(queryClient.getQueryData<BoardFull>(board(state?.board.boardId as string))?.columns.values() || [])):null
  const columnsOptions = state.board.boardId ? columnsArray && columnsArray.map(
    ({ id: value, title: label }) => ({value, label})):null
  const cardsArray = state.column.columnId ? (state.column.isInBox ? columnInbox : queryClient.getQueryData<ColumnClient>(column(state.column.columnId as string))):null
  const cardsOptions =  cardsArray && cardsArray?.cards?.length > 0 ?  cardsArray.cards.map(
  ({ id: value }, idx) => ({label:idx.toString(), value })):[{label:"0", value:"null"}]

  const handleBoardSelect = ({ id, idx }:{id:string, idx:number}, ) => {
    dispatch({type: "select_board", payload:{id, idx}})
  }
  const handleColumnSelect = ({ id, idx }: { id: string, idx:number }, ) => {

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
    dispatch({type:"select_card", payload:{id, idx}})
   }

  const onSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    const columnTarget = columnsArray?.[state.column.index as number];
    if (!columnTarget) {
      toast.error("A coluna alvo não foi encontrada.");
      return
    }
    const currentIndex = state.card.index as number;
    const targetCard = cardsArray?.cards?.[currentIndex];
    const prevCard = cardsArray?.cards?.[currentIndex - 1];

    const isFirst = currentIndex === 0;
    const isLast = cardsArray?.cards && currentIndex === cardsArray?.cards?.length - 1;

    let positionCard = 100;
    if (isFirst) {
      // No topo: precisa ser maior que o próximo (que agora está logo abaixo)
      positionCard = targetCard ? targetCard.position + 100 : 100;
    } else if (isLast) {
      // No fundo: precisa ser menor que o anterior (que está logo acima)
      positionCard = prevCard ? prevCard.position - 100 : 100;
    } else if (prevCard && targetCard) {
      // No meio: tira a média entre o card de cima e o de baixo
      positionCard = (prevCard.position + targetCard.position) / 2;
    }
    mutate({
      operation: "move", cardId: card.id, columnTargetId: columnTarget.id,
      nextCardId: targetCard?.id, positionCard: positionCard, prevCardId: prevCard?.id
    })
  }
  return (
    <div className="relative z-1  h-max w-full">
      <form className="h-full w-full flex flex-col gap-4" onSubmit={onSubmit}>
        {boardsOptions && <CustomSelect handleSelect={handleBoardSelect} options={boardsOptions} placeholder="Pesquise um board..." />}
        {columnsOptions &&  state.board.boardId ?
          <CustomSelect handleSelect={handleColumnSelect} options={columnsOptions} placeholder="Pesquise uma coluna..." />
          :
          <div className="default-input opacity-20 h-8 flex items-center">Pesquise uma coluna...</div>
        }
        {cardsOptions && state.column.columnId ?
          <select name="new_position_card" className="bg-accent h-8 shadow-shadow default-shadow focus-primary *:text-inherit font-geist text-sm font-medium text-center rounded-sm" onChange={handleCardSelect} required>
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
        <button type="submit" className="btn-secondary btn-sm focus-primary" disabled={isPending || !state.board.boardId || !state.column.columnId || !state.card.cardId}>
          {isPending ? <LoadingSpinner></LoadingSpinner>:<span>Mover Card</span>}
        </button>
      </form>
    </div>
  )

}
