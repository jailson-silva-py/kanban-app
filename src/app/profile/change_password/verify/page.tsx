"use server";
import { getUser } from "@/actions/actions";
import FormVerifyCode from "./_components/FormVerifyCode";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function VerifyTokenPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  const userCookies = await cookies();
  const cookieChangePassword = userCookies.get({ name:"verification_change_password", value:user?.id});
  if (!cookieChangePassword) {
    const cookiePasswordVerified = userCookies.get({ name: "change_password_verified", value: user?.id });
    if (cookiePasswordVerified) {
      redirect("/profile/change_password/new_password")
    }
    redirect("/profile/change_password/")

  }

  return (<FormVerifyCode user={user} />)

}
