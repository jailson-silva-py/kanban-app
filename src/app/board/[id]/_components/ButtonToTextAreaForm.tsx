"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import useOutClick from "@/hooks/useOutClick";
import React, { useEffect, useRef, useState, useTransition } from "react";
import { TbPlus } from "react-icons/tb";

type ButtonToTextAreaProps = {
  name: string,
  placeholder: string,
  defaultValue: string,
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => Promise<void> | void,
}

export function ButtonToTextAreaForm({ name, placeholder, defaultValue, onSubmit }: ButtonToTextAreaProps) {

  const [editMode, setEditMode] = useState(false);
  const refForm = useOutClick<HTMLFormElement>(() => setEditMode(false));
  const [isPending, startTransition] = useTransition();
  const refTextArea = useRef<HTMLTextAreaElement>(null);

  const handleClickBtn = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setEditMode(true)

  }

  const handleCloseTextArea = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setEditMode(false);
  }
  const transitionSubmit: React.SubmitEventHandler<HTMLFormElement> = (...props) => {
    startTransition(async () => {
      await onSubmit(...props);
      setEditMode(false);

    })

  }

  useEffect(() => {

    const el = refTextArea.current
    if (!editMode || !el) return;

    const end = el.innerHTML.length;
    el.setSelectionRange(end, end);
    el.focus();

  }, [editMode, refTextArea])

  return (
    <>
      {editMode ?
        <form onSubmit={transitionSubmit} ref={refForm} aria-label={`form-${name}`}>
          <label>
            <textarea className="w-full outline-0 p-2 shadow-shadow shadow-default text-sm rounded-sm resize-y max-h-25 min-h-8"
              placeholder={placeholder} name={name} defaultValue={defaultValue} ref={refTextArea} required aria-label={name}>
            </textarea>
          </label>
          <div className="ml-auto flex gap-2 w-max">
            <button type="reset" className="btn-sm btn-ghost shadow-default shadow-shadow w-20 font-medium" onClick={handleCloseTextArea}
              aria-label={`cancel-${name}`}>
              Cancelar
            </button>
            <button type="submit" className="flex items-center justify-center btn-sm btn-secondary shadow-default shadow-accent \
            w-20 font-medium disabled:opacity-60" disabled={isPending} aria-label={`submit-${name}`}>
              {isPending ? <LoadingSpinner size={24} className="opacity-50" aria-label="loading-spinner" role="img" /> : <span>Salvar</span>}
            </button>
          </div>
        </form>
        :
        <button className="w-full flex items-center justify-center gap-2 btn-sm shadow-shadow shadow-default text-xs cursor-pointer hover:bg-text/10"
          onClick={handleClickBtn} aria-label={`btn-${name}`}>
          <TbPlus size={24} className="text-text" />
          <span className="text-xs font-medium">Adicionar Comentário</span>
        </button>}

    </>
  )

}