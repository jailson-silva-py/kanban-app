"use client";
import { createCartForColumnInBox } from "@/actions/actions";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/types/dataTypes";
import LoadingSpinner from "@/components/LoadingSpinner";
import { onMutateFunction } from "@/app/util/mutations";
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
        const cards = [card, ...old.cards]
        const cardsMap = old.cardsMap.set(variables.id, card)
        return {...old, cards, cardsMap}

      })
    },

    onSuccess: (data, variables, result, context) => {
      const queryData = context.client.getQueryData<InBoxClient>(cardsKey);
      if (!data || !queryData) return;
      const cards = queryData.cards;
      const targetIndex = cards.findIndex((target) => target.id == data.id);
      cards[targetIndex] = data
      const cardsMap = queryData.cardsMap;
      context.client.setQueryData<InBoxClient>(cardsKey, {...queryData, cardsMap, cards});
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
    <div className="w-full flex-3 p-4 grow-0 shrink-0" aria-label="content-add-card-inbox">
      {!edition ? (
        <button aria-label="add-card-inbox"
          onClick={() => setEdition(true)}
          className="w-full h-9 shadow-shadow shadow-default rounded-sm cursor-pointer hover:bg-text/30 duration-300"
        >
          {children}
        </button>
      ) : (
        <form className="w-full" onSubmit={handleSubmit}>
          <textarea
            name="title_cart"
            aria-label="title-card-inbox"
            id="title_cart"
            placeholder={textForArea}
            className="w-full outline-0 p-2 shadow-shadow shadow-default text-xs rounded-sm resize-y max-h-25 min-h-8 mb-2"
            required
          />
          <div className="w-full flex justify-end gap-2">
            <button
              aria-label="create-card-inbox"
              type="submit"
              className="btn-primary btn-default focus-primary btn-xs w-20"
            >
              {!isPending ? (
                <span>Adicionar</span>
              ) : (
                <LoadingSpinner size={18} />
              )}
            </button>
            <button
              type="button"
              aria-label="cancel-create-card-inbox"
              onClick={() => setEdition(false)}
              className="btn-primary btn-default focus-primary"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
