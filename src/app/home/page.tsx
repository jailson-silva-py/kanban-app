import { getAllBoardFromUser } from "@/actions/actions";
import BoardList from "./components/BoardList";
import BoardAdd from "./components/BoardAdd";

const Home = async () => {
  const initialData = await getAllBoardFromUser();

  return (
    <div className="relative px-4 py-8 md:p8 w-full h-full flex flex-col gap-8 tracking-wider text-text">
      <div className="flex flex-1 flex-col gap-4 w-full">
        <span className="font-rethink font-medium tracking-widest text-xl">Recentes: </span>
        <BoardList type="recent" initialData={initialData} />
      </div>
      <div className="flex flex-1 flex-col gap-4 w-full">
        <span className="font-rethink font-medium tracking-widest text-xl">
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
