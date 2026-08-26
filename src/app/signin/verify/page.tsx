"use server";
import { getUser } from "@/actions/actions"
import { redirect } from "next/navigation";
import FormSendCode from "./_components/FormSendCode";
import { cookies } from "next/headers";

export default async function VerifyPage() {
  const user = await getUser();
  if (!user) redirect("/signin");
  const cookiesStorage = await cookies();
  const tokenVerification = cookiesStorage.get({ name: "verification_new_user", value:user.id})
  if (tokenVerification) redirect("/signin/verify/confirm");
  return (<FormSendCode user={user}/>)
}
