import { getBoardById } from "@/actions/actions";
import { Cards } from "@/components/Cards";
import { TbMessagePlus } from "react-icons/tb";
import Board from "./_components/Board";
import { AddCartInBox } from "@/components/AddCartInBoxBtn";

interface Iprops {
  params: Promise<{ id: string | string[] | undefined }>;
}

const BoardPage = async ({ params }: Iprops) => {
  const filters = await params;

  const board = await getBoardById(filters.id as string);

  if (!board) throw new Error("Board não encontrado ou inválido!");

  return (
    <main className="p-4 h-[calc(100vh-60px)] w-screen flex gap-4 bg-primary text-text font-light tracking-widest font-rethink text-sm">
      <div className="shadow-shadow shadow-default bg-secondary/30  overflow-hidden  h-full flex-1 rounded-xl flex flex-col gap-1 items-center">
        <header className="bg-secondary/50 w-full h-15 border-b-px border-white flex items-center justify-center">
          <div className="flex items-center justify-center gap-2">
            <TbMessagePlus size={24} />
            <span>Caixa de entrada</span>
          </div>
        </header>

        <AddCartInBox textForArea="Insira um título ou link">
          Adicionar um Cartão
        </AddCartInBox>
        <Cards />
      </div>

      <Board initialData={board} />
    </main>
  );
};

export default BoardPage;
