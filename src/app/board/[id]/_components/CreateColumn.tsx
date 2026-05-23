"use client";

import { createColumnFromBoard } from "@/actions/actions";
import { onMutateFunction } from "@/app/util/mutations";
import LoadingSpinner from "@/components/LoadingSpinner";
import { board } from "@/constrants/queryKeys";
import useOutClick from "@/hooks/useOutClick";
import { BoardClient } from "@/types/clientDataTypes";
import { ColumnSkeleton } from "@/types/dataTypes";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import {
  Activity,
  MouseEvent,
  SubmitEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { TbPlus } from "react-icons/tb";


const CreateColumnItemBtn = () => {

  const params = useParams();

  const [createMode, setCreateMode] = useState(false);
  const queryKey = board(params.id as string);
  const ref = useOutClick<HTMLFormElement>(() => setCreateMode(false));
  const refInput = useRef<HTMLInputElement>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: createColumnFromBoard,
    onMutate: async (variables, context) => {
      // context.client.cancelQueries({ queryKey });

      // const previusBoard: BoardFull | undefined =
      //   context.client.getQueryData(queryKey);

      // if (!previusBoard) throw new Error("Erro ao obter o board");

      // context.client.setQueryData(queryKey, {
      //   ...previusBoard,
      //   columns: [
      //     ...previusBoard.columns,
      //     {
      //       title: variables.titleColumn,
      //       order: Infinity,
      //       id: variables.idColumn,
      //     },
      //   ],
      // });
      //return { previusBoard };
      return await onMutateFunction<BoardClient<ColumnSkeleton>>(context, queryKey, (old) => {
        const { idColumn: id, titleColumn:title } = variables;
        if (!id) throw new Error("ID não atribuído");
        const columns = new Map(old.columns);
        columns.set(id, {id, title, order:Infinity})
        return {...old, columns}

      })


    },
    onError: (error, variables, result, context) => {
      if (!result?.previousState) return;
      context.client.setQueryData(queryKey, result.previousState);
    },

    onSuccess: (data, variables, result, context) => {
      const {idColumn:id} = variables
      if (!result?.previousState || !id) return;
      const columns = new Map(result.previousState.columns);
      columns.set(id, data)

       context.client.setQueryData(queryKey, {...result.previousState, columns});
     },
  });

  const handleChangeCreateMode = (e: MouseEvent) => {
    e.preventDefault();
    setCreateMode(true);
  };

  const onCreateColumn = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const titleColumn = formData.get("title_column") as string;
    const idColumn = crypto.randomUUID();

    mutate(
      { boardId:params.id as string, idColumn, titleColumn },
      {
        onSuccess: () => {
          setCreateMode(false);
          e.target.reset();
        },
      },
    );
  };

  useEffect(() => {
    if (!createMode || !refInput.current) return;
    refInput.current.focus();
  }, [createMode]);

  return (
    <li className="rounded-sm min-w-65 h-12">
      <Activity mode={createMode ? "hidden" : "visible"}>
        <button
          className="w-full h-full flex items-center gap-2 cursor-pointer shadow-shadow shadow-default p-4 rounded-sm hover:bg-text/10"
          onClick={handleChangeCreateMode}
        >
          <TbPlus size={24} />
          <span>Create new Column</span>
        </button>
      </Activity>

      <Activity mode={!createMode ? "hidden" : "visible"}>
        <form
          onSubmit={onCreateColumn}
          ref={ref}
          className="flex flex-col gap-1"
        >
          <input
            type="text"
            name="title_column"
            className="default-input"
            ref={refInput}
            required
          />
          <button
            type="submit"
            className="default-btn flex items-center justify-center w-15 h-8"
          >
            {!isPending ? <span>Criar</span> : <LoadingSpinner size={18} />}
          </button>
        </form>
      </Activity>
    </li>
  );
};

export default CreateColumnItemBtn;
