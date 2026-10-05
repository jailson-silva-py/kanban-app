"use client";
import { storageCore } from "@/app/util/cardsColumnsStorage";
import { useSyncExternalStore } from "react";

export default function useCardsColumnsStorage() {

  const storage = useSyncExternalStore(storageCore.subscribe, storageCore.getStorage, storageCore.getStorage);
  return storage;

}