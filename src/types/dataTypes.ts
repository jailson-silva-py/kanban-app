import { getColumnForInBoxUser } from "@/actions/actions";
import type {
  BoardGetPayload,
  CardGetPayload,
  ColumnGetPayload,
  UserGetPayload,
} from "@/generated/models";
import { PromiseReturnType } from "@prisma/client/extension";

export type cartType = {
  title: string;
  description?: string;
  comment?: { userId: number; text: string };
};
export type cartsListType = cartType[] | [];

export type Column = ColumnGetPayload<{
  select: {
    id: true;
    boardId: true;
    title: true;
    order: true;
    cards: {
      select: {
        id: true;
        position: true;
        title: true;
        completed: true;
        columnId: true;
      };
    };
  };
}>;
export type ColumnSimple = ColumnGetPayload<{
  select: { id: true; cards: { select: { id: true; position: true } } };
}>;
export type ColumnSkeleton = ColumnGetPayload<{
  select: { id: true; order: true; title: true };
}>;

export type Card = CardGetPayload<{
  select: {
    id: true;
    position: true;
    title: true;
    completed: true;
    columnId: true;
  };
}>;

export type User = UserGetPayload<{
  select: { id: true; email: true; name: true; image: true };
}>;

export type CartTypeFromInBox = PromiseReturnType<typeof getColumnForInBoxUser>;

export type BoardFull = BoardGetPayload<{
  select: {
    columns: { select: { id: true; order: true; title: true } };
    id: true;
    title: true;
  };
}>;

export type BoardSimple = BoardGetPayload<{
  select: { id: true; title: true };
}>;
