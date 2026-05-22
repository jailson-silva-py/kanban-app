import { ObjectsFromApp } from "@/types/utilityTypes";

export function prependItem<T extends {id:string}>(map: Map<string, ObjectsFromApp<T>>, appendValue:T , callMatchSetItem?:(item:ObjectsFromApp<T>|undefined) => boolean) {
  const length = map.size
  const keys = map.keys();
  const values = map.values();
  const newMap = new Map();
  newMap.set(appendValue.id, appendValue)
  for (let i = 0; i < length; i++) {
  const key = keys.next().value
    const value = values.next().value
    const condition = callMatchSetItem && callMatchSetItem(value) || true;
    if (condition) {
      newMap.set(key, value);
    }
  }

  return newMap satisfies Map<string, T>

}
