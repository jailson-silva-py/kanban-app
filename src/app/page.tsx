export const dynamic = "force-static"

import Link from "next/link";
import { TbPlaystationTriangle } from 'react-icons/tb'
import BtnGoToHome from "./_components/BtnLinkGoTo";

export default function Home() {
  return (
    <div className="w-screen h-screen bg-primary font-geist text-text ">
      <main className="h-full w-full flex items-center justify-center flex-col gap-4 tracking-widest">

        <h1 className="font-marck-script text-7xl tracking-[8px] bg-linear-to-r to-text from-secondary bg-clip-text text-transparent">
          Kanboom
        </h1>
        <div className="flex flex-col items-center justify-center gap-1 font-light font-rethink ">
        <h2>Organize suas tarefas com agilidade</h2>
        <p>Desfrute da suprema organização moderna com confiabilidade e conforto</p>
        </div>

        
        <BtnGoToHome  text="Iniciar" href={"/home"} className="group bg-btn cursor-pointer flex items-center justify-center gap-1 w-40 h-10 shadow-default shadow-shadow rounded-sm hover:-translate-y-1">
        <TbPlaystationTriangle size={24} className="group-hover:size-8 rotate-90 stroke-[1px] duration-500"/>
        </BtnGoToHome>
      
        
      </main>
    </div>
  );
}
