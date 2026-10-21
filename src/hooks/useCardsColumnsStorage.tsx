"use client";
import { storageCore, storage as originStorage } from "@/app/util/cardsColumnsStorage";
import { useSyncExternalStore } from "react";

export default function useCardsColumnsStorage() {

  const storage = useSyncExternalStore(storageCore.subscribe, storageCore.getStorage, storageCore.getStorage);

  return { storage, getTarget: originStorage.getTarget, resetTarget: originStorage.resetTarget };

}