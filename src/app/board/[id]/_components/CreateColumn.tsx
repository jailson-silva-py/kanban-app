"use client";
import { createColumnFromBoard } from "@/actions/actions";

import LoadingSpinner from "@/components/LoadingSpinner";
import { board } from "@/constrants/queryKeys";
import { useMutationColumns } from "@/hooks/useMutationColumns";
import useOutClick from "@/hooks/useOutClick";
import { BoardFull } from "@/types/dataTypes";
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
  const ref = useOutClick<HTMLFormElement>(() => setCreateMode(false));
  const refInput = useRef<HTMLInputElement>(null);
  const { mutate, isPending } = useMutationColumns();

  const handleChangeCreateMode = (e: MouseEvent) => {
    e.preventDefault();
    setCreateMode(true);
  };

  const onCreateColumn = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title_column") as string;
    const columnId = crypto.randomUUID();

    mutate(
      { operation: "create", boardId: params.id as string, columnId, title },
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
          aria-label="create-new-column"
          className="w-full h-full flex items-center gap-2 cursor-pointer shadow-shadow shadow-default p-4 rounded-sm hover:bg-text/10"
          onClick={handleChangeCreateMode}
        >
          <TbPlus size={24} />
          <span>Criar nova coluna</span>
        </button>
      </Activity>

      <Activity mode={!createMode ? "hidden" : "visible"}>
        <form
          onSubmit={onCreateColumn}
          ref={ref}
          className="flex flex-col gap-1"
        >
          <input
            aria-label="title-column"
            type="text"
            name="title_column"
            placeholder="Digite o nome da coluna ..."
            className="default-input"
            ref={refInput}
            required
          />
          <button
            aria-label="create-column"
            type="submit"
            className="flex items-center justify-center btn-secondary btn-default focus-primary w-20"
          >
            {!isPending ? <span>Criar</span> : <LoadingSpinner size={18} />}
          </button>
        </form>
      </Activity>
    </li>
  );
};

export default CreateColumnItemBtn;
