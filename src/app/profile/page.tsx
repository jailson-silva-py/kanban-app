import { getUser } from "@/actions/actions";
import Image from "next/image";
import { TbPhotoEdit } from "react-icons/tb";
import { toast } from "../util/toast";
import { MouseEvent } from "react";
import FormEditImage from "./_components/FormEditImage";
import { redirect } from "next/navigation";
import FormEditUserData from "./_components/FormEditUserData";
import LabelAndButtonEditPass from "./_components/LabelAndBtnEditPass";

export default async function ProfilePage() {
  const user = await getUser();

  if (!user) redirect("/home", "replace");

  return (
    <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-100px)] tracking-widest font-light font-rethink">
      <div className="flex flex-col gap-2 items-center justify-center px-4 py-2 min-w-75 w-9/10 max-w-150">
        <FormEditImage user={user}/>
        <FormEditUserData user={user}/>
        <LabelAndButtonEditPass/>
      </div>
    </div>
  );
}
