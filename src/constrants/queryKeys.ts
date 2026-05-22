export const prefixKeysFromDynamic = {column:"column", board:"board", search:"globalSearch"}

export function column(id: string) {
  return [prefixKeysFromDynamic.column, id]
}

export function board(id: string) {
  return [prefixKeysFromDynamic.board, id]
}

export function globalSearch(search: string) {
  return [prefixKeysFromDynamic.search, search]
}

export const boards = ["boards"];

export const inBoxCards = ["inBoxCards"]

export const queryKeys = { column, board, globalSearch, boards, inBoxCards }
