"use client";
import { createCartForColumnInBox } from "@/actions/actions";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/types/dataTypes";
import LoadingSpinner from "@/components/LoadingSpinner";
import { onMutateFunction } from "@/app/util/mutations";
import { prependItem } from "@/app/util/manipulationMaps";
import { InBoxClient } from "@/types/clientDataTypes";


type Props = {
  children: React.ReactNode;
  textForArea: string;
};

export const AddCartInBox = ({ children, textForArea }: Props) => {
  const cardsKey = ["inBoxCards"]
  const [edition, setEdition] = useState(false);
  const { mutate, isPending } = useMutation({
    mutationKey: ["card", "create", "inbox"],
    mutationFn: ({ title, id }: { title: string; id: string }) =>
      createCartForColumnInBox({ title, id }),
    onMutate: (variables, context) => {

      return onMutateFunction<InBoxClient>(context, cardsKey, (old) => {

        const card: Card = { ...variables, columnId:old.id, completed: false, position: Infinity }
        const newCards = prependItem<Card>(old.cards, card, (value) => value?.id !== card.id)
        return {...old, cards:newCards}

      })
    },

    onSuccess: (data, variables, result, context) => {
      if (!data || !result?.previousState?.id) return;
      const previous = result?.previousState.cards ?? new Map();
      const cards = prependItem<Card>(previous, data, (value) => value?.id !== data.id)

      context.client.setQueryData<InBoxClient>(cardsKey, {id:result?.previousState.id, cards});
    },

    onError: (_err, _title, result, context) => {
      if (!result?.previousState) return;
      context.client.setQueryData(cardsKey, result?.previousState);
    },
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title_cart") as string;
    const id = crypto.randomUUID();
    mutate({ id, title });
  };

  return (
    <div className="w-full flex-3 p-4 grow-0 shrink-0">
      {!edition ? (
        <button
          onClick={() => setEdition(true)}
          className="w-full h-9 shadow-shadow shadow-default rounded-xl cursor-pointer hover:bg-text/30 duration-300"
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
