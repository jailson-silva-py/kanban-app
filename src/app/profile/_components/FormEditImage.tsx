"use client";
import { updateImageUser } from "@/actions/actions";
import { logger } from "@/app/util/logger";
import { toast } from "@/app/util/toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { profile } from "@/constrants/queryKeys";
import { User } from "@/types/dataTypes";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { ChangeEvent } from "react";
import { TbPhotoEdit } from "react-icons/tb";

type mutationArgs = { url: string, imagePrevUrl: string }

export default function FormEditImage({ user }: { user: User }) {
  const { variables, mutate, isPending, } = useMutation({
    mutationKey: ["profile", "update", "image"], mutationFn: async ({ url, imagePrevUrl }: mutationArgs) => updateImageUser({ url }),
    onMutate: async (variables, context) => {
      await context.client.cancelQueries({ queryKey: profile })
      const previousState = context.client.getQueryData(profile);
      if (!previousState) return;
      context.client.setQueryData<User>(profile, (old) => {

        if (!old) return;
        return { ...old, image: variables.imagePrevUrl }

      })
      return { previousState }
    },
    onError: (error, variables, result, context) => {
      toast.error("Ocorreu um erro ao salvar a imagem.");
      if (!result?.previousState) {
        logger.print("ProfilePage -> FormEditImage -> onError", "error", "Não foi possível fazer o rollback dos dados");
        return
      };
      context.client.setQueryData(profile, { ...result.previousState });
    },
    onSuccess: async (data, variables, result, context) => {
      if (!result?.previousState) {
        logger.print("ProfilePage -> FormEditImage -> onSuccess", "warning", "Não foi possível atualizar os dados com o objeto data")
        return
      }
      context.client.setQueryData<User>(profile, (old) => {
        if (!old) return;
        return { ...old, image: data }
      })
    }
  })

  const handleChangeImageFile = (e: ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const base64String = e?.target?.result;
      if (!base64String) return;
      mutate({ imagePrevUrl: base64String as string, url: base64String as string })
    }
    e.preventDefault();
    const arquivo = e.currentTarget.files?.[0]
    if (!arquivo) return;
    fileReader.readAsDataURL(arquivo);
  }
  return <form encType="multipart/form-data">
    <label className="relative flex flex-col gap-2 items-baseline w-full">
      <input
        onChange={handleChangeImageFile}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="absolute flex w-full h-full z-1 opacity-0"
      />
      <button className="relative" disabled={isPending}>
        <div
          className="relative size-30 rounded-full overflow-hidden"
          aria-label="profile-image-content"
        >
          <Image
            src={variables?.imagePrevUrl ?? user.image ?? "/default-avatar.webp"}
            fill={true}
            alt="Imagem de Perfil"
            className="object-cover shadow-shadow shadow-default"
            sizes="(max-width: 768px) 80px, (max-width: 1200px) 120px"
            loading="eager"
            aria-label="profile-image"
          ></Image>
        </div>
        <div className="shadow-shadow shadow-medium flex items-center justify-center size-8 absolute -bottom-2 right-0 -translate-y-1/2  backdrop-blur-2xl -translate-x-1 bg-text/20 rounded-full">
          {isPending ? <LoadingSpinner /> : <TbPhotoEdit size={24} />}
        </div>
      </button>
    </label>
  </form>

}
