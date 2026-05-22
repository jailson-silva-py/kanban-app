"use client";
import { changeBoardTitle } from "@/actions/actions";
import { board } from "@/constrants/queryKeys";
import useOutClick from "@/hooks/useOutClick";
import { BoardFull } from "@/types/dataTypes";
import { useMutation } from "@tanstack/react-query";
import {
  Activity,
  ChangeEvent,
  memo,
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
  const refTextAreaTitle = useRef<HTMLTextAreaElement>(null);
  const ref = useOutClick<HTMLFormElement>(() => setEditMode(false));
  const queryKey = board(id)
  const { variables, data, mutate, isPending } = useMutation({
    mutationKey: ["board", "change-title"],
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
    if (!refTextAreaTitle.current || !editMode) return;

    refTextAreaTitle.current.innerHTML = data || title;

    const end = titleBoard.length;

    refTextAreaTitle.current.setSelectionRange(end, end);
    refTextAreaTitle.current.focus();
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
    refTextAreaTitle.current?.focus();
  };

  const handleEditTitle = (e: ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const text = e.target.value;
    const width = parseInt(e.target.style.width.replace("px", ""));
    if (text.length > 100) return;

    e.target.style.width = "auto";
    e.target.style.width = `${width < 188 ? width + 9 : e.target.scrollWidth + 16}px`;

    setTitleBoard(text);
  };

  return (
    <>
      <Activity mode={!editMode ? "visible" : "hidden"}>
        <button
          className="hover:shadow-default hover:shadow-shadow rounded-lg max-w-[60vw] text-xs py-2 h-10 px-4 w-auto text-nowrap truncate"
          onClick={handleChangeEditMode}
        >
          {variables?.title && isPending ? variables.title : data || title}
        </button>
      </Activity>

      <Activity mode={!editMode ? "hidden" : "visible"}>
        <form
          onSubmit={onChangeName}
          className="relative flex w-max max-w-[60vw] h-10"
          ref={ref}
        >
          <label className="w-full h-full">
            <textarea
              style={{ width: `${title.length * 9 + 16}px` }}
              ref={refTextAreaTitle}
              onChange={handleEditTitle}
              value={titleBoard}
              className={` default-input px-4 py-2 max-h-full max-w-full text-nowrap w-20 overflow-hidden resize-none`}
              name="title_board"
              id="title_board"
              required
            />
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

export default memo(BtnInputEditBoardTitle);
