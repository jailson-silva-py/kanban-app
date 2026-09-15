import { TbPlaystationTriangle } from 'react-icons/tb'
import BtnGoToHome from "./_components/BtnLinkGoTo";

export default function Home() {
  return (
    <div className="px-8 py-4 w-screen h-[calc(100vh-100px)] bg-primary font-geist text-text">
      <main className="h-full w-full flex items-center justify-center flex-col gap-4 tracking-widest font-rethink">
        <div className="flex flex-col gap-6 items-center justify-center">
        <h1 className="font-marck-script text-7xl tracking-[8px] bg-linear-to-r to-text from-secondary bg-clip-text text-transparent">
          Krux
        </h1>
        <div className="flex flex-col items-center justify-center gap-4">
        <h2 className="font-medium text-center text-lg">Organize suas tarefas com agilidade</h2>
        <p className="font-geist hyphens-auto text-justify font-light text-sm">Desfrute da suprema organização moderna com confiabilidade e conforto.</p>
        </div>
          <BtnGoToHome  text="Iniciar" href={"/home"} className="group bg-btn cursor-pointer flex items-center justify-center gap-1 w-40 h-10 shadow-default shadow-shadow rounded-sm hover:-translate-y-1">
          <TbPlaystationTriangle size={24} className="group-hover:size-8 rotate-90 stroke-[1px] duration-500"/>
          </BtnGoToHome>

        </div>
      </main>
    </div>
  );
}
