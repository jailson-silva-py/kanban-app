"use client";

import { useEffect, useRef, useState } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter"
import { inBoxCards } from "@/constrants/queryKeys";


type TargetDropContentProps = { index: number, cardId?: string, maxLength: number, columnId: string, inBoxKey?: typeof inBoxCards };

export function TargetDropContent({ index, cardId, maxLength, columnId, inBoxKey }: TargetDropContentProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);


  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    return dropTargetForElements({
      element: el,
      onDragEnter() {
        setIsDraggedOver(true);
      },
      getData: () => ({ index, cardId, columnId, inBoxKey }),
      onDragLeave: () => {
        setIsDraggedOver(false)
      },

      canDrop: ({ source }) => {

        const isEqualIds = source.data.cardId === cardId;
        const isEqualIndexs = source.data.cardId === cardId;
        const isOneDiffIndex = source.data.index as number === index || source.data.index as number + 1 === index
        const isEqualColumns = source.data.columnId === columnId;
        const isLastIndex = index === maxLength - 1;

        if (isEqualIds && isEqualIndexs || isEqualIds && isLastIndex || isOneDiffIndex && isEqualColumns) {
          return false
        }
        return true
      },
      onDrop: () => {
        setIsDraggedOver(false);
      },
      getIsSticky: ({ element, input }) => {

        const elYCenter = input.clientY
        const elXCenter = input.clientX
        const sourceRect = element.getBoundingClientRect();
        const sourceXL = sourceRect.left - 100;
        const sourceXR = sourceRect.right + 100;
        const sourceYT = sourceRect.top - 50;
        const sourceYB = sourceRect.bottom + 50;

        const isInX = elXCenter > sourceXL && elXCenter < sourceXR;
        const isInY = elYCenter > sourceYT && elYCenter < sourceYB;

        const isSticky = isInX && isInY;

        return isSticky
      }
    })
  }, [index, columnId, maxLength])

  return (
    <div style={{ background: !isDraggedOver ? "var(--color-shadow)" : "var(--color-info)", opacity: isDraggedOver ? undefined : "20%" }} className="flex shrink-0 grow-0 items-center justify-center rounded-lg h-0.5 w-full" ref={ref} >
      {isDraggedOver &&
        <div className="relative flex items-center justify-center h-2 w-2 rounded-full bg-info" >
          <div className="h-1 w-1 rounded-full bg-text" />
        </div>
      }
    </div>
  )
}