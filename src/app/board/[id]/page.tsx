import { getBoardById } from "@/actions/actions";
import Board from "./_components/Board";
import InBox from "./_components/InBox.";

interface Iprops {
  params: Promise<{ id: string | string[] | undefined }>;
}

const BoardPage = async ({ params }: Iprops) => {
  const filters = await params;

  const board = await getBoardById(filters.id as string);

  if (!board) throw new Error("Board não encontrado ou inválido!");

  return (
    <main className="p-4 h-[calc(100vh-60px)] w-screen flex gap-4 bg-primary text-text font-light tracking-widest font-rethink text-sm">
      <InBox />
      <Board initialData={board} />
    </main>
  );
};

export default BoardPage;
