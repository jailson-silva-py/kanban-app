"use client";
import { changeUsername } from "@/actions/actions";
import { onMutateFunction } from "@/app/util/mutations";
import { toast } from "@/app/util/toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { profile } from "@/constrants/queryKeys";
import { User } from "@/types/dataTypes";
import { useMutation } from "@tanstack/react-query";
import { SubmitEvent } from "react";

export default function FormEditUserData({ user }: { user: User }) {

  const { data, isPending, mutate } = useMutation({
    mutationKey: ["profile", "update", "name"], mutationFn: changeUsername,
    onMutate: (variables, context) => {
      return onMutateFunction<User>(context, profile, (old) => {
        return {...old, name:variables.newName}
      })
    },
    onError: (error, variables, result, context) => {
      toast.error("Ocorreu um erro ao atualizar o nome do usuário.")
      if (!result?.previousState) return;
      context.client.setQueryData(profile, { ...result?.previousState });
    }
  })
  const onChangeUsername = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newName = formData.get("profile-username")?.toString().trim()
    if (!newName || newName === data?.name) return
    mutate({newName})
  }
  return <form className="w-full flex flex-col gap-4" onSubmit={onChangeUsername}>
    <label className="flex flex-col gap-2">
      <span className="text-md font-semibold">Nome do usuário: </span>
      <input
        name="profile-username"
        className="default-input"
        aria-label="profile-edit-username"
        placeholder="Digite seu nome do usuário: "
        defaultValue={user?.name ?? ""}
        required
      />
    </label>
    <label className="flex flex-col gap-2">
      <span className="text-md font-semibold">Email: </span>
      <input
        name="profile-email"
        className="default-input opacity-50 font-medium"
        aria-label="profile-email"
        defaultValue={user?.email ?? ""}
        disabled
      />
    </label>
    <button type="submit" className="flex items-center justify-center ml-auto btn-sm btn-secondary focus-primary w-24 font-medium disabled:opacity-50" disabled={isPending}>
      { isPending ? <LoadingSpinner className="text-primary"/> : <span>Salvar</span> }
    </button>
  </form>

}
