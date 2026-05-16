"use client";
import { createCartForColumnInBox } from "@/actions/actions";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/types/dataTypes";
import { useClientKeys } from "@/hooks/useClientKeys";
import LoadingSpinner from "./LoadingSpinner";

type Props = {
  children: React.ReactNode;
  textForArea: string;
};

export const AddCartInBox = ({ children, textForArea }: Props) => {
  const { cardsKey } = useClientKeys();
  const queryClient = useQueryClient();
  const [edition, setEdition] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: (title: string) => createCartForColumnInBox(title),
    onMutate: async (title) => {
      await queryClient.cancelQueries({ queryKey: cardsKey });
      const previousCards = queryClient.getQueryData<{ cards: Card[] }>(
        cardsKey,
      );
      queryClient.setQueryData(cardsKey, (old: { cards: Card[] }) => {
        return {
          cards: [...old.cards, { id: crypto.randomUUID(), title }],
        };
      });
      return { previousCards };
    },
    onError: (_err, _title, context) => {
      queryClient.setQueryData(cardsKey, context?.previousCards);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cardsKey });
    },
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title_cart") as string;
    mutate(title);
  };

  return (
    <div className="w-full flex-3 p-4 grow-0 shrink-0">
      {!edition ? (
        <button
          onClick={() => setEdition(true)}
          className="w-full h-8 shadow-shadow shadow-default rounded-xl cursor-pointer hover:bg-text/30 duration-300"
        >
          {children}
        </button>
      ) : (
        <form className="w-full" onSubmit={handleSubmit}>
          <textarea
            name="title_cart"
            id="title_cart"
            placeholder={textForArea}
            className="w-full outline-0 p-2 shadow-shadow shadow-default text-xs rounded-sm resize-y max-h-25 min-h-8 mb-2"
            required
          />
          <div className="w-full flex justify-end gap-2">
            <button
              type="submit"
              className="flex items-center justify-center btn-default w-20 bg-btn hover:brightness-120"
            >
              {!isPending ? (
                <span>Adicionar</span>
              ) : (
                <LoadingSpinner size={18} />
              )}
            </button>
            <button
              type="button"
              onClick={() => setEdition(false)}
              className="btn-default hover:bg-text/30"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
