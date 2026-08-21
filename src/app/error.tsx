"use client";
import { useEffect } from "react";
import { TbRefresh } from "react-icons/tb";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // centraliza aqui: envia pro seu serviço de log
    console.error("Erro capturado:", error);
    // ex: enviarParaServicoDeLog(error);
  }, [error]);
  return (
    <div className="mt-4 w-full h-[calc(100vh-100px)] flex flex-col items-center gap-2 font-geist">
      <div className="pt-[20vh] px-4 flex flex-col items-center gap-4">
        <h2 className="text-base/loose tracking-widest font-normal text-justify hyphens-auto">
          {error.message}. Por favor, recarregue a página. Se o problema persistir, entre em contato com o autor.
        </h2>
      <button className="flex gap-1 bg-error/70 default-btn btn-sm w-max hover:bg-error/60 font-rethink" onClick={reset}>
        <TbRefresh size={24}/>
        <span className="text-sm ">Tentar novamente</span>
        </button>
      </div>
    </div>
  );
}
