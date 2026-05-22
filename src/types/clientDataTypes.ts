import { Card, Column, ColumnSkeleton } from "./dataTypes";

export type CardsClient = Map<string, Card>
export type ColumnsClient<T = Column|ColumnSkeleton> = Map<string, T>

export type BoardClient<T extends Column | ColumnSkeleton> = {
  id: string,
  title: string,
  columns: ColumnsClient<T>,
}

export type ColumnClient = {
  id: string,
  title: string,
  order: number,
  cards: CardsClient
  boardId:string,

}

export type InBoxClient = {id:string, cards:CardsClient}
