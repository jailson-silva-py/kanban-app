"use client";
import { memo, MouseEvent, useEffect, useRef, useState } from "react";
import { TbCheck } from "react-icons/tb";
import DropdownMenuWithDots from "../../../../components/DropdownMenuWithDots";
import { useMutationCards } from "@/hooks/useMutationCards";
import Dialog from "../../../../components/Dialog";
import { PainelMoveCardFor } from "../../../../components/PainelMoveCardFor";
import { Card as CardType } from "@/types/dataTypes";
import { column, type inBoxCards } from "@/constrants/queryKeys";
import { useGetCard } from "@/hooks/useGetCard";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter"
import { useQueryColumn } from "@/hooks/useQueryColumn";
import { logger } from "@/app/util/logger";
import { ButtonGhost } from "@/components/ButtonGhost";

type CardProps = {
  id: string;
  inBoxKey?: typeof inBoxCards;
  index: number;
} & React.ComponentProps<"li">;

type CardContentProps = {
  card: CardType;
  inBoxKey?: typeof inBoxCards;
  index: number;
} & React.ComponentProps<"li">;

const CardContent: React.FC<CardContentProps> = ({ card, inBoxKey, index, ...props }) => {

  const [completed, setCompleted] = useState(card.completed);
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLLIElement | null>(null)
  const { getMovedPositionCard } = useQueryColumn()
  const { isPending, mutate, openDialog, setOpenDialog } = useMutationCards();
  const onChangeIsComplete = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCompleted((prev) => !prev);
    mutate({ operation: "change-completed", cardId: card.id });
  };

  const onChangeDeleteCard = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate({ operation: "delete", cardId: card.id });
  };

  const handleOpenDialog = (e: MouseEvent) => {
    e.preventDefault();
    setOpenDialog(true);
  }

  const handleChangeCompleted = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.currentTarget.form?.requestSubmit();
  };

  useEffect(() => {

    const el = ref.current;

    if (!el) return

    return draggable({
      element: el,
      onDragStart: () => {
        setDragging(true)
      },
      getInitialData: () => ({ index, cardId: card.id, inBoxKey, columnId: card.columnId }),
      onDrop: ({ location }) => {
        const target = location.current.dropTargets?.[0];
        if (!target) {
          logger.print("Card -> CardContentt -> useEffect > draggable -> onDrop", "error", "Elemenento target não encontrado!");
          setDragging(false);
          return;
        };

        const columnTargetkey = target.data.inBoxKey as typeof inBoxCards || column(target.data.columnId as string);
        const objMoved = getMovedPositionCard(
          columnTargetkey,
          target.data.index as number,
        );
        if (!objMoved) {
          logger.print("Card -> CardContentt -> useEffect > draggable -> onDrop", "error", "Objeto de movedPosition nulo ou não definido!");
          return
        }

        mutate({
          cardId: card.id, operation: "move", columnTargetId: target.data.columnId as unknown as string,
          targetIndex: target.data.index as number, inBoxKey, nextCardId: objMoved?.nextCardId, prevCardId: objMoved?.prevCardId,
          positionCard: objMoved?.position, targetInBoxKey: target.data.inBoxKey as typeof inBoxCards,
        })

        setDragging(false);
      }
    })

  }, [index, card.columnId, card.position, inBoxKey])

  return (
    <li
      {...props}
      style={{ opacity: dragging ? "50%" : undefined }}
      ref={ref}
      aria-label="card"
      className="relative shrink-0 group w-full flex items-center gap-2 min-h-4 bg-secondary shadow-shadow shadow-default px-4 py-2 rounded-sm text-xs font-light font-geist cursor-pointer hover:-top-0.5 ease-out"
    >
      <form onSubmit={onChangeIsComplete}>
        <div
          className={`${completed ? "flex" : "hidden"} relative group-hover:flex p-1 items-center justify-center rounded-full w-5 h-5 shadow-shadow shadow-default has-[*:hover]:scale-105 transition-all duration-300`}
          style={{
            backgroundColor: completed
              ? "oklch(from var(--color-success) l c h / 0.3)"
              : "transparent",
          }}
        >
          <input
            aria-label="checkbox-completed-card"
            type="checkbox"
            name="card_completed"
            id="card_completed"
            checked={completed}
            onChange={handleChangeCompleted}
            className="absolute cursor-pointer z-1 w-full h-full opacity-0"
            disabled={isPending}
          />
          {completed && <TbCheck size={16} role="img" aria-label="completed-svg" />}
        </div>
      </form>
      <p lang="pt-BR" className="text-xs leading-5 line-clamp-4  text-pretty text-justify break-all hyphens-auto" draggable={false}>
        {card?.title}
      </p>
      <p>{card?.position}</p>
      <DropdownMenuWithDots>
        <DropdownMenuWithDots.Item>
          <form onSubmit={onChangeIsComplete} className="h-max full">
            <ButtonGhost
              aria-label="completed-card-btn"
              type="submit"
            >
              {completed ? "Retomar" : "Concluir"}
            </ButtonGhost>
          </form>
        </DropdownMenuWithDots.Item>

        <DropdownMenuWithDots.Item>
          <form onSubmit={onChangeDeleteCard} className="h-max full">
            <ButtonGhost
              mode="delete"
              aria-label="delete-card-btn"
              type="submit"
              disabled={isPending}
            >
              <span>Deletar</span>
            </ButtonGhost>
          </form>
        </DropdownMenuWithDots.Item>
        <DropdownMenuWithDots.Item>
          <ButtonGhost onClick={handleOpenDialog}>
            Mover
          </ButtonGhost>
        </DropdownMenuWithDots.Item>
      </DropdownMenuWithDots>
      <Dialog state={openDialog} setState={setOpenDialog}>
        <PainelMoveCardFor cardId={card.id} inBoxKey={inBoxKey} />
      </Dialog>
    </li>
  );
};



export function Card({ id, inBoxKey, index, ...props }: CardProps) {

  const { data: card } = useGetCard(id);
  if (!card) return;
  return <CardContent {...props} card={card} inBoxKey={inBoxKey} index={index} />

}

export default memo(Card);
