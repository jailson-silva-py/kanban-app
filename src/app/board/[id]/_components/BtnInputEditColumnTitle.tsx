import { ChangeColumnTitle } from "@/actions/actions";
import LoadingSpinner from "@/components/LoadingSpinner";
import useOutClick from "@/hooks/useOutClick";
import { BoardFull, Column } from "@/types/dataTypes";
import { useMutation } from "@tanstack/react-query";
import { Activity, useLayoutEffect, useRef, useState } from "react";
import { TbChecks } from "react-icons/tb";
import BtnDeleteColumn from "./BtnDeleteColumn";

interface Iprops {
  columnTitle: string;
  columnId: string;
  boardId: string;
  queryKey: string[];
}

const BtnInputEditColumnTitle = ({
  columnTitle,
  columnId,
  boardId,
  queryKey,
}: Iprops) => {
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const ref = useOutClick<HTMLFormElement>(() => setEditMode(false));

  const { data, isPending, mutate } = useMutation({
    mutationKey: ["column", "change-title"],
    mutationFn: ChangeColumnTitle,
    onMutate: async (variables, context) => {
      context.client.setQueriesData<Column>({ queryKey }, (previusColumn) => {
        if (!previusColumn) return;

        return { ...previusColumn, title: variables.title };
      });
    },

    onError: (error, varibles, onMutateResult, context) => {
      context.client.setQueriesData<BoardFull>(
        { queryKey },
        (previusColumn) => {
          if (!previusColumn) return;

          return { ...previusColumn, title };
        },
      );
    },
  });

  const refSpanEditTitle = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!editMode || !refSpanEditTitle.current) return;

    refSpanEditTitle.current.innerHTML = columnTitle ?? data?.title;

    const range = document.createRange();
    const selection = document.getSelection();

    if (!selection) {
      refSpanEditTitle.current.focus();
      return;
    }

    range.selectNodeContents(refSpanEditTitle.current);

    range.collapse(false);

    selection.removeAllRanges();
    selection.addRange(range);
    refSpanEditTitle.current.focus();
    //eslint-disable-next-line
  }, [editMode]);

  const handleShowInput = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setEditMode(true);
  };

  const handleChangeTitle = (e: React.InputEvent<HTMLSpanElement>) => {
    e.preventDefault();
    setTitle(e.currentTarget.textContent);
  };

  const onEditTitleColumn = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const title = (
      new FormData(e.currentTarget).get("title_column") as string
    )?.trim();

    setEditMode(false);
    if (!title || title === columnTitle) return;

    mutate({ id: columnId, title });
  };

  return (
    <div className="relative gap-1 p-2  bg-primary/20 w-full">
      <Activity mode={!editMode ? "visible" : "hidden"}>
        <button
          onClick={handleShowInput}
          className="flex justify-start hover:default-input cursor-pointer w-9/10 px-2 py-2"
        >
          {columnTitle || data?.title}
        </button>
      </Activity>
      <Activity mode={editMode ? "visible" : "hidden"}>
        <form onSubmit={onEditTitleColumn} ref={ref} className="relative">
          <div className=" w-9/10 h-auto">
            <span
              id="title_column"
              contentEditable="true"
              onInput={handleChangeTitle}
              ref={refSpanEditTitle}
              role="textbox"
              className="flex items-center flex-wrap px-2 py-2 default-input w-full h-auto overflow-hidden text-wrap break-all"
            />
            <input type="hidden" value={title} name="title_column" required />
          </div>
          <button
            type="submit"
            className="z-2 group backdrop-blur-[2px] absolute -bottom-1 left-0 default-button translate-y-full bg-btn/20 hover:bg-btn/40 disabled:opacity-60"
            disabled={isPending}
          >
            {!isPending ? (
              <TbChecks
                size={18}
                className="group-hover:text-text group-hover:scale-110  text-text/80"
              />
            ) : (
              <LoadingSpinner />
            )}
          </button>
        </form>
      </Activity>
      <BtnDeleteColumn columnId={columnId} boardId={boardId} />
    </div>
  );
};

export default BtnInputEditColumnTitle;
