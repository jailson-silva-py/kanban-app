"use client";
import { RefObject } from "react";


type TData =  {
  cards: Map<string, RefObject<HTMLElement|null>>;
  columns:Map<string, RefObject<HTMLElement|null>>;
  target: null | `card-${string}` | `column-${string}`
}

type Subscriber = (objStorage:TData) => void
const initialData:TData = {cards: new Map(), columns:new Map, target:null}

let storageData =  {...initialData};

export const listeners = new Set<Subscriber>()

export function notifyAllSubscribes() {
  listeners.forEach(fn => fn({...storageData}))
}


export const storageCore = {

  subscribe(fn:() => void) {
    listeners.add(fn)
    return () => listeners.delete(fn);
  },
  getStorage() {
    return storageData
  },
  resetStorage() {
    storageData = {...initialData};
    listeners.clear();
  }
}

export const storage =  {
  setCardRef(id:string, ref:RefObject<HTMLElement|null>) {
    const nCards = new Map(storageData.cards)
    nCards.set(id, ref);
    storageData.cards = nCards;
    notifyAllSubscribes();
  },

  setColumnRef(id:string, ref:RefObject<HTMLElement|null>) {

    const nColumns= new Map(storageData.columns)
    nColumns.set(id, ref);
    storageData.columns = nColumns;
    notifyAllSubscribes();
  },
  setTarget(type:"card"|"column", id:string) {
    storageData.target = `${type}-${id}`;
    notifyAllSubscribes();

  },
  getTarget() {
    if (!storageData.target) return null;
    const [type, ...id] = storageData.target.split("-");
    return {type:type as "card" | "column", id:id.join("-")};
  },

  resetTarget() {
    storageData.target = null;
    notifyAllSubscribes();
  }
}