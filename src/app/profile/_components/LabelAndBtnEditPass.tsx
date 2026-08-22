"use client";
import { toast } from "@/app/util/toast";
import { MouseEvent } from "react";

export default function LabelAndButtonEditPass() {

  const handleChangePassword = (e:MouseEvent) => {
    e.preventDefault();
    toast.info("No momento, a função ainda não foi disponibilizada.");
  }

  return <label className="flex flex-col gap-4 w-full">
    <span className="text-md font-semibold">Senha:</span>
    <input className="default-input opacity-50 font-medium" defaultValue="****************" />
    <button onClick={handleChangePassword} aria-label="profile-edit-password" className="btn-sm btn-secondary font-medium mr-auto">
      Alterar senha
    </button>
  </label>
}
