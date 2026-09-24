import { getAllBoardFromUser } from "@/actions/actions";
import BoardList from "./components/BoardList";
import BoardAdd from "./components/BoardAdd";
import { UnAuthentichatedError } from "@/types/AuthErrors";
import { redirect } from "next/navigation";
import { toast } from "../util/toast";

const Home = async () => {
  const initialData = await getAllBoardFromUser().catch(err => {
    if (err instanceof UnAuthentichatedError) {
      toast.error("Acesso negado. Faça Login para Continuar!")

    }
    else throw err
  })
  return (
    <div className="relative px-8  py-16 sm:px-4 md:px-16 md:py-8 md:p8 w-full min-h-[calc(100vh-60px)] flex flex-col gap-8 tracking-widest text-text">
      <div className="flex flex-1 flex-col gap-4 w-full shrink">
        <span className="font-rethink font-medium text-xl">Recentes: </span>
        <BoardList type="recent" initialData={initialData!} />
      </div>
      <div className="flex flex-3 flex-col gap-4 w-full">
        <span className="font-rethink font-normal text-xl">
          Todos os boards:
        </span>
        <BoardList initialData={initialData!}>
          <BoardAdd />
        </BoardList>
      </div>
    </div>
  );
};

export default Home;
