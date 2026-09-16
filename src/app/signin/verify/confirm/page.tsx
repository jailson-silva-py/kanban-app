"use server";
import { getUser } from "@/actions/actions";
import FormConfirmCode from "./_components/FormConfirmCode";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function PageConfirmCode() {
  const user = await getUser();
  if (!user) redirect("/signin");
  const cookiesStorage = await cookies();
  const validCookieToken = cookiesStorage.get({ name: "verification_new_user", value: user.id });
  if (!validCookieToken) redirect("/signin/verify");
  return (
    <FormConfirmCode user={user} />
  )
}
