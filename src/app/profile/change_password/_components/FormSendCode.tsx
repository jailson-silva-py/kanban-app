"use client";
import { createToken } from "@/actions/actions";
import { censuredEmail } from "@/app/util/censuredEmail";
import LoadingSpinner from "@/components/LoadingSpinner";
import { User } from "@/types/dataTypes";
import { SubmitEvent, useTransition } from "react";


export default function FormSendCode({ user }: { user: User }) {
  const [isPending, startTransition] = useTransition()
  const onSendCode = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      await createToken();
    })
  }
  return (
    <form className="flex flex-col gap-4 shadow-shadow shadow-default px-8 py-4 rounded-sm form-width" onSubmit={onSendCode}>
      <label className="flex flex-col gap-4">
        <span className="font-semibold">Seu e-mail atual: </span>
        <input className="border-b border-shadow opacity-50 font-medium" defaultValue={censuredEmail(user?.email as string)} disabled />

      </label>
      <small className="text-[10px] text">Um código será enviado para o e-mail indicado acima, aperte em &quot;Enviar o código&quot; e aguarde a chegada da mensagem. Após isso, insira no campo indicado.</small>
      <button className="btn-sm btn-secondary w-40 font-medium focus-primary flex items-center justify-center" disabled={isPending}>
        {isPending ? <LoadingSpinner className="text-primary"/>: <span>Enviar o código</span>}
      </button>
  </form>
  )
}
