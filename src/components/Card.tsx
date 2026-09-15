"use client";
import { Card as CardType } from "@/types/dataTypes";
import { memo, MouseEvent} from "react";
import { TbCheck } from "react-icons/tb";
import DropdownMenuWithDots from "./DropdownMenuWithDots";
import { useSortable } from "@dnd-kit/react/sortable";
import { useMutationCards } from "@/hooks/useMutationCards";
import Dialog from "./Dialog";
import { PainelMoveCardFor } from "./PainelMoveCardFor";

type CardProps = {
  card: CardType;
  cardsKey?:string[];
} & React.ComponentProps<"li">;

const Card: React.FC<CardProps> = ({ card, cardsKey, ...props }) => {
  const { ref, isDragging, isDropping, isDropTarget } = useSortable({
    id: `card-${card.id}`,
    index: card.position,
    type: "card",
    accept: "card",
    group: `column-${card.columnId}`,
    data: card,
  });
  const { isPending, mutate, completed, setCompleted, openDialog, setOpenDialog } = useMutationCards({card, cardsKey});

  const onChangeIsComplete = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCompleted((prev) => !prev);
    mutate({ operation: "change-completed" });
  };

  const onChangeDeleteCard = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate({ operation: "delete" });
  };

  const handleOpenDialog = (e: MouseEvent) => {
    e.preventDefault();
    setOpenDialog(true);
  }

  const handleChangeCompleted = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.currentTarget.form?.requestSubmit();
  };

  return (
    <li
      aria-label="card"
      style={{border:isDropTarget ? "1px solid white":""}}
      className="relative shrink-0 group w-full flex items-center gap-2 min-h-4 bg-secondary shadow-shadow shadow-default px-4 py-2 rounded-sm text-xs font-light font-geist cursor-pointer hover:-top-0.5 ease-out"
      {...props}
      ref={ref}
      data-dragging={isDragging}
      data-dropping={isDropping}
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
          {completed && <TbCheck size={16} role="img" aria-label="completed-svg"/>}
        </div>
      </form>
      <p className="wrap-break-word text-ellipsis leading-7 line-clamp-4 hyphens-auto">
        {card.title}
      </p>
      <DropdownMenuWithDots>
        <DropdownMenuWithDots.Item>
          <form onSubmit={onChangeIsComplete} className="h-max full">
            <button
              aria-label="completed-card-btn"
              type="submit"
              className="p-1 w-full h-7 btn-ghost hover:bg-text/20 rounded-sm"
            >
              {completed ? "Retomar" : "Concluir"}
            </button>
          </form>
        </DropdownMenuWithDots.Item>

        <DropdownMenuWithDots.Item>
          <form onSubmit={onChangeDeleteCard} className="h-max full">
            <button
              aria-label="delete-card-btn"
              type="submit"
              className="flex justify-center items-center p-1 w-full h-7 btn-ghost hover:bg-error/20 rounded-sm"
              disabled={isPending}
            >
              <span>Deletar</span>
            </button>
          </form>
        </DropdownMenuWithDots.Item>
        <DropdownMenuWithDots.Item>
          <button className="flex justify-center items-center p-1 w-full h-7 btn-ghost rounded-sm" onClick={handleOpenDialog}>
            Mover
          </button>
        </DropdownMenuWithDots.Item>
      </DropdownMenuWithDots>
    <Dialog state={openDialog} setState={setOpenDialog}>
      <PainelMoveCardFor card={card} cardsKey={cardsKey}/>
    </Dialog>
    </li>
  );
};

export default memo(Card);
