export type prefixKeysType = {
  column:"column",
  board:"board",
  card:"card",
  search:"globalSearch",
  columnsBoard:"columns-board",
}

export const prefixKeysFromDynamic:prefixKeysType = { column: "column", board: "board", card:"card" as "card", search: "globalSearch", columnsBoard:"columns-board" };

export function column(id: string) {
  return [prefixKeysFromDynamic.column, id] satisfies ["column", string]
}

export function columnsBoard(boardId:string) {
  return [prefixKeysFromDynamic.columnsBoard, boardId] satisfies ["columns-board", string]
}

export function board(id: string) {
  return [prefixKeysFromDynamic.board, id] satisfies ["board", string]
}

export function globalSearch(search: string) {
  return [prefixKeysFromDynamic.search, search] satisfies ["globalSearch", string]
}

export function card(id: string) {
  return [prefixKeysFromDynamic.card, id] satisfies ["card", string]
}

export const boards:["boards"] = ["boards"];

export const inBoxCards:["inBoxCards"] = ["inBoxCards"];

export const profile:["profile"] = ["profile"];

export type allColumnsKeyType = ReturnType<typeof column> | typeof inBoxCards;

export const queryKeys = { column, board, globalSearch, boards, inBoxCards };
