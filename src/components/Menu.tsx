import { TbCategory, TbSearch } from "react-icons/tb";
import ProfileButton from "./ProfileButton";
import { getUser } from "@/actions/actions";

const Menu = async () => {
  const user = await getUser();

  return (
    <nav className="h-15 bg-yellow-900  w-screen p-4 flex items-center justify-between rounded-b-xl bg-linear-to-b to-accent via-accent/95 from-secondary border-shadow">
      <ul className="flex justify-center gap-2 w-full h-full">
        <li className="flex-2 flex items-center gap-4">
          <button className="group hover:-translate-y-0.5 cursor-pointer text-text">
            <TbCategory size={24} className="group-hover:scale-102" />
          </button>
          <div className="text-2xl font-marck-script bg-linear-270 from-text to-primary bg-clip-text text-transparent text-shadow-xl text-shadow-black ">
            Kanboom
          </div>
        </li>

        <li className="flex-6 flex justify-center items-center">
          <form className="relative">
            <TbSearch
              size={18}
              className="absolute left-2 top-1/2 -translate-y-1/2"
            />
            <input
              type="search"
              placeholder="Pesquise algo..."
              className="font-geist font-extralight bg-secondary/20 pl-8 pr-4 py-2 text-xs h-8 w-100 outline-none shadow-default rounded-lg tracking-widest shadow-shadow focus:shadow-primary/80"
            />
          </form>
        </li>

        <li className="flex-2">
          <ProfileButton user={user} />
        </li>
      </ul>
    </nav>
  );
};

export default Menu;
