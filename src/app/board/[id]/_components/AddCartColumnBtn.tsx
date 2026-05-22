"use client";
import { createCartForColumn } from "@/actions/actions";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import LoadingSpinner from "@/components/LoadingSpinner"
import useOutClick from "@/hooks/useOutClick";
import { column } from "@/constrants/queryKeys";
import { ColumnClient } from "@/types/clientDataTypes";
import { onMutateFunction } from "@/app/util/mutations";
import { prependItem } from "@/app/util/manipulationMaps";
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
      return await onMutateFunction<ColumnClient>(context, queryKey, (old) => {
        const oldCards = old.cards;
        const { id, title } = variables;
        const newCards = prependItem<Card>(oldCards,
          { id, title, columnId: old.id, completed: false, position: Infinity },
          (value) => variables.id !== value?.id);

        return { ...old, cards:newCards }

      })
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      if(!onMutateResult) return
      if (!data || !onMutateResult.previousState?.cards || onMutateResult.previousState.cards.has(data?.id)) return;
      const cards = new Map(onMutateResult.previousState.cards);
      const newCards = prependItem(cards, data, (value) => value?.id !== data.id)
      context.client.setQueryData<ColumnClient>(queryKey, {...onMutateResult.previousState, cards:newCards});
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
          onClick={handleClick}
          className="w-full h-8 shadow-shadow shadow-default rounded-xl cursor-pointer hover:bg-text/30 duration-300"
        >
          {children}
        </button>
      ) : (
        <form className="w-full" onSubmit={handleSubmit} ref={refForm}>
          <textarea
            ref={refTextArea}
            name="title_cart"
            id="title_cart"
            placeholder={textForArea}
            className="w-full outline-0 p-2 shadow-shadow shadow-default text-xs rounded-sm resize-y max-h-25 min-h-8 mb-2"
            required
          />
          <div className="w-full flex justify-end gap-2">
            <button
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
