"use client";
import { getColumnById } from "@/actions/actions";
import { useClientKeys } from "@/hooks/useClientKeys";
import { useQuery } from "@tanstack/react-query";
import BtnInputEditColumnTitle from "./BtnInputEditColumnTitle";
import CardsColumn from "./CardsColumn";

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

  if (!data && isPending) return <p>Carregando...</p>;
  else if (!data) return;

  return (
    <li
      {...props}
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
  );
}

export default ColumnBoard;
