import { TbCategory } from "react-icons/tb";
import ProfileButton from "./ProfileButton";
import { getUser } from "@/actions/actions";
import GlobalSearch from "./GlobalSearch";

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
          <GlobalSearch />
        </li>

        <li className="flex-2">
          <ProfileButton user={user} />
        </li>
      </ul>
    </nav>
  );
};

export default Menu;
