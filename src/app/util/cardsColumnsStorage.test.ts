import { randomUUID } from "crypto";
import { storage, storageCore, listeners, notifyAllSubscribes } from "./cardsColumnsStorage";
import { toastCore } from "./toast";

beforeEach(() => {

  storageCore.resetStorage();

})

describe("Module cardsColumnsStorage testing", () => {

  it("Adiciona os componentes inscritos em listeners corretamente", () => {

      const fn = () => {}
      storageCore.subscribe(fn);

      expect(listeners.has(fn)).toBeTruthy();
  })

  it("Remove os componentes inscritos em listeners corretamente com o a função de retorno", () => {

      const fn = () => {}
      const cleanFn = storageCore.subscribe(fn);

      expect(listeners.has(fn)).toBeTruthy();
      cleanFn();
      expect(listeners.has(fn)).toBeFalsy();
  })

  it ("getStorage retorna um objeto com cards, columns e target", () => {

    const storage = storageCore.getStorage();

    expect(storage).toMatchObject({
      cards:new Map(),
      columns:new Map(),
      target:null
    })
  })

  it ("setCardRef seta o card corretamente no storage", () => {
    
    const element = document.createElement("li");
    storage.setCardRef("meu-id", {current:element});
    const storageColsCards = storageCore.getStorage();
    const hasMyElement = storageColsCards.cards.has("meu-id");
    const myElement = storageColsCards.cards.get("meu-id");

    expect(hasMyElement).toBe(true);
    expect(myElement).toStrictEqual({current:element});

  })

  it ("setCardRef avisa as funções em listener que o valor de cards mudou", () => {

    const { id, ref } = {id:"meu-id", ref:{current:null}};
    const fn = vi.fn();
    const mapExample = new Map();

    mapExample.set(id, ref);

    storageCore.subscribe(fn);
    storage.setCardRef(id, ref);

    expect(fn).toHaveBeenCalledWith({cards:mapExample, columns:new Map(), target:null});

  })

   it ("setColumnRef seta a coluna corretamente no storage", () => {
    
    const element = document.createElement("li");
    storage.setColumnRef("meu-id", {current:element});
    const storageColsCards = storageCore.getStorage();
    const hasMyElement = storageColsCards.columns.has("meu-id");
    const myElement = storageColsCards.columns.get("meu-id");

    expect(hasMyElement).toBe(true);
    expect(myElement).toStrictEqual({current:element});

  })

  it ("setColumnRef avisa as funções em listener que o valor de cards mudou", () => {

    const { id, ref } = {id:"meu-id", ref:{current:null}};
    const fn = vi.fn();
    const mapExample = new Map();

    mapExample.set(id, ref)

    storageCore.subscribe(fn);
    storage.setColumnRef(id, ref);

    expect(fn).toHaveBeenCalledWith({cards:new Map(), columns:mapExample, target:null});

  })


  it ("setTarget seta a string correta no target do storage", () => {
    const type = "card";
    const id = randomUUID();
    storage.setTarget(type, id);
    const storageColsCards = storageCore.getStorage();
    
    expect(storageColsCards.target).toBe(`${type}-${id}`);

  })

  it ("setTarget avisa as funções em listener que o valor de cards mudou", () => {

    const type = "card";
    const id = randomUUID();
    const fn = vi.fn();

    storageCore.subscribe(fn);
    storage.setTarget(type, id);

    expect(fn).toHaveBeenCalledWith({cards:new Map(), columns:new Map(), target:`${type}-${id}`});

  })

   it ("getTarget traz o objeto correto com o id e type", () => {

    const type = "card";
    const id = randomUUID();
    storage.setTarget(type, id);
    const storageColsCards = storageCore.getStorage();
    
    expect(storageColsCards.target).toBe(`${type}-${id}`);
    
    const objTarget = storage.getTarget();

    expect(objTarget).toMatchObject({ type, id });

  })

  it ("resetTarget faz o valor de target virar null", () => {

    const type = "card";
    const id = randomUUID();
    storage.setTarget(type, id);
    const storageColsCards = storageCore.getStorage();
    
    expect(storageColsCards.target).toBe(`${type}-${id}`);
    
    storage.resetTarget();

    expect(storageColsCards.target).toBe(null)

  })

  it ("resetTarget avisa a todas as funções em listener que o valor de target mudou", () => {

    const fn = vi.fn();

    storage.setTarget("card", "123");
    storageCore.subscribe(fn);
    storage.resetTarget();

    expect(fn).toHaveBeenCalledWith({cards:new Map(), columns:new Map(), target:null})

  })

  it("notifySubscribers avisa todas as funções em listener que algo mudou", () => {

    const fn1 = vi.fn();
    const fn2 = vi.fn();
    const fn3 = vi.fn();

    listeners.add(fn1);
    listeners.add(fn2);
    listeners.add(fn3);

    notifyAllSubscribes()

    expect(fn1).toHaveBeenCalledOnce();
    expect(fn2).toHaveBeenCalledOnce();
    expect(fn3).toHaveBeenCalledOnce();

  })

})