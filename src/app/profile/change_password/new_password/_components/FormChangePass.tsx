"use client";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { passwordType } from "@/types/FormsZodType";
import z from "zod";
import { changeUserPassword } from "@/actions/actions";
import { toast } from "@/app/util/toast";
import { InvalidFieldsError } from "@/types/GlobalErrors";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  new_password: passwordType,
  confirm_new_password: passwordType,
}).refine((check) => check.new_password === check.confirm_new_password, { message: "As duas senhas não coincidem!", path:["confirm_new_password"] });

type formSchemaType = z.infer<typeof formSchema>;

export default function FormChangePassword() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(formSchema), mode: "onChange" });
  const router  = useRouter();
  const onChangePassword = async (data: formSchemaType) => {

    if (data.confirm_new_password !== data.new_password) return
    try {
      await changeUserPassword({ password: data.new_password })
      toast.success("Senha alterada com sucesso!");
    } catch(err:unknown) {
      if (err instanceof InvalidFieldsError) {
        toast.error("Ocorreu um erro ao redefinir a senha, tente novamente.");
      }
    }
     router.push("/profile");
  }

  return (
    <form className="flex flex-col gap-8 shadow-shadow shadow-default min-h-75 form-width p-6 md:p-8 xl:p-16"
    onSubmit={handleSubmit(onChangePassword)}>

    <label className="flex flex-col gap-4">
        <span className="font-medium  text-sm">Nova senha: </span>
        <input type="password" className="default-input focus-primary" placeholder="Digite sua nova senha..." {...register("new_password")} />
        {errors.new_password && <small className="text-[9px] text-error">*{errors.new_password.message}</small>}
    </label>
    <label className="flex flex-col gap-4">
        <span className="font-medium text-sm"> Confirmar Nova Senha: </span>
        <input type="password" className="default-input focus-primary" placeholder="Digite sua nova senha..." {...register("confirm_new_password")} />
        {errors.confirm_new_password && <small className="text-[10px] text-error">*{errors.confirm_new_password.message}</small>}
      </label>
    <button type="submit" className="ml-auto btn-sm w-28 font-normal btn-secondary focus-primary flex items-center justify-center">
      {isSubmitting ? <LoadingSpinner className="text-primary"/> : <span>Enviar</span>}
    </button>
  </form>
  )
}
