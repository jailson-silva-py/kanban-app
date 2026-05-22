"use client";
import { ChangeCompletedCard, DeleteCard } from "@/actions/actions";
import { Card as CardType } from "@/types/dataTypes";
import { useMutation } from "@tanstack/react-query";
import { useState, memo } from "react";
import { TbCheck } from "react-icons/tb";
import DropdownMenuWithDots from "./DropdownMenuWithDots";
import { useSortable } from "@dnd-kit/react/sortable";
import { onMutateFunction } from "@/app/util/mutations";
import { ColumnClient } from "@/types/clientDataTypes";

type CardProps = {
  card: CardType;
  cardsKey?:string[];
} & React.ComponentProps<"li">;

const Card: React.FC<CardProps> = ({ card, cardsKey, ...props }) => {
  const queryKey = ['column', card.columnId];
  const [completed, setCompleted] = useState(card.completed);
  const { ref, isDragging, isDropTarget } = useSortable({
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

        const old_cards = old.cards

        if (variables.isDeletion) {

          old_cards.delete(card.id)

          const cards = new Map(old_cards);

          return { ...old, cards }

        }

        const oldCard = old_cards.get(card.id) as CardType
        const newCard = { ...oldCard, completed: !oldCard?.completed }
        old_cards.set(card.id, newCard)
        const cards = new Map(old_cards)
        return { ...old, cards }
        });

    },

    onError: (error, variables, result, context) => {
      setCompleted(!completed);
      context.client.setQueryData(cardsKey ?? queryKey, result?.previousState);
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
      id={`card-${card.id}`}
      style={{
        boxShadow: completed
          ? "var(--shadow-bottom-left-size) oklch(from var(--color-success) l c h / 0.3), var(--shadow-default-size) oklch(from var(--color-success) l c h / 0.3)"
          : "var(--shadow-default-size) oklch(from var(--color-shadow) l c h / 0.1)",
        border: isDropTarget ? "solid var(--color-text) 1px" : undefined,
      }}
      className="relative shrink-0 group w-full flex items-center gap-2 min-h-4 bg-primary px-4 py-2 rounded-lg text-sm font-light font-geist cursor-pointer hover:-top-0.5 ease-out opacity-100 animate-[toDown_.4s_ease-out_backwards]"
      {...props}
      ref={ref}
      data-dragging={isDragging}
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
            type="checkbox"
            name="card_completed"
            id="card_completed"
            checked={completed}
            onChange={handleChangeCompleted}
            className="absolute cursor-pointer z-1 w-full h-full opacity-0"
            disabled={isPending}
          />
          {completed && <TbCheck size={16} />}
        </div>
      </form>
      <p className="wrap-break-word text-ellipsis leading-7 line-clamp-4 hyphens-auto">
        {card.title}
      </p>
      <DropdownMenuWithDots>
        <DropdownMenuWithDots.Item>
          <form onSubmit={onChangeIsComplete} className="h-max full">
            <button
              type="submit"
              className="p-1 w-full h-7 button-ghost hover:bg-text/20 rounded-lg"
            >
              {completed ? "Retomar" : "Concluir"}
            </button>
          </form>
        </DropdownMenuWithDots.Item>

        <DropdownMenuWithDots.Item>
          <form onSubmit={onChangeDeleteCard} className="h-max full">
            <button
              type="submit"
              className="flex justify-center items-center p-1 w-full h-7 button-ghost hover:bg-error/20 rounded-lg"
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
