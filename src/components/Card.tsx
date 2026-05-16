"use client";
import { ChangeCompletedCard, DeleteCard } from "@/actions/actions";
import { useClientKeys } from "@/hooks/useClientKeys";
import { Card as CardType, Column } from "@/types/dataTypes";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { TbCheck } from "react-icons/tb";
import DropdownMenuWithDots from "./DropdownMenuWithDots";

type CardProps = {
  card: CardType;
  cardsKey?: (string | undefined)[];
} & React.ComponentProps<"li">;

const Card: React.FC<CardProps> = ({ card, cardsKey, ...props }) => {
  const queryKey = useClientKeys().getColumnKey(card.columnId);
  const [completed, setCompleted] = useState(card.completed);

  const { isPending, mutate } = useMutation({
    mutationFn: async ({
      isDeletion,
    }: {
      isDeletion: boolean;
    }): Promise<CardType | null> => {
      if (isDeletion) {
        DeleteCard({ id: card.id });
        return null;
      }
      return ChangeCompletedCard({ id: card.id });
    },
    onMutate: (variables, context) => {
      context.client.cancelQueries({ queryKey: cardsKey ?? queryKey });
      const previousColumn = context.client.getQueryData<Column>(
        cardsKey ?? queryKey,
      );
      if (!previousColumn?.cards || previousColumn?.cards?.length <= 0)
        return null;

      const newColumn = { ...previousColumn };

      if (variables.isDeletion) {
        newColumn.cards = previousColumn?.cards?.filter(
          (curr) => curr.id !== card.id,
        );
      } else {
        const c = newColumn.cards?.findIndex((curr) => curr.id === card.id);
        newColumn.cards[c] = {
          ...newColumn.cards[c],
          completed: !newColumn.cards[c]?.completed,
        };
      }

      context.client.setQueryData(cardsKey ?? queryKey, newColumn);

      return { previousColumn, newColumn };
    },
    onError: (error, variables, result, context) => {
      setCompleted(!completed);
      context.client.setQueryData(cardsKey ?? queryKey, result?.previousColumn);
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

  console.log(card.title, completed);
  return (
    <li
      style={{
        boxShadow: completed
          ? "var(--shadow-bottom-left-size) oklch(from var(--color-success) l c h / 0.3), var(--shadow-default-size) oklch(from var(--color-success) l c h / 0.3)"
          : "var(--shadow-default-size) oklch(from var(--color-shadow) l c h / 0.1)",
      }}
      className="relative shrink-0 group w-full flex items-center gap-2 min-h-4 bg-primary px-4 py-2 rounded-lg text-sm font-light font-geist  cursor-pointer hover:-top-0.5 ease-out"
      {...props}
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
            checked={card.completed}
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
              className="p-1 w-full h-7 button-ghost hover:bg-error/20 rounded-lg"
            >
              Deletar
            </button>
          </form>
        </DropdownMenuWithDots.Item>
      </DropdownMenuWithDots>
    </li>
  );
};

export default Card;
