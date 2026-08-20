"use client";
import { ChangeCompletedCard, DeleteCard } from "@/actions/actions";
import { Card as CardType } from "@/types/dataTypes";
import { useMutation } from "@tanstack/react-query";
import { useState, memo} from "react";
import { TbCheck } from "react-icons/tb";
import DropdownMenuWithDots from "./DropdownMenuWithDots";
import { useSortable } from "@dnd-kit/react/sortable";
import { onMutateFunction } from "@/app/util/mutations";
import { ColumnClient } from "@/types/clientDataTypes";
import { column } from "@/constrants/queryKeys";

type CardProps = {
  card: CardType;
  cardsKey?:string[];
} & React.ComponentProps<"li">;

const Card: React.FC<CardProps> = ({ card, cardsKey, ...props }) => {
  const queryKey = column(card.columnId);
  const [completed, setCompleted] = useState(card.completed);
  const { ref, isDragging, isDropping, isDropTarget } = useSortable({
    id: `card-${card.id}`,
    index: card.position,
    type: "card",
    accept: "card",
    group: `column-${card.columnId}`,
    data: card,
  });
  const { isPending, mutate } = useMutation({
    mutationFn: async ({
      isDeletion,
    }: {
      isDeletion: boolean;
    }): Promise<CardType | null> => {
      if (isDeletion) {
        await DeleteCard({ id: card.id });
        return null;
      }
      return await ChangeCompletedCard({ id: card.id });
    },
    onMutate: async (variables, context) => {

      return await onMutateFunction<ColumnClient>(context, cardsKey ?? queryKey, (old) => {

        const cardsMap = new Map(old.cardsMap);
        const oldCards = [...old.cards];

        if (variables.isDeletion) {

          cardsMap.delete(card.id);
          const cards = oldCards.filter((target) => target.id !== card.id);
          return { ...old, cardsMap, cards }

        }

        const oldCard = cardsMap.get(card.id) as CardType
        const newCard = { ...oldCard, completed: !oldCard?.completed }

        const index = oldCards.findIndex((target) => target.id == card.id);
        oldCards[index] = newCard;
        cardsMap.set(card.id, newCard)
        return { ...old, cardsMap, cards:oldCards }
        });

    },

    onError: (error, variables, result, context) => {
      setCompleted(!completed);
      context.client.setQueryData(cardsKey ?? queryKey, () => ({...result?.previousState}));
    },
  });

  const onChangeIsComplete = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCompleted(!completed);
    mutate({ isDeletion: false });
  };

  const onChangeDeleteCard = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate({ isDeletion: true });
  };

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
      </DropdownMenuWithDots>
    </li>
  );
};

export default memo(Card);
