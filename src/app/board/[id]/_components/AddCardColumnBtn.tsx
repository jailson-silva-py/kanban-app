"use client";
import { createCartForColumn } from "@/actions/actions";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import LoadingSpinner from "@/components/LoadingSpinner"
import useOutClick from "@/hooks/useOutClick";
import { column } from "@/constrants/queryKeys";
import { ColumnClient } from "@/types/clientDataTypes";
import { onMutateFunction } from "@/app/util/mutations";
import { Card } from "@/types/dataTypes";

type Props = {
  children: React.ReactNode;
  textForArea: string;
  columnId: string;
};

export const AddCartColumn = ({ children, textForArea, columnId }: Props) => {

  const queryKey = column(columnId)
  const [edition, setEdition] = useState(false);
  const refForm = useOutClick<HTMLFormElement>(() => setEdition(false));
  const refTextArea = useRef<HTMLTextAreaElement>(null);

  const { mutate, isPending } = useMutation({
    mutationKey: ["card", "create", "column"],
    mutationFn: ({ title, id }: { title: string; id: string }) =>
      createCartForColumn({ columnId, title, id }),
    onMutate: async (variables, context) => {
      //Set Data da Query é feita no onMutateFunci
      return onMutateFunction<ColumnClient>(context, queryKey, (old) => {
        const card: Card = { ...variables, columnId: old.id, completed: false, position: Infinity }
        const cards = [card, ...old.cards]
        const cardsMap = old.cardsMap.set(variables.id, card)
        return { ...old, cards, cardsMap }

      })
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      const queryData = context.client.getQueryData<ColumnClient>(queryKey)
      if (!queryData || !data) return
      const { cards, cardsMap } = queryData;
      const indexTarget = cards.findIndex((target) => target.id === data.id);
      cards[indexTarget] = data
      context.client.setQueryData<ColumnClient>(queryKey, {...queryData, cards, cardsMap});
    },
    onError: (_err, _title, result, context) => {
      context.client.setQueryData(queryKey, result?.previousState);
    },
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title_cart") as string;
    const id = crypto.randomUUID();
    mutate({ id, title });
    e.currentTarget.reset();
  };

  const handleClick = () => {
    setEdition(true);
  };

  useEffect(() => {
    if (!edition || !refTextArea.current) return;
    refTextArea.current.focus();
  }, [edition]);

  return (
    <div className="w-full flex-2 p-4 grow-0">
      {!edition ? (
        <button
          aria-label="add-card"
          onClick={handleClick}
          className="w-full h-8 shadow-shadow shadow-default rounded-sm cursor-pointer hover:bg-text/30 duration-300"
        >
          {children}
        </button>
      ) : (
        <form className="w-full" onSubmit={handleSubmit} ref={refForm} aria-label="add-card-form">
          <textarea
            ref={refTextArea}
            name="title_cart"
            aria-label="title-card"
            id="title_cart"
            placeholder={textForArea}
            className="w-full outline-0 p-2 shadow-shadow shadow-default text-xs rounded-sm resize-y max-h-25 min-h-8 mb-2"
            required
          />
          <div className="w-full flex justify-end gap-2" aria-label="add-card">
              <button
              aria-label="create-card"
              type="submit"
              className="flex items-center justify-center btn-default bg-btn hover:brightness-120 w-20"
            >
              {isPending ? (
                <LoadingSpinner size={18} />
              ) : (
                <span>Adicionar</span>
              )}
            </button>
            <button
              type="submit"
              aria-label="create-cancel"
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
