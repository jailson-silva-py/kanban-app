"use client";
import { createCartForColumn } from "@/actions/actions";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Column } from "@/types/dataTypes";
import { useClientKeys } from "@/hooks/useClientKeys";
import LoadingSpinner from "./LoadingSpinner";
import useOutClick from "@/hooks/useOutClick";

type Props = {
  children: React.ReactNode;
  textForArea: string;
  column: Column;
};

export const AddCartColumn = ({ children, textForArea, column }: Props) => {
  const { getColumnKey } = useClientKeys();
  const queryKey = getColumnKey(column.id);
  const [edition, setEdition] = useState(false);
  const refForm = useOutClick<HTMLFormElement>(() => setEdition(false));
  const refTextArea = useRef<HTMLTextAreaElement>(null);

  const { mutate, isPending } = useMutation({
    mutationKey: ["card", "create", "column"],
    mutationFn: ({ title, id }: { title: string; id: string }) =>
      createCartForColumn({ column, title, id }),
    onMutate: async (variable, context) => {
      await context.client.cancelQueries({ queryKey });
      const previousCards = context.client.getQueryData<Column>(queryKey);
      context.client.setQueryData(queryKey, (old: Column) => {
        return {
          ...old,
          cards: [{ id: variable.id, title: variable.title }, ...old.cards],
        };
      });
      return { previousCards };
    },
    onError: (_err, _title, result, context) => {
      context.client.setQueryData(queryKey, result?.previousCards);
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
