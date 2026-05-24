import ProfileButton from "./ProfileButton";
import { getUser } from "@/actions/actions";
import GlobalSearch from "./GlobalSearch";
import Link from "next/link";

const Menu = async () => {
  const user = await getUser();

  return (
    <nav className="md:px-8 px-4 h-15 w-screen py-2 flex items-center rounded-b-sm bg-secondary">
      <ul className="flex justify-between  gap-4 w-full h-full">
        <li className="flex-2 hidden items-center gap-4 sm:flex grow-0">
          <Link href="/" className="text-2xl font-marck-script bg-linear-270 from-text/60 to-text/80 bg-clip-text text-transparent text-shadow-xl text-shadow-primary ">
            Kanboom
          </Link>
        </li>

        {user && <li className="flex-6 flex basis-52.5 max-w-150 justify-center items-center shrink md:flex-4">
          <GlobalSearch />
        </li>}

        <li className="flex-1 basis-10 flex items-center grow-0">
          <ProfileButton user={user} />
        </li>
      </ul>
    </nav>
  );
};

export default Menu;
