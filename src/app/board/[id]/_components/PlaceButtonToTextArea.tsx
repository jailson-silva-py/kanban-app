import LoadingSpinner from "@/components/LoadingSpinner";
import useOutClick from "@/hooks/useOutClick";
import { useTransition, useEffect, useRef, useState } from "react";

type PlaceButtonToTextAreaProps = {

  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => Promise<void> | void,
  name: string,
  textBtn: string,
  placeholder: string,
  defaultValue: string,

}

export function PlaceButtonToTextArea({ defaultValue, name, onSubmit, placeholder, textBtn }: PlaceButtonToTextAreaProps) {

  const [editMode, setEditMode] = useState(false);
  const refTextArea = useRef<HTMLTextAreaElement>(null);
  const refForm = useOutClick<HTMLFormElement>(() => setEditMode(false));
  const [isPending, startTransition] = useTransition();
  const handleClickEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setEditMode(true);
  }
  const handleCloseEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setEditMode(false);

  }

  const transitionSubmit: React.SubmitEventHandler<HTMLFormElement> = (...props) => {
    startTransition(async () => { await onSubmit(...props) }
    )
  }

  useEffect(() => {

    if (!editMode || !refTextArea.current) return;
    const end = refTextArea.current.innerHTML.length;
    refTextArea.current.setSelectionRange(end, end);
    refTextArea.current.focus();

  }, [editMode, refTextArea])

  return (

    <>
      {editMode ?
        <form className="flex w-full flex-col gap-2" ref={refForm} onSubmit={transitionSubmit} aria-label={`form-${name}`}>
          <textarea className="block w-full outline-0 px-3 py-2 shadow-default shadow-shadow text-sm rounded-sm resize-y h-16" placeholder={placeholder}
            ref={refTextArea} defaultValue={defaultValue} name={name} aria-label={name} required>
          </textarea>
          <div className="ml-auto flex gap-2 w-max">
            <button type="reset" className="btn-sm btn-ghost shadow-default shadow-shadow w-20 font-medium" onClick={handleCloseEdit}
              aria-label={`cancel-${name}`}>
              Cancelar
            </button>
            <button type="submit" className="flex items-center justify-center btn-sm btn-secondary shadow-default shadow-accent w-20 font-medium disabled:opacity-60"
              disabled={isPending} aria-label={`submit-${name}`}>
              {isPending ? <LoadingSpinner size={24} role="img" aria-label="loading-spinner" className="opacity-50" /> : <span>Salvar</span>}
            </button>
          </div>
        </form>
        :
        <button className="text-text-secondary px-3 py-2 w-full h-16 cursor-text shadow-shadow shadow-default text-sm" onClick={handleClickEdit}
          aria-label={`btn-${name}`}>
          <span className={`block text-start text-pretty break-all w-full h-full`}>
            {textBtn}
          </span>
        </button>
      }
    </>
  )

}