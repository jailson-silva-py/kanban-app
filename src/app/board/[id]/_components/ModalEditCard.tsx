"use client";
import { Card, CardComment } from "@/types/dataTypes";
import Image from "next/image";
import React, { ChangeEventHandler, SubmitEventHandler, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { TbAlignJustified, TbCheck, TbMessageCircle, TbTypography, TbX } from "react-icons/tb";
import { ButtonToTextAreaForm } from "./ButtonToTextAreaForm";
import { PlaceButtonToTextArea } from "./PlaceButtonToTextArea";
import { createCommentCard, deleteCommentCard, editCommentCard, editDescriptionCard, editTitleCard, getCommentsByCardId } from "@/actions/cardActions";
import { logger } from "@/app/util/logger";
import { InfiniteData, useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useQueryCard } from "@/hooks/useQueryCard";
import { toast } from "@/app/util/toast";
import { cardComment, card as cardKey } from "@/constrants/queryKeys";
import { useSession } from "next-auth/react";
import { User } from "next-auth";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useMutationCards } from "@/hooks/useMutationCards";

type ModalEditCardProps = {

  card: Card,
  isOpen: boolean,
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
  isPending: boolean,
  onChangeIsComplete: SubmitEventHandler,
  completed: boolean,
  handleChangeCompleted: ChangeEventHandler,

}

type CommentsQueryData = InfiniteData<{
  comments: CardComment[];
  nextCursor: string | null;
}>

export function ModalEditCard({ card, isOpen, setIsOpen }: ModalEditCardProps) {

  const handleCloseModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);
  }

  return (
    isOpen ?
      createPortal(

        <div className="z-12 fixed left-0 top-0 h-screen w-screen bg-primary/20 font-geist">
          <div className="absolute left-1/2 top-1/2 -translate-1/2 bg-accent w-9/10 max-h-8/10 max-w-250 h-full min-h-100 rounded-md shadow-default shadow-shadow">
            <button onClick={handleCloseModal} className="absolute right-2 top-2 p-1 rounded-md bg-accent hover:bg-text/10 cursor-pointer"
              aria-label="btn-close-modal">
              <TbX size={32} className="text-text"></TbX>
            </button>

            <div className="w-full h-full px-4 py-2 md:px-8 pt-8 md:py-12 flex flex-col gap-4 overflow-y-auto">
              <div className="flex flex-col gap-2 group w-full gap-x-2">
                <TitleFieldComponent card={card} />
                <CompletedFormButton cardId={card.id} initialState={card.completed} />
              </div>
              <DescriptionFieldComponent card={card} />
              <CommentFieldComponent card={card} />
              <ListComments cardId={card.id} />
            </div>

          </div>
        </div>,
        document.body)
      :
      <></>
  )
}


const TitleFieldComponent = ({ card }: { card: Card }) => {

  const { setCard, getCard } = useQueryCard()
  const { mutateAsync } = useMutation({
    mutationFn: editTitleCard,
    onMutate: async ({ cardId, title }) => {
      const previousState = getCard(cardId);
      setCard(cardId, { title });
      return { previousState }
    },
    onError: (error, { cardId }, result) => {

      toast.error("Ocorreu um erro ao atualizar o título da tarefa!");
      if (!result?.previousState) return;
      setCard(cardId, result.previousState);
    }
  })

  const onSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget);
    const title = formData.get("edit-title")?.toString();

    if (!title) {
      logger.print("ModalEditCard -> TitleFieldComponent -> onSubmit", "error", "Campo referente ao título do formulário de título não encontrado!");
      return;
    }
    try {
      await mutateAsync({ cardId: card.id, title });
    } catch {
      // A mutation exibe o erro ao usuário e restaura o cache em onError.
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center font-rethink font-medium">
        <TbTypography size={24} />
        <span className="text-start text-sm break-all hyphens-auto text-pretty" lang="pt-BR">Título</span>
      </div>
      <PlaceButtonToTextArea defaultValue={card.title} name="edit-title" onSubmit={onSubmit} placeholder="Digite um título" textBtn={card.title} />
    </div>
  )

}

const CompletedFormButton = ({ cardId, initialState }: { cardId: string, initialState: boolean }) => {
  const [completed, setCompleted] = useState(initialState);
  const { mutate, isPending } = useMutationCards();

  const onSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const previousCompleted = completed;
    setCompleted(!previousCompleted);
    mutate({ cardId, operation: "change-completed" }, {
      onError: () => setCompleted(previousCompleted),
    });
  }

  return (
    <form onSubmit={onSubmit} title="Marcar como concluído / Não concluído" aria-label="form-completed">
      <button type="submit" disabled={isPending} className={`flex gap-2 items-center w-40 justify-center btn-sm btn-ghost shadow-default shadow-shadow
      ${completed ? "shadow-success/30" : ""}`} aria-label="btn-submit-completed-form">
        <div className={`size-5 rounded-full ${completed ? "bg-success/30" : "bg-shadow"} flex items-center justify-center shadow-shadow shadow-default`}>
          <TbCheck size={14} />
        </div>
        <p className="font-medium">{completed ? "Concluído" : "Não Concluído"}</p>
        {isPending && <LoadingSpinner size={18} role="img" aria-label="loading-completed" />}
      </button>
    </form>
  )

}

const DescriptionFieldComponent = ({ card }: { card: Card }) => {

  const { queryClient, setCard, getCard } = useQueryCard()
  const { mutateAsync } = useMutation({
    mutationFn: editDescriptionCard,
    onMutate: async ({ cardId, description }) => {
      await queryClient.cancelQueries({ queryKey: cardKey(cardId), exact: true })
      const previousState = getCard(cardId);
      setCard(cardId, { description });
      return { previousState }
    },
    onError: (error, { cardId }, result) => {

      toast.error("Ocorreu um erro ao atualizar a descrição da tarefa!");
      if (!result?.previousState) return;
      setCard(cardId, result.previousState);
    }
  })

  const onSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const description = formData.get("edit-description")?.toString();
    if (!description) {
      logger.print("ModalEditCard -> DescriptionFieldComponent -> onSubmit", "error", "Valor do campo da descrição não encontrado,\
      verifique se está presente no DOM.");
      return;
    }
    try {
      await mutateAsync({ cardId: card.id, description });
    } catch {
      // A mutation exibe o erro ao usuário e restaura o cache em onError.
    }
  }

  return (

    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        <TbAlignJustified size={24} className="text-color" />
        <span className="text-sm">Descrição</span>
      </div>
      <PlaceButtonToTextArea defaultValue={card.description || ""} name="edit-description" onSubmit={onSubmit} placeholder="Descreva a tarefa em detalhes ..."
        textBtn={card.description || "Descreva a tarefa em detalhes ..."} />
    </div>
  )

}

const CommentFieldComponent = ({ card }: { card: Card }) => {

  const queryKey = cardComment(card.id);
  const { data: session } = useSession();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ body, cardId, id, user }: { body: string, cardId: string, id: string, user: User }) => createCommentCard({ body, cardId, id }),
    onMutate: async ({ body, cardId, id, user }, context) => {
      await context.client.cancelQueries({ queryKey, exact: true });
      const previousState = context.client.getQueryData<CommentsQueryData>(queryKey);
      context.client.setQueryData<CommentsQueryData>(queryKey, (old) => {

        const array: CardComment[] = [];
        array.push({ body, id, createdAt: new Date(), owner: { id: user.id!, image: user.image!, name: user.name! } });
        if (!old) return;
        if (old.pages[0].comments.length > 0) array.push(...old.pages[0].comments)
        const oldFirstPage = old.pages[0];
        const pages = [{ comments: array, nextCursor: oldFirstPage?.nextCursor || null }, ...old.pages.slice(1)]
        return { ...old, pages: pages }

      })
      return { previousState }
    },

    onError: (error, _, result, context) => {
      toast.error("Não foi possível adicionar um comentário. Tente novamente.");
      if (!result?.previousState) return;
      context.client.setQueryData(queryKey, result?.previousState);
    },
    onSuccess: (data, { id }, result, context) => {

      context.client.setQueryData<CommentsQueryData>(queryKey, (old) => {

        const array: CardComment[] = [];
        array.push(data);
        if (!old) return;
        if (old.pages[0].comments.length > 0) array.push(...old.pages[0].comments.filter((comment) => comment.id !== id))

        const oldFirstPage = old.pages[0];
        const pages = [{ comments: array, nextCursor: oldFirstPage?.nextCursor || null }, ...old.pages.slice(1)]
        return { ...old, pages: pages }

      })
    }
  })

  const onSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const id = crypto.randomUUID();
    const formData = new FormData(e.currentTarget);
    const body = formData.get("add-comment")?.toString();
    if (!session?.user) return;
    if (!body) {
      logger.print("ModalEditCard -> CommentFieldComponent -> onSubmit", "error", "O campo do body da tarefa não foi encontrado no FormData, \
        verifique se o name do campo está correto ou se está presente no DOM.")
      return;
    }
    try {
      await mutateAsync({ body, cardId: card.id, id, user: session.user });
    } catch {
      // A mutation exibe o erro ao usuário e restaura o cache em onError.
    }
  }

  return (

    <div className="flex flex-col gap-4">
      <div className="flex gap-2 items-center">
        <TbMessageCircle size={24} className="text-text" />
        <span className="text-sm">Comentários</span>
      </div>
      <ButtonToTextAreaForm defaultValue="" name="add-comment" onSubmit={onSubmit} placeholder="Faça um comentário relevante ..." />
    </div>

  )

}


const ListComments = ({ cardId }: { cardId: string }) => {

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const { data, isPending, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: cardComment(cardId), queryFn: async ({ pageParam }) => {
      const result = await getCommentsByCardId({ cardId, cursorId: pageParam });

      return result
    },

    initialPageParam: undefined as string | undefined, getNextPageParam: (lastPage) => {
      return lastPage.nextCursor
    },
  })


  useEffect(() => {
    const el = loadMoreRef.current;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && !isFetchingNextPage && !isPending && hasNextPage) {
        fetchNextPage()
      }

    }, { threshold: 1.0 })
    if (el) {
      observer.observe(el);
    }

    return () => observer.disconnect();

  }, [hasNextPage, isFetchingNextPage])

  const dataFormater = Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "long" });
  const allComments = useMemo(() => data?.pages.flatMap((page) => page.comments), [data]);

  return (
    <ul>

      {allComments?.map(comment => (
        <li key={comment.id} className={`relative py-2 px-2 border-b border-shadow ${comment.owner.id === session?.user.id ? "rounded-md bg-primary/30 border border-t-0" : ""}`}
          aria-label="item-comment">

          <div className="flex gap-2 items-center text-[10px] h-8">
            <div className="relative size-6 rounded-full overflow-hidden">
              <Image src={comment.owner.image || "/default-avatar.webp"} className="object-cover" loading="eager" alt={`avatar-user-${comment.owner.name}`} fill sizes="100%, 100%" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[8px]">{dataFormater.format(comment.createdAt)}</span>
              <span className="text-[10px]">{comment.owner.name}</span>
            </div>

          </div>
          <div>
            <p className="text-xs">{comment.body}</p>
          </div>

          {comment.owner.id === session?.user.id ? <div className="flex gap-1">
            <EditFormComment comment={comment} cardId={cardId} />
            <DeleteFormComment idComment={comment.id} cardId={cardId} />
          </div>
            :
            <></>
          }
        </li>
      ))}
      {isFetchingNextPage || isPending ? Array.from({ length: 10 }, (_, index) => (
        <li key={index} className="relative py-2 px-2 border-b border-shadow gap-4 animate-pulse " aria-label="item-skeleton-comment">

          <div className="flex gap-2 items-center text-[10px] h-8 w-full">
            <div className="size-6 rounded-full bg-shadow">
            </div>
            <div className="flex flex-col gap-1 justify-center grow max-w-75">
              <div className="w-50 h-2 bg-shadow rounded-sm" />
              <div className="w-full h-4 bg-shadow rounded-sm" />
            </div>

          </div>
        </li>
      ))
        : <></>}
      <div ref={loadMoreRef} className="h-8 bg-transparent w-full" />
    </ul>
  )

}

const DeleteFormComment = ({ idComment: id, cardId }: { idComment: string, cardId: string }) => {
  const queryKey = cardComment(cardId);
  const [deletionMode, setDeletionMode] = useState(false);
  const { mutate, isPending } = useMutation({
    mutationFn: deleteCommentCard,
    onMutate: async ({ id }, context) => {
      await context.client.cancelQueries({ queryKey });
      const previousState = context.client.getQueryData<CommentsQueryData>(queryKey);
      context.client.setQueryData<CommentsQueryData>(queryKey, (old) => {
        if (!old) return;
        const newPages: CommentsQueryData = { ...old, pages: [...old.pages.map(page => ({ ...page, comments: [...page.comments] }))], pageParams: [...old.pageParams] };
        let targetPage = 0;
        for (targetPage; targetPage < old.pages.length; targetPage++) {

          const actualPage = newPages.pages[targetPage];
          const deletedCommentIndex = actualPage.comments.findIndex((thisValue) => thisValue.id === id);
          if (deletedCommentIndex !== -1) {
            newPages.pages[targetPage].comments = [...newPages.pages[targetPage].comments.filter((_, index) => index !== deletedCommentIndex)]
            return { ...newPages }
          }
        }
        return { ...old }
      })
      return { previousState }
    },
    onError: (error, _, result, context) => {
      toast.error("Não foi possível apagar o comentário. Tente novamente!");
      if (!result?.previousState) {
        logger.print("ModalEditCard -> DeleteFormComment", "error", "Previous State não possui valor definido. Veja se é retornado no onMutate.");
        return;
      }
      context.client.setQueryData<CommentsQueryData>(queryKey, result.previousState);
    }
  })
  const handleShowForm = (e: React.MouseEvent) => {
    e.preventDefault();
    setDeletionMode(true);
  }
  const onReset: React.ReactEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setDeletionMode(false);
  }

  const onSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    mutate({ id }, { onSuccess: () => setDeletionMode(false) })

  }
  return (
    <>
      {!deletionMode ?
        <button type="submit" onClick={handleShowForm} className="w-max h-6 text-start underline text-[10px] hover:font-semibold cursor-pointer"
          aria-label="btn-delete-form-comment">
          Excluir
        </button>
        :

        <form onReset={onReset} onSubmit={onSubmit} className="px-4 absolute w-full h-full inset-0 bg-accent flex flex-col items-start justify-center gap-2"
          aria-label="form-form-comment">
          <p className="tracking-widest text-sm">Você tem certeza que deseja excluir esse comentário?</p>
          <div className="flex gap-2">
            <button type="reset" className="w-17 btn-xs btn-ghost shadow-shadow  shadow-default font-medium" aria-label="cancel-delete-form-comment">
              Cancelar
            </button>
            <button type="submit" className="w-17 btn-xs btn-primary bg-error/70 hover:bg-error/60 font-medium flex items-center justify-center"
              aria-label="submit-delete-form-comment">
              {isPending ? <LoadingSpinner size={18} role="img" aria-label="loading-delete-comment" /> : <p>Excluir</p>}
            </button>
          </div>
        </form>
      }
    </>
  )

}

const EditFormComment = ({ comment, cardId }: { comment: CardComment, cardId: string }) => {
  const queryKey = cardComment(cardId);
  const [isEditMode, setEditMode] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: editCommentCard,
    onMutate: async ({ body }, context) => {
      await context.client.cancelQueries({ queryKey });
      const previousState = context.client.getQueryData<CommentsQueryData>(queryKey);

      context.client.setQueryData<CommentsQueryData>(queryKey, (old) => {
        if (!old) return;
        const newPages: CommentsQueryData = {
          ...old, pages: [...old.pages.map((thisValue) => {

            const commentIndex = thisValue.comments.findIndex((thisValue) => thisValue.id === comment.id);

            if (commentIndex === -1) return thisValue;

            const comments = [...thisValue.comments.map((self) => {
              if (self.id !== comment.id) return self;
              return { ...self, body }
            })];

            return { ...thisValue, comments }

          })], pageParams: [...old.pageParams]
        }

        return newPages;

      })

      return { previousState }
    },
    onError: (error, _, result, context) => {
      toast.error("Não foi possível editar o comentário. Tente mais tarde.");
      if (!result?.previousState) return;
      context.client.setQueryData(queryKey, result.previousState);
    }
  })

  const handleShowForm = (e: React.MouseEvent) => {
    e.preventDefault();
    setEditMode(true);
  }

  const onReset: React.ReactEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setEditMode(false);
  }

  const onSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = formData.get("edit-comment")?.toString();
    if (!body) {
      logger.print("ModalEditCard -> EditFormComment -> onSubmit", "error", "O campo de body dod comentário não foi encontrado \
      verifique se está presente no DOM ou se o name está correto");
      return
    }
    mutate({ body, idComment: comment.id }, { onSuccess: () => setEditMode(false) });

  }
  return (
    <>
      {!isEditMode ?
        <button className="w-max h-6 text-start underline text-[10px] hover:font-semibold cursor-pointer" onClick={handleShowForm}
          aria-label="btn-edit-form-comment">
          Editar
        </button>
        :
        <form onSubmit={onSubmit} onReset={onReset} className="absolute inset-0 bg-accent w-full h-full flex flex-col p-2"
          aria-label="form-edit-form-comment">
          <label>
            <textarea name="edit-comment" className="px-2 py-1 h-10 w-full resize-none shadow-shadow shadow-default" placeholder="Digite seu comentário..." defaultValue={comment.body} required
              aria-label="edit-comment">
            </textarea>
          </label>
          <div className="w-max flex gap-2">
            <button type="reset" className="btn-ghost shadow-default shadow-shadow btn-xs w-17" aria-label="cancel-edit-form-comment">
              Cancelar
            </button>
            <button type="submit" className="flex items-center justify-center  btn-secondary shadow-default shadow-accent btn-xs w-17 disabled:opacity-50" disabled={isPending}
              aria-label="submit-edit-form-comment">
              {isPending ? <LoadingSpinner size={18} role="img" aria-label="loading-edit-comment" /> : <p>Salvar</p>}
            </button>
          </div>
        </form>

      }
    </>
  )

}