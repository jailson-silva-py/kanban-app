"use client";
import { useDroppable } from "@dnd-kit/react";


type CardsContentProps = {
  children: React.ReactNode;
  columnId?: string;

} & React.ComponentProps<"ul">;

export const CardsContent: React.FC<CardsContentProps> = ({
  children,
  columnId,
  ...props
}) => {

  const { ref, droppable } = useDroppable({
    id: `column-${columnId}`,
    type: "column",
    accept: "card",
  });

  return (
    <ul
      style={{ border: droppable.isDropTarget ? "2px dashed red" : "none" }}
      {...props}
      ref={ref}
      className={`flex flex-col items-center gap-2 ${props.className ?? ""}`}
    >
      { children }
    </ul>
  );
};
