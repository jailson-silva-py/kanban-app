import { arrayTransformToMap } from "./arrayTransformToMap"

describe("arrayTransformToMap module testing", () => {

  test("Transforma um array em map corretamente usando o id como chave", () => {
    const arr = [{ id: "1", nome: "card" }, { id: "2", nome: "product" }, { id: "3", nome: "category" }]
    const map = arrayTransformToMap(arr);
    expect(Array.from(map.values())).toStrictEqual(expect.arrayContaining(arr))
    expect(Array.from(map.keys())).toStrictEqual(expect.arrayContaining(["1", "2", "3"]))

  })

})
