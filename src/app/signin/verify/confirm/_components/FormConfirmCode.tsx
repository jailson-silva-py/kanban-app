"use client";
import { createTokenNewUser, verifyNewUser } from "@/actions/actions";
import { censuredEmail } from "@/app/util/censuredEmail";
import { toast } from "@/app/util/toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { User } from "@/types/dataTypes";
import { redirect } from "next/navigation";
import { ChangeEvent, MouseEvent, useTransition } from "react";
import { SubmitHandler, useForm } from "react-hook-form"

interface IFormType {
  code: string;
}

export default function FormConfirmCode({ user }: { user: User }) {

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting, errors, isValid } } = useForm<IFormType>({ mode: "onChange" });
  const [isPending, startTransition] = useTransition();
  const onVerifyCode: SubmitHandler<IFormType> = async (data) => {

    await verifyNewUser(data.code).catch(err => {
      if (err?.name === "InvalidTokenError") {
        toast.error(err.message);
        return
      }
      toast.error("Ocorreu um erro inesperado, tente novamente");
      return
    }).then(() => redirect("/home"));



  }

  const handleResendCode = async (e: MouseEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await createTokenNewUser();
    })
  }

  const codeValue = watch("code");
  return (
    <form onSubmit={handleSubmit(onVerifyCode)} className="w-ful h-full flex flex-col gap-4 justify-center items-center">
      <p className="text-sm hyphens-auto break-all">Nós enviamos um código para o email: { censuredEmail(user.email)}.</p>
      <label className="mt-4 flex flex-col gap-4 group">
        <span className="font-medium text-sm">Insira o código abaixo:</span>
        <div className="relative w-max h-8">
        <input maxLength={5} inputMode="numeric" {...register("code", {
          minLength: { value: 5, message: "Precisa ter 5 dígitos" },
          maxLength: { value: 5, message: "Precisa ter 5 dígitos." },
          required: true, pattern: { value: /[0-9]/, message: "Apenas números são permitidos" },
          onChange: (e:ChangeEvent<HTMLInputElement>) => {
            e.preventDefault();
            const valor = e.target.value.replace(/\D/g, "");
            setValue("code", valor)
          }
        })} className="w-full h-full absolute opacity-0" />
        <div className="flex gap-2 [&_span]:border-b w-full h-full">
          <span className={`w-12 text-2xl text-center group-focus-within:border-info ${codeValue?.length === 0 ? "group-focus-within:border-b-2":""}`}>{codeValue?.[0] || ""}</span>
          <span className={`w-12 text-2xl text-center group-focus-within:border-info ${codeValue?.length === 1 ? "group-focus-within:border-b-2":""}`}>{codeValue?.[1] || ""}</span>
          <span className={`w-12 text-2xl text-center group-focus-within:border-info ${codeValue?.length === 2 ? "group-focus-within:border-b-2":""}`}>{codeValue?.[2] || ""}</span>
          <span className={`w-12 text-2xl text-center group-focus-within:border-info ${codeValue?.length === 3 ? "group-focus-within:border-b-2":""}`}>{codeValue?.[3] || ""}</span>
          <span className={`w-12 text-2xl text-center group-focus-within:border-info ${codeValue?.length === 4 ? "group-focus-within:border-b-2":""}`}>{codeValue?.[4] || ""}</span>
          </div>
        </div>
        {errors.code?.message && <small className=" text-error text-[10px] hyphens-auto break-all text-justify">* {errors.code?.message}</small>}
        <button type="button" className="cursor-pointer ml-auto hover:underline text-xs hover:font-medium disabled:opacity-50" onClick={handleResendCode} disabled={isPending}>
          Reenviar
        </button>
      </label>


      <button type="submit" className="btn-sm w-32 btn-secondary focus-primary disabled:opacity-10 flex items-center justify-center"
      disabled={isSubmitting || !isValid}>
        {isSubmitting ?<LoadingSpinner className="text-primary"/>:<span>Verificar</span>}
      </button>
    </form>
    )
}
