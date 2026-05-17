import { getAllBoardFromUser } from "@/actions/actions";
import BoardList from "./components/BoardList";
import BoardAdd from "./components/BoardAdd";

const Home = async () => {
  const initialData = await getAllBoardFromUser();

  return (
    <div className="relative p-8 w-full h-full flex flex-col gap-8 tracking-widest text-text">
      <div className="flex flex-1 flex-col gap-4 w-full">
        <span className="font-rethink font-semibold text-2xl">Recentes: </span>
        <BoardList type="recent" initialData={initialData} />
      </div>
      <div className="flex flex-1 flex-col gap-4 w-full">
        <span className="font-rethink font-semibold text-2xl">
          Todos os boards:
        </span>
        <BoardList initialData={initialData}>
          <BoardAdd />
        </BoardList>
      </div>
    </div>
  );
};

export default Home;
