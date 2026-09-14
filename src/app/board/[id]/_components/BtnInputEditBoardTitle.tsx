"use client";
import { changeBoardTitle } from "@/actions/actions";
import LoadingSpinner from "@/components/LoadingSpinner";
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
import { TbChecks } from "react-icons/tb";

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
      await context.client.cancelQueries({queryKey})
      context.client.setQueryData<BoardFull>( queryKey , (previusBoard) => {
        if (!previusBoard) return;

        return { ...previusBoard, title: variables.title };
      });
    },

    onError: (error, varibles, onMutateResult, context) => {
      context.client.setQueryData<BoardFull>( queryKey , (previusBoard) => {
        if (!previusBoard) return;

        return { ...previusBoard, title };
      });
    },
  });

  useLayoutEffect(() => {
    if (!refTextAreaTitle.current || !editMode) return;
    refTextAreaTitle.current.innerHTML = titleBoard;

    const end = titleBoard.length;

    refTextAreaTitle.current.setSelectionRange(end, end);
    refTextAreaTitle.current.focus();
  }, [editMode, titleBoard]);

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
    if (text.length > 100) return;
    setTitleBoard(text);
  };

  return (
    <>
      <Activity mode={!editMode ? "visible" : "hidden"}>
        <button
          aria-label="edit-title-board"
          className="hover:shadow-default hover:shadow-shadow rounded-sm max-h-full w-full max-w-209 text-xs py-2 h-10 px-4 text-nowrap truncate text-start"
          onClick={handleChangeEditMode}
        >
          {variables?.title && isPending ? variables.title : data || title}
        </button>
      </Activity>

      <Activity mode={!editMode ? "hidden" : "visible"}>
        <form
          onSubmit={onChangeName}
          className="relative flex w-full h-10"
          ref={ref}
        >
          <label className="w-full h-full">
            <textarea
              aria-label="title-board"
              ref={refTextAreaTitle}
              onChange={handleEditTitle}
              value={titleBoard}
              className={`default-input px-4 py-2 max-h-full w-full max-w-209 text-nowrap overflow-hidden resize-none`}
              name="title_board"
              id="title_board"
              required
            />
          </label>
          <button
            aria-label="change-title-board"
            type="submit"
            className="w-8 h-8 z-2 group backdrop-blur-[2px] absolute flex items-center justify-center -bottom-1 left-0 default-btn btn-primary translate-y-full bg-primary/90 hover:bg-text/10 disabled:opacity-60"
            disabled={isPending}
          >
            {!isPending ? (
              <TbChecks size={18} />
            ) : (
              <LoadingSpinner/>
            )}
          </button>
        </form>
      </Activity>
    </>
  );
};

export default memo(BtnInputEditBoardTitle);
