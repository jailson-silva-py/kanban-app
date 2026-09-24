"use client";
import { TargetDropContent } from "./TargetDropContent";
import { inBoxCards } from "@/constrants/queryKeys";
import { Fragment } from "react/jsx-runtime";
import { Card } from "./Card";
import { useEffect, useRef } from "react";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element"
type CardsContentProps = {
  cardIds: string[],
  columnId: string;
  inBoxKey?: typeof inBoxCards;

} & React.ComponentProps<"ul">;

export const CardsContainer: React.FC<CardsContentProps> = ({
  inBoxKey,
  cardIds,
  columnId,
  ...props
}) => {

  const ref = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return autoScrollForElements({
      element: el
    })

  }, [])

  return (
    <ul
      ref={ref}
      aria-label="cards-content"
      className={`px-4 py-2 flex flex-col items-center gap-2 overflow-y-auto  max-h-8/10 ${props.className ?? ""}`}
      {...props}
    >
      {cardIds.length > 0 ? cardIds.map((cardId, index) => {
        return (
          <Fragment key={`fragment-${cardId}`}>

            <TargetDropContent key={"target-" + cardId} index={index} cardId={cardId} maxLength={cardIds.length} columnId={columnId} inBoxKey={inBoxKey} />

            <Card key={cardId} id={cardId} index={index} inBoxKey={inBoxKey} />

            {index === cardIds.length - 1 &&
              <TargetDropContent key={`target-last-${cardId}`} index={cardIds.length} cardId={cardId} maxLength={cardIds.length}
                columnId={columnId} inBoxKey={inBoxKey} />}
          </Fragment>

        );
      })
        :

        <TargetDropContent index={0} maxLength={cardIds.length} columnId={columnId} inBoxKey={inBoxKey} />
      }
    </ul>
  );
};
