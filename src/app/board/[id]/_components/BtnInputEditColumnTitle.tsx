import { ChangeColumnTitle } from "@/actions/actions";
import LoadingSpinner from "@/components/LoadingSpinner";
import useOutClick from "@/hooks/useOutClick";
import { BoardFull, Column } from "@/types/dataTypes";
import { useMutation } from "@tanstack/react-query";
import { Activity, useLayoutEffect, useRef, useState } from "react";
import { TbChecks } from "react-icons/tb";
import { column } from "@/constrants/queryKeys";

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
}: Iprops) => {
  const queryKey = column(columnId)
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState(columnTitle);
  const ref = useOutClick<HTMLFormElement>(() => setEditMode(false));
  const { data, isPending, mutate } = useMutation({
    mutationKey: ["column", "change-title"],
    mutationFn: ChangeColumnTitle,
    onMutate: async (variables, context) => {
      await context.client.cancelQueries({queryKey})
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
    if (text.length > 50) return;
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
    <div className="relative flex items-center justify-center gap-1 p-2 bg-primary/20 w-full h-12 ">
      <Activity mode={!editMode ? "visible" : "hidden"}>
        <button
          aria-label="edit-title-column"
          onClick={handleShowInput}
          className="flex items-center justify-start hover:default-input h-9 text-sm/loose cursor-pointer max-w-full flex-1 px-2 py-2 truncate"
        >
          {columnTitle || data?.title}
        </button>
      </Activity>
      <Activity mode={editMode ? "visible" : "hidden"}>
        <form
          onSubmit={onEditTitleColumn}
          ref={ref}
          className="relative flex-1 h-9"
        >
          <label className="w-full h-9">
            <textarea
              aria-label="title-column"
              id="title_column"
              onChange={handleChangeTitle}
              ref={refTextAreaTitle}
              className="default-input focus-primary text-xs mt-1 p-2  w-full max-h-full overflow-hidden text-nowrap resize-none"
              value={title}
              name="title_column"
              required
            />
          </label>
          <button
            aria-label="change-title-column"
            type="submit"
            className="group w-8 h-8 z-2 absolute -bottom-2 left-0  btn-primary focus-primary flex items-center justify-center translate-y-full bg-primary/90 hover:bg-text/10 disabled:opacity-60"
            disabled={isPending}
          >
            {!isPending ? (
              <TbChecks
                size={18}
                className="group-hover:text-text group-hover:scale-110  text-text/90"
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
