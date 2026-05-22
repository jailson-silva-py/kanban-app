import { ChangeColumnTitle } from "@/actions/actions";
import LoadingSpinner from "@/components/LoadingSpinner";
import useOutClick from "@/hooks/useOutClick";
import { BoardFull, Column } from "@/types/dataTypes";
import { useMutation } from "@tanstack/react-query";
import { Activity, useLayoutEffect, useRef, useState } from "react";
import { TbChecks } from "react-icons/tb";
import { board } from "@/constrants/queryKeys";

interface Iprops {
  children: React.ReactNode;
  columnTitle: string;
  columnId: string;
  boardId: string;
}

const BtnInputEditColumnTitle = ({
  children,
  columnTitle,
  columnId,
  boardId,
}: Iprops) => {
  const queryKey = board(boardId)
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState(columnTitle);
  const ref = useOutClick<HTMLFormElement>(() => setEditMode(false));
  const { data, isPending, mutate } = useMutation({
    mutationKey: ["column", "change-title"],
    mutationFn: ChangeColumnTitle,
    onMutate: async (variables, context) => {
      context.client.setQueryData<Column>(queryKey, (previusColumn) => {
        if (!previusColumn) return;

        return { ...previusColumn, title: variables.title };
      });
    },

    onError: (error, varibles, onMutateResult, context) => {
      context.client.setQueryData<BoardFull>(
        queryKey,
        (previusColumn) => {
          if (!previusColumn) return;

          return { ...previusColumn, title };
        },
      );
    },
  });

  const refTextAreaTitle = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    if (!editMode || !refTextAreaTitle.current) return;

    const end = title.length;
    refTextAreaTitle.current.setSelectionRange(end, end);
    refTextAreaTitle.current.focus();
    //eslint-disable-next-line
  }, [editMode]);

  const handleShowInput = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setEditMode(true);
  };

  const handleChangeTitle = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const text = e.target.value;
    const width = parseInt(e.target.style.width.replace("px", ""));
    if (text.length > 50) return;

    e.target.style.width = "auto";
    e.target.style.width = `${width < 188 ? width + (title.length * 9 - width) + 16 : e.target.scrollWidth + 8}px`;
    setTitle(text);
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
    <div className="relative gap-1 p-2  bg-primary/20 w-full h-12">
      <Activity mode={!editMode ? "visible" : "hidden"}>
        <button
          onClick={handleShowInput}
          className="text-start hover:default-input h-9 text-sm/loose cursor-pointer max-w-[calc(100%-32px)] px-2 py-2 truncate"
        >
          {columnTitle || data?.title}
        </button>
      </Activity>
      <Activity mode={editMode ? "visible" : "hidden"}>
        <form
          onSubmit={onEditTitleColumn}
          ref={ref}
          className="relative w-max max-w-[calc(100%-32px)] h-8"
        >
          <label className=" w-full h-9">
            <textarea
              style={{ width: `${columnTitle.length * 9 + 16}px` }}
              id="title_column"
              onChange={handleChangeTitle}
              ref={refTextAreaTitle}
              className=" default-input text-xs mt-1 px-2 py-2 min-w-20 max-w-full max-h-full overflow-hidden text-nowrap resize-none"
              value={title}
              name="title_column"
              required
            />
          </label>
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
      {children}
    </div>
  );
};

export default BtnInputEditColumnTitle;
