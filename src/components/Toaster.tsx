"use client";
import { Activity, useSyncExternalStore } from "react";
import ToastItem from "./ToastItem";
import { toastCore, ToastOptions } from "@/app/util/toast";

export function Toaster() {
  const toasts: ToastOptions[] = useSyncExternalStore(
    toastCore.subscribe,
    toastCore.getAll,
    () => toastCore.getAll(),
  );

  return (
    <Activity mode={toasts.length > 0 ? "visible" : "hidden"}>
      {toasts.length > 0 && (
        <ul className="flex w-max h-max">
          {toasts.map((toast) => (
            <ToastItem toastOp={toast} key={toast.id} />
          ))}
        </ul>
      )}
    </Activity>
  );
}
