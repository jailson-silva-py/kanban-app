"use server";
import { getUser } from "@/actions/actions"
import { redirect } from "next/navigation";
import FormSendCode from "./_components/FormSendCode";
import { cookies } from "next/headers";

export default async function ChangePasswordPage() {
  const user = await getUser();
  const userCookies = await cookies();
  if (!user) redirect("/login");
  const cookieVerifyPassword = userCookies.get({name:"verification_change_password", value:user.id});
  const cookieNewPassword = userCookies.get({name:"change_password_verified", value:user.id});

  if (cookieVerifyPassword) redirect("/profile/change_password/verify");
  if (cookieNewPassword) redirect("/profile/change_password/new_password")



  return (<FormSendCode user={user}/>)
}
