"use client";
import { BoardFull, Card, Column } from "@/types/dataTypes";
import { TbChalkboard } from "react-icons/tb";
import BtnInputEditBoardTitle from "./BtnInputEditBoardTitle";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useClientKeys } from "@/hooks/useClientKeys";
import { getBoardById, reOrderCardsFromColumns } from "@/actions/actions";
import ColumnBoard from "./ColumnBoard";
import CreateColumnItemBtn from "./CreateColumn";
import { redirect, usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { SortableDraggable } from "@dnd-kit/dom/sortable";
import { AutoScroller, type Droppable } from "@dnd-kit/dom";
import { PromiseReturnType } from "@prisma/client/extension";

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
  nextCardId: string;
  prevCardId: string;
}

const Board = ({ initialData }: Iprops) => {
  const queryKey = useClientKeys().getBoardKey(initialData.id);
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const refListColumnsBoard = useRef<HTMLUListElement>(null);

  const { data: board, isLoading } = useQuery({
    initialData,
    queryKey,
    queryFn: () => getBoardById(initialData.id),
  });

  const { mutate } = useMutation({
    mutationFn: async ({
      columnTargetId,
      cardId,
      positionCard,
      nextCardId,
      prevCardId,
    }: MutationObjTypeFromOrder) => {
      const result = await reOrderCardsFromColumns({
        cardId,
        columnTargetId,
        positionCard,
        nextCardId,
        prevCardId,
      });

      return result;
    },
    onSuccess: (
      data: PromiseReturnType<typeof reOrderCardsFromColumns>,
      variables,
    ) => {
      if (data?.reindexed) {
        queryClient.invalidateQueries({
          queryKey: ["column", variables.columnTargetId],
        });
      }
    },
  });

  if (!board) redirect("/home");

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
    <div className=" shadow-shadow shadow-default bg-secondary/30  overflow-hidden h-full flex-4 rounded-xl flex flex-col gap-4">
      <header className="flex items-center flex-3 basis-15 shrink-0 grow-0 px-8 w-full bg-secondary/10">
        <div className="flex items-center justify-center gap-2">
          <TbChalkboard size={24} />
          <BtnInputEditBoardTitle id={board.id} title={board.title} />
        </div>
      </header>
      <DragDropProvider
        plugins={(defaults) => [
          ...defaults,
          AutoScroller.configure({
            acceleration: 100,
          }),
        ]}
        onDragEnd={(event) => {
          const { source, target } = event.operation as {
            source: SortableDraggable<Card> | null;
            target: Droppable;
          };
          // O único draggable é o card, ou seja, source.type==="card"

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

          //Se houver SourceId && columnTargetId
          if (columnSourceId && columnTargetId) {
            const sourceColumn = queryClient.getQueryData<Column>([
              "column",
              columnSourceId,
            ])!;
            const targetColumn = !isEqualColumns
              ? queryClient.getQueryData<Column>(["column", columnTargetId])!
              : sourceColumn;

            const targetIndex = targetColumn.cards.findIndex(
              (value) => value.id === target.data.id,
            );
            const currCard = target?.data as Card;
            const prevCard = targetColumn.cards?.[targetIndex - 1];
            const nextCard = targetColumn.cards?.[targetIndex + 1];

            if (target.type === "card" && 1 + 1 === 3) return;

            const sourceCardsSet = new Set();

            const targetCardsSet = new Set();

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
                // Se atiingir o top de quem está depois dele
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

              ChangeCard.position = position;
            }

            const cardsTarget: Card[] = [
              { ...ChangeCard },
              ...targetColumn.cards,
            ].filter((card) => {
              if (targetCardsSet.has(card.id)) {
                return false;
              }
              targetCardsSet.add(card.id);
              return true;
            });

            //reordenar os cards pelo position de forma decrescente
            cardsTarget.sort((a, b) => b.position - a.position);

            // Adicionando o Card em Draggable no Set pra excluí-lo da própria coluna
            sourceCardsSet.add(clearId(source.group as string));

            const cardsSource = !isEqualColumns
              ? sourceColumn.cards.filter((card) => {
                  if (
                    sourceCardsSet.has(card.id) ||
                    targetCardsSet.has(card.id)
                  ) {
                    return false;
                  }
                  sourceCardsSet.add(card.id);
                  return true;
                })
              : null;

            queryClient.cancelQueries({
              queryKey: ["column", targetColumn.id],
            });

            (async function cancelAndSetData() {
              if (cardsSource) {
                await queryClient.cancelQueries({
                  queryKey: ["column", sourceColumn.id],
                });

                queryClient.setQueryData(["column", sourceColumn.id], () => ({
                  ...sourceColumn,
                  cards: cardsSource as Card[],
                }));
              }

              queryClient.setQueryData(["column", targetColumn.id], () => ({
                ...targetColumn,
                cards: cardsTarget,
              }));
            })();

            mutate({
              cardId: ChangeCard.id,
              columnTargetId,
              nextCardId: nextCard?.id,
              positionCard: position,
              prevCardId: prevCard?.id,
            });
          }
        }}
      >
        <ul
          className="px-8 py-4 flex gap-8 flex-7 shrink-0 w-full scroll-smooth overflow-x-auto overflow-y-hidden duration-700 ease-in-out"
          ref={refListColumnsBoard}
        >
          {board?.columns?.map((column) => {
            return (
              <ColumnBoard
                id={column.id}
                key={column.id}
                initialData={{ boardId: board.id, ...column, cards: [] }}
              />
            );
          })}

          {board && (
            <CreateColumnItemBtn boardId={board.id} columns={board.columns} />
          )}
        </ul>
      </DragDropProvider>
    </div>
  );
};

export default Board;
