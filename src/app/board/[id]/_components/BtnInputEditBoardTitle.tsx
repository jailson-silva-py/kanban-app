"use client";

import { changeBoardTitle } from "@/actions/actions";
import { useClientKeys } from "@/hooks/useClientKeys";
import useOutClick from "@/hooks/useOutClick";
import { BoardFull } from "@/types/dataTypes";
import { useMutation } from "@tanstack/react-query";
import {
  Activity,
  InputEvent,
  MouseEvent,
  SubmitEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { TbCheck, TbInnerShadowTopLeft } from "react-icons/tb";

interface Iprops {
  id: string;
  title: string;
}

const BtnInputEditBoardTitle = ({ id, title }: Iprops) => {
  const [editMode, setEditMode] = useState(false);
  const [titleBoard, setTitleBoard] = useState(title);

  const refSpanEditTitle = useRef<HTMLSpanElement>(null);
  const ref = useOutClick<HTMLFormElement>(() => setEditMode(false));

  const queryKey = useClientKeys().getBoardKey(id);

  const { variables, data, mutate, isPending } = useMutation({
    mutationFn: changeBoardTitle,
    onMutate: async (variables, context) => {
      context.client.setQueriesData<BoardFull>({ queryKey }, (previusBoard) => {
        if (!previusBoard) return;

        return { ...previusBoard, title: variables.title };
      });
    },

    onError: (error, varibles, onMutateResult, context) => {
      context.client.setQueriesData<BoardFull>({ queryKey }, (previusBoard) => {
        if (!previusBoard) return;

        return { ...previusBoard, title };
      });
    },
  });

  useLayoutEffect(() => {
    if (!refSpanEditTitle.current || !editMode) return;

    refSpanEditTitle.current.innerHTML = data || title;

    const range = document.createRange();
    const selecao = window.getSelection();

    if (!selecao) {
      refSpanEditTitle.current.focus();
      return;
    }

    // Seleciona todos os nós dentro do elemento
    range.selectNodeContents(refSpanEditTitle.current);

    // Colapsa o range para o ponto final (false = fim, true = início)
    range.collapse(false);

    // Limpa seleções anteriores e aplica a nova
    selecao.removeAllRanges();
    selecao.addRange(range);

    // Garante que o elemento ganhe foco
    refSpanEditTitle.current.focus();
  }, [editMode]);

  const onChangeName = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTitle = (formData.get("title_board") as string).trim();
    if (newTitle === title) return;
    mutate({ id, title: newTitle });
    setEditMode(false);
  };

  const handleChangeEditMode = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setEditMode(true);
    refSpanEditTitle.current?.focus();
  };

  const handleEditTitle = (e: InputEvent<HTMLSpanElement>) => {
    e.preventDefault();
    setTitleBoard(e.currentTarget.textContent);
  };

  return (
    <>
      <Activity mode={!editMode ? "visible" : "hidden"}>
        <button
          className="hover:shadow-default hover:shadow-shadow rounded-lg  text-xs py-2 h-10 px-4 w-auto"
          onClick={handleChangeEditMode}
        >
          {variables?.title && isPending ? variables.title : data || title}
        </button>
      </Activity>

      <Activity mode={!editMode ? "hidden" : "visible"}>
        <form onSubmit={onChangeName} className="relative flex w-200" ref={ref}>
          <label>
            <span
              ref={refSpanEditTitle}
              contentEditable={true}
              role="textBox"
              onInput={handleEditTitle}
              className="default-input flex items-center w-auto cursor-text"
            />
            <input type="hidden" value={titleBoard} name="title_board" />
          </label>
          <button
            type="submit"
            className="absolute -bottom-1 translate-y-full h-8 w-10 default-button bg-btn/50 backdrop-blur-sm disabled:opacity-60 hover:brightness-120"
            disabled={isPending}
          >
            {!isPending ? (
              <TbCheck size={24} className="stroke-2" />
            ) : (
              <TbInnerShadowTopLeft size={24} className="animate-spin" />
            )}
          </button>
        </form>
      </Activity>
    </>
  );
};

export default BtnInputEditBoardTitle;
