"use client";
import { BoardFull, Card } from "@/types/dataTypes";
import { TbChalkboard } from "react-icons/tb";
import BtnInputEditBoardTitle from "./BtnInputEditBoardTitle";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reOrderCardsFromColumns } from "@/actions/actions";
import ColumnBoard from "./ColumnBoard";
import CreateColumnItemBtn from "./CreateColumn";
import { redirect, usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { SortableDraggable } from "@dnd-kit/dom/sortable";
import { AutoScroller, Feedback, type Droppable } from "@dnd-kit/dom";
import { PromiseReturnType } from "@prisma/client/extension";
import { useGetInitialBoard } from "@/hooks/useGetInitialBoard";
import { column } from "@/constrants/queryKeys";
import { ColumnClient } from "@/types/clientDataTypes";
import { Separator } from "@/components/Separator";
import useFloatMenuStorage from "@/hooks/useFloatMenuStorage";

interface Iprops {
  initialData: BoardFull;
}

function clearId(s: string) {
  const newS = s?.replace("card-", "")?.replace("column-", "");
  return newS;
}

interface MutationObjTypeFromOrder {
  columnTargetId: string;
  cardId: string;
  positionCard: number;
  nextCardId: string|undefined;
  prevCardId: string|undefined;
}

const Board = ({ initialData }: Iprops) => {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const refListColumnsBoard = useRef<HTMLUListElement>(null);
  const refFormElement = useRef<HTMLFormElement>(null);
  const [mutationObj, setMutationObj] =
    useState<null | MutationObjTypeFromOrder>(null);

  const storage = useFloatMenuStorage()

  const { data: board, isLoading } = useGetInitialBoard(initialData);
  const { mutate } = useMutation({
    mutationFn: reOrderCardsFromColumns,
    onSuccess: (
      data: PromiseReturnType<typeof reOrderCardsFromColumns>,
      variables,
    ) => {
      if (data?.reindexed) {
        queryClient.invalidateQueries({
          queryKey: column(variables.columnTargetId),
        });
      }
    },
  });

  if (!board) redirect("/home");

  const onReOrderCards = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!mutationObj) return;
    mutate(mutationObj);
  };

  useEffect(() => {
    const hash = window.location.hash;

    if (!hash || isLoading || !board) return;

    const executeScroll = (el: Element) => {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
      router.replace(pathname);
    };

    const elementoImediato = document.querySelector(hash);

    if (elementoImediato) {
      executeScroll(elementoImediato);
      return;
    }

    const callback = (mutations: MutationRecord[], obs: MutationObserver) => {
      const elemento = document.querySelector(hash);
      if (!elemento) return;
      executeScroll(elemento);
      obs.disconnect();
    };

    const observer = new MutationObserver(callback);

    observer.observe(document.body, { subtree: true, childList: true });

    return () => observer.disconnect();
  }, [isLoading, pathname, router, board]);

  return (
    <div style={{display:!storage.openBoard ? "none": undefined}} className="relative shadow-shadow shadow-default bg-primary overflow-hidden  w-full h-full rounded-sm flex flex-col">
      <header className="flex items-center flex-3 basis-15 shrink-0 grow-0 px-8 w-full bg-secondary">
        <div className="flex items-center justify-center gap-2">
          <TbChalkboard size={24} />
          <BtnInputEditBoardTitle id={board.id} title={board.title} />
        </div>
      </header>
      <Separator/>

      <DragDropProvider
        plugins={(defaults) => [
          ...defaults,
          AutoScroller.configure({
            acceleration: 30,
          }),
          Feedback.configure({
            dropAnimation: null})
        ]}

        onDragEnd={(event) => {
          const { source, target } = event.operation as {
            source: SortableDraggable<Card> | null;
            target: Droppable;
          };

          if (!source || !target || event.operation.canceled) {
            console.error("Target ou source não encontrados");
            return;
          }

          const columnTargetId =
            target?.type == "column"
              ? clearId(target.id as string)
              : clearId(target.data.columnId);

          const columnSourceId = clearId(source.group as string);

          const isEqualColumns = columnSourceId === columnTargetId;
          let position = 0;

          if (source.data.id === target?.data?.id) return;
          console.log(target.type);
          //Se houver SourceId && columnTargetId
          if (columnSourceId && columnTargetId) {
            console.log("Início");
            const sourceColumn = queryClient.getQueryData<ColumnClient>([
              "column",
              columnSourceId,
            ])!;
            const targetColumn = !isEqualColumns
              ? queryClient.getQueryData<ColumnClient>(column(columnTargetId))!
              : sourceColumn;

            const targetCard = targetColumn.cards.get(target.data.id);
            const targetKeys = targetColumn.cards.keys();
            let targetIndex = null;
            const length = targetColumn.cards.size;
            for (let i = 0; i < length; i++) {

              const key = targetKeys.next().value;

              if (key === targetCard?.id) {
                targetIndex = i;
                break;
              }
            }
            const ArrayCardsTarget = Array.from(targetColumn.cards.values());

            const currCard = target?.data as Card;
            const prevCard = targetIndex ? ArrayCardsTarget[targetIndex - 1]:null;
            const nextCard = targetIndex ? ArrayCardsTarget[targetIndex + 1]:null;

            const ChangeCard = { ...source.data, columnId: columnTargetId };

            if (target.type === "card") {
              if (!target.shape) {
                console.error("Shape do target não encontrado!");
                return;
              }

              // Se a diferença do y do centro e do mouse estiver acima do y do elemento alvo então é pra mover pra cima senão pra baixo
              const isToMoveCardSourceFromTop =
                target.shape.center.y - event.operation.position.current.y >= 0;

              if (isToMoveCardSourceFromTop) {
                // Se atingir o top de quem está depois dele
                console.log("inicío do if")
                if (prevCard?.id === source.data.id) {
                  return;
                } else if (!prevCard) {
                  position = currCard.position + 100;
                } else {
                  position = (prevCard.position + currCard.position) / 2;
                }
              } else {
                if (source.data.id === nextCard?.id) {
                  return;
                } else if (!nextCard) {
                  position = currCard.position - 100;
                } else {
                  position = (currCard.position + nextCard.position) / 2;
                }
              }

              console.log("initialPosition: ", ChangeCard.position);
              console.log("positionFinal: ", position);

              ChangeCard.position = position;
            }

            const cardsTarget = targetColumn.cards;

            cardsTarget.set(ChangeCard.id, ChangeCard)

            //reordenar os cards pelo position de forma decrescente
            const orderedArray = Array.from(cardsTarget.values()).sort(
              (a, b) => b.position - a.position,
            );
            const cardsTargetSorted = new Map();
            for (let i = 0; i < orderedArray.length; i++) {
              if (!cardsTargetSorted.has(orderedArray[i].id)) {

                cardsTargetSorted.set(orderedArray[i].id, orderedArray[i])

              }
            }

            const oldCardsSource = sourceColumn.cards;
            oldCardsSource.delete(source.data.id);
            const cardsSource = new Map(oldCardsSource);

            queryClient.cancelQueries({
              queryKey: column(targetColumn.id),
            });

            (async function cancelAndSetData() {
              if (cardsSource) {
                await queryClient.cancelQueries({
                  queryKey: column(sourceColumn.id),
                });

                queryClient.setQueryData(column(sourceColumn.id), () => ({
                  ...sourceColumn,
                  cards: cardsSource,
                }));
              }

              queryClient.setQueryData(column(targetColumn.id), () => ({
                ...targetColumn,
                cards: cardsTargetSorted,
              }));
            })();

            setMutationObj({ cardId: source.data.id, columnTargetId, positionCard: position, nextCardId: nextCard?.id, prevCardId: prevCard?.id })
            refFormElement.current?.requestSubmit()

          }
        }}
      >
        <ul
          className="px-8 py-4 flex gap-8 flex-7 shrink-0 w-full overflow-x-auto overflow-y-hidden duration-700 ease-in-out"
          ref={refListColumnsBoard}
        >
          <form onSubmit={onReOrderCards} ref={refFormElement} className="hidden">
            <button type="submit" hidden></button>
          </form>
          {[...board.columns.values()].map((column) => {
            return (
              <ColumnBoard id={column.id} boardId={board.id} key={column.id} />
            );
          })}

          {board && <CreateColumnItemBtn />}
        </ul>
      </DragDropProvider>
    </div>
  );
};

export default Board;
