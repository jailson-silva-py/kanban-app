import { getColumnForInBoxUser } from "@/actions/actions";
import type {
  BoardGetPayload,
  CardGetPayload,
  ColumnGetPayload,
  UserGetPayload,
  CardCommentGetPayload
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
    color:true;
    cards: {
      select: {
        id: true;
        position: true;
        title: true;
        completed: true;
        columnId: true;
        description:true;
      };
    };
  };
}>;
export type ColumnSimple = ColumnGetPayload<{
  select: { id: true; cards: { select: { id: true; position: true }, color:true } };
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
    description: true
  };
}>;

export type CardComment = CardCommentGetPayload<{
  select:{
    id:true,
    owner:{select:{id:true, image:true, name:true}},
    body:true,
    createdAt:true
  }
}>

export type User = UserGetPayload<{
  select: { id: true; email: true; name: true; image: true, emailVerified:true };
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
  select: { id: true; title: true, gradient:true };
}>;
