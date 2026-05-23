"use client";
import { toastCore, ToastOptions } from "@/app/util/toast";
import { memo } from "react";
import { IconType } from "react-icons";
import { TbCircleCheck, TbXboxX, TbInfoCircle, TbX } from "react-icons/tb";

type ToastItemProps = { toastOp: ToastOptions } & React.ComponentProps<"li">;

type IconBaseProps = {
  type: "success" | "error" | "info";
} & React.ComponentProps<IconType>;

const Icon: React.FC<IconBaseProps> = ({ type, ...props }) => {
  if (type === "success") {
    return <TbCircleCheck {...props} />;
  } else if (type === "error") {
    return <TbXboxX {...props} />;
  } else {
    return <TbInfoCircle {...props} />;
  }
};

function ToastItemInitital({ toastOp, ...props }: ToastItemProps) {
  return (
    <li
      {...props}
      style={{
        zIndex: toastOp.id,
        bottom: `${toastOp.id}px`,
        left: `${toastOp.id}px`,
        boxShadow: `-6px 2px 12px 1px oklch(from var(--color-${toastOp.type}) l c h / .5), 0 0 1px 1px oklch(from var(--color-${toastOp.type}) l c h / .4) `,
      }}
      className={
        "fixed px-8 py-4 h-15 w-max min-w-50 max-w-[80vw] md:max-w-[50vw] lg:max-w-[40vw] overflow-hidden min-h-max flex items-center gap-2 bg-primary tracking-widest rounded-sm animate-down-for-top-left"
      }
    >
      <Icon
        type={toastOp.type}
        size={32}
        style={{
          color: `oklch(from var(--color-${toastOp.type}) l c h)`,
        }}
        className="min-w-8 min-h-8 animate-to-jump"
      />
      <div className="flex flex-col gap-2 w-[calc(100%-32px)] min-h-max justify-center text-wrap wrap-break-word break-after-all hyphens-auto">
        {toastOp.title && (
          <span className="text-sm font-semibold w-full">
            Que título legal e maneiro meu parceiro Muito top mesmo
          </span>
        )}
        <span className="inline-block text-xs w-full min-h-full h-max">
          {toastOp.message}
        </span>
      </div>
      <div
        style={{
          animation: `upWidth ${toastOp.duration}ms ease-in-out infinite`,
          backgroundColor: `var(--color-${toastOp.type})`,
        }}
        className={"absolute h-1 bottom-0 left-0 w-full"}
      />
      <button
        onClick={() => {
          toastCore.removeToast(toastOp.id!);
        }}
        className="p-2  text-text hover:bg-text/3 cursor-pointer rounded-sm"
      >
        <TbX size={18} />
      </button>
    </li>
  );
}

export default memo(ToastItemInitital);
