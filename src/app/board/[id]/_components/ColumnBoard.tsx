"use client";
import { getColumnById } from "@/actions/actions";
import { useClientKeys } from "@/hooks/useClientKeys";
import { useQuery } from "@tanstack/react-query";
import BtnInputEditColumnTitle from "./BtnInputEditColumnTitle";
import CardsColumn from "./CardsColumn";
import { useDroppable } from "@dnd-kit/react";
import { CollisionPriority } from "@dnd-kit/abstract";

type Iprops = {
  id: string;
  initialData: Awaited<ReturnType<typeof getColumnById>>;
} & React.ComponentProps<"li">;

function ColumnBoard({ id, initialData, ...props }: Iprops) {
  const queryKey = useClientKeys().getColumnKey(id);

  const { isPending, data } = useQuery({
    placeholderData: initialData,
    queryKey,
    queryFn: () => getColumnById(id),
  });

  const { ref } = useDroppable({
    id: `column-${id}`,
    type: "column",
    accept: "card",
    collisionPriority: CollisionPriority.Low,
    data: { ...initialData },
  });

  return (
    <>
      {data && !isPending ? (
        <li
          {...props}
          ref={ref}
          className={`flex flex-col shadow-shadow shadow-default bg-primary/30 rounded-lg w-65 shrink-0 grow-0 max-h-[75vh]`}
        >
          <BtnInputEditColumnTitle
            columnTitle={data?.title}
            columnId={id}
            queryKey={queryKey}
            boardId={data.boardId}
          />

          <CardsColumn data={data} />
        </li>
      ) : !data && isPending ? (
        <p>Carregando...</p>
      ) : undefined}
    </>
  );
}

export default ColumnBoard;
