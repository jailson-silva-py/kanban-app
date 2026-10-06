"use server";
import { getUser } from "@/actions/actions";
import FormEditImage from "./_components/FormEditImage";
import { redirect } from "next/navigation";
import FormEditUserData from "./_components/FormEditUserData";
import LabelAndButtonEditPass from "./_components/EditPasswordLabel";
import { auth } from "auth";

export default async function ProfilePage() {

  const [session, user] = await Promise.all([auth(), getUser()]);

  if (!user || !session?.user) redirect("/login", "replace");

  return (
    <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-100px)] tracking-widest font-light font-rethink">
      <div className="flex flex-col gap-2 items-center justify-center px-4 py-2 form-width">
        <FormEditImage user={user} />
        <FormEditUserData user={user} />
        {session.user.provider !== "google" ? <LabelAndButtonEditPass /> : <></>}
      </div>
    </div>
  );
}
