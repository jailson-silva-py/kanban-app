import { Card, Column, ColumnSkeleton } from "./dataTypes";

export type CardsClient = Map<string, Card>
export type ColumnsClient<T = Column|ColumnSkeleton> = Map<string, T>

export type BoardClient = {
  id: string,
  title: string,
  columnIds: string[],
}

export type ColumnClient = {
  id: string,
  title: string,
  order: number,
  cardIds: string[],
  boardId: string,
}

export type InBoxClient = {id: string, order:number, title:string, cardIds: string[]}
