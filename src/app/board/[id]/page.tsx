import { getBoardById } from "@/actions/actions";
import Board from "./_components/Board";
import InBox from "./_components/InBox.";
import { UnAuthentichatedError } from "@/types/AuthErrors";
import { redirect } from "next/navigation";
import { UnexpectedError } from "@/types/GlobalErrors";
import MenuFloat from "./_components/MenuFloat";

interface Iprops {
  params: Promise<{ id: string | string[] | undefined }>;
}

const BoardPage = async ({ params }: Iprops) => {
  const filters = await params;
  const board = await getBoardById(filters.id as string).catch((err) => {

    if (err instanceof UnAuthentichatedError) redirect("/login");
    throw new UnexpectedError()

  });
  if (!board) redirect("/home")
    return (
      <main className="p-4 h-[calc(100vh-60px)] w-full flex gap-4 bg-primary text-text font-light tracking-widest font-rethink text-sm">
        <InBox/>
        <Board initialData={board} />
        <MenuFloat/>
      </main>
  );


};

export default BoardPage;
