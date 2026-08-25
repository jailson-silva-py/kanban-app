"use server";
import { cookies } from "next/headers"
import { redirect } from "next/navigation";
import FormChangePassword from "./_components/FormChangePass";
import { getUser } from "@/actions/actions";


export default async function NewPasswordPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  const cookiesStore = await cookies();

  const cookieResult = cookiesStore.get({name:"change_password_verified", value:user.id})
  if (!cookieResult) {
    const cookieVerify = cookiesStore.get({name:"verification_change_password", value:user.id})
    if (!cookieVerify) {
      redirect("/profile/change_password");
    }
    redirect("/profile/change_password/verify");
  }

  return (
    <FormChangePassword />
    )
}
