"use client";
import { createCartForColumnInBox } from "@/actions/actions";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/types/dataTypes";
import LoadingSpinner from "@/components/LoadingSpinner";
import { InBoxClient } from "@/types/clientDataTypes";
import { useQueryCard } from "@/hooks/useQueryCard";
import { useQueryInBox } from "@/hooks/useQueryInBox";
import { toast } from "@/app/util/toast";


type Props = {
  children: React.ReactNode;
  textForArea: string;
};

export const AddCartInBox = ({ children, textForArea }: Props) => {
  const inBoxKey = ["inBoxCards"]
  const { setCard } = useQueryCard();
  const { createCardInBox, setInBox, getInBox, removeCardInBox } = useQueryInBox();
  const [edition, setEdition] = useState(false);
  const { mutate, isPending } = useMutation({
    mutationKey: ["card", "create", "inbox"],
    mutationFn: ({ title, id }: { title: string; id: string }) =>
      createCartForColumnInBox({ title, id }),
    onMutate: async (variables, context) => {
      await context.client.cancelQueries({ queryKey: inBoxKey });
      const queryData = getInBox();
      if (!queryData) return
      const card: Card = { columnId: queryData.id, completed: false, position: Infinity, ...variables }
      createCardInBox(card);
      return { previousState: queryData }
    },

    onSuccess: async (data, variables, result, context) => {
      const queryData = context.client.getQueryData<InBoxClient>(inBoxKey);
      if (!data || !queryData) {
        if (!queryData?.id) {
          await context.client.invalidateQueries({ queryKey: inBoxKey })
        }
        return
      };
      setCard(data.id, data);
    },
    onError: (_err, variables, result) => {
      if (!result?.previousState) return;
      setInBox(result.previousState);
      removeCardInBox(variables.id)
      toast.error("Não foi possível criar o card.");
    },
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title_cart") as string;
    const id = crypto.randomUUID();
    mutate({ id, title });
  };

  const handleClose = () => { setEdition(false) }
  const handleOpen = () => { setEdition(true) }

  return (
    <div className="w-full flex-3 p-4 grow-0 shrink-0" aria-label="content-add-card-inbox">
      {!edition ? (
        <button aria-label="add-card-inbox" onClick={handleOpen}
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
              className="flex items-center justify-center btn-secondary btn-default focus-primary w-20"
              disabled={isPending}
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
              onClick={handleClose}
              className="flex items-center justify-center btn-primary btn-default focus-secondary w-20"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
