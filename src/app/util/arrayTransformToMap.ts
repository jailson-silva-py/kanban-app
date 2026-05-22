export function arrayTransformToMap<T extends {id:string}>(arr:T[]) {
  const map = new Map<string, T>();
  const length = arr.length;
  for (let i = 0; i < length; ++i) {

    map.set(arr[i].id, arr[i]);

  }

  return map satisfies Map<string, T>
}
