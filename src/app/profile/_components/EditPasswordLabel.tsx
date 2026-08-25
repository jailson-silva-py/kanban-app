"use client";
import Link from "next/link";

export default function LabelAndButtonEditPass() {


  return <label className="flex flex-col gap-4 w-full">
    <span className="text-md font-semibold">Senha:</span>
    <input className="default-input opacity-50 font-medium" name="simbolic-password" defaultValue="****************" />
    <Link href={"/profile/change_password"} className="flex w-38 btn-sm font-medium btn-secondary focus-primary items-center justify-center">
      Alterar senha
    </Link>
  </label>
}
