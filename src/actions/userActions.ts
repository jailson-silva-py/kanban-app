"use server";

import { User } from "@/types/dataTypes";
import { prisma } from "prisma";
import { auth } from "auth";
import { protectedActions } from "./wrappers";
import { cloudinary } from "@/libs/cloudinary";

export async function getUser(): Promise<User | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.user.findFirst({
    where: { id: session.user.id },
    select: { name: true, image: true, id: true, email: true, emailVerified: true },
  });
}

export async function verifyUserExistsByEmail(email: string) {
  return prisma.user.count({ where: { email } });
}

export async function getInBoxBoard(ownerId: string) {
  const session = await auth();

  if (!session?.user?.id) return;

  return prisma.board.findMany({ where: { isInbox: true, ownerId } });
}

export async function updateImageUser({ url }: { url: string }): Promise<string> {
  return protectedActions(async (session) => {
    const response = await cloudinary.uploader.upload(url, { resource_type: "image" });

    if (response.secure_url) {
      await prisma.user.update({
        where: { id: session?.user?.id },
        data: { image: response.secure_url },
      });
    }

    return response.secure_url;
  });
}

export async function changeUsername({ newName: name }: { newName: string }): Promise<User> {
  return protectedActions(async (session) => {
    const id = session?.user?.id;

    return prisma.user.update({
      where: { id },
      data: { name },
      select: { name: true, id: true, email: true, image: true, emailVerified: true },
    });
  });
}
