import { floatMenuStorage,floatMenuStorageCore, subscribers } from "./floatMenuStorage"

beforeEach(() => {
  subscribers.clear();
  floatMenuStorage.reset();
})

const INITIAL_STATE = {
  openInBox: true, openBoard: true,
  isShow: false
};

describe("floatMenuStorage module testing", () => {

  test("O storage inicia com os valores corretos", () => {
    expect(floatMenuStorageCore.getStorage()).toEqual(INITIAL_STATE)
  })

  test("O subscribe é realizado corretamente e função de deletar a função é funciona", async () => {
    const fn = vi.fn()
    const deletionFn = floatMenuStorageCore.subscribe(fn);
    expect(subscribers.has(fn)).toBe(true);
    deletionFn();
    expect(subscribers.has(fn)).toBe(false);

  })

  test("A função invertOpenBoard inverte a propriedade openBoard dentro das restrições e chama o subscriber.", () => {
    const fn = vi.fn()
    //Primeiro inverter openInBox para false e testar se openBoard muda
    floatMenuStorageCore.subscribe(fn);
    floatMenuStorage.invertOpenInbox();
    floatMenuStorage.invertOpenBoard();
    const storage = floatMenuStorageCore.getStorage();

    // Irá inverter para false apenas quando openInBox for true (pra não ficar sem nada na tela).

    expect(storage.openBoard).toBe(true);

    //Inverte openInBox pra true pra ver se o openBoard fica true
    floatMenuStorage.invertOpenInbox();
    floatMenuStorage.invertOpenBoard();
    //Chama só 3 vezes porque uma foi impedido de chamar por conta da restrição
    expect(fn).toHaveBeenCalledTimes(3)
    expect(floatMenuStorageCore.getStorage().openBoard).toBe(false);
  })


  test("A função invertOpenInbox inverte a propriedade openBoard dentro das restrições e chama o subscriber.", () => {
    const fn = vi.fn()
    //Primeiro inverter openBoard para false e testar se openInBox muda
    floatMenuStorageCore.subscribe(fn);
    floatMenuStorage.invertOpenBoard();
    floatMenuStorage.invertOpenInbox();
    const storage = floatMenuStorageCore.getStorage();

    // Irá inverter para false apenas quando openBoard for true (pra não ficar sem nada na tela).
    expect(storage.openInBox).toBe(true);

    //Inverte openBoard pra true pra ver se o openInBox fica true
    floatMenuStorage.invertOpenBoard();
    floatMenuStorage.invertOpenInbox();
    //Chama só 3 vezes porque uma foi impedido de chamar por conta da restrição
    expect(fn).toHaveBeenCalledTimes(3)
    expect(floatMenuStorageCore.getStorage().openInBox).toBe(false);
  })

  test("A função showMenu altera o isShow para true e chama o subscriber", () => {

    const fn = vi.fn();
    floatMenuStorageCore.subscribe(fn);
    floatMenuStorage.showMenu();
    const storage = floatMenuStorageCore.getStorage();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(storage.isShow).toBe(true);

  })

  test("A função closeMenu altera o isShow para false e chama o subscriber", () => {

    const fn = vi.fn();
    floatMenuStorageCore.subscribe(fn);
    //Primeiro chama showMenu para deixar isShow === true e verifica
    floatMenuStorage.showMenu();
    const storage = floatMenuStorageCore.getStorage();
    expect(storage.isShow).toBe(true);
    floatMenuStorage.closeMenu();
    expect(fn).toHaveBeenCalledTimes(2);
    expect(floatMenuStorageCore.getStorage().isShow).toBe(false);

  })


  test("O reset restaura o storage para o initialState e chama o subscribe", () => {
    const fn = vi.fn();
    floatMenuStorageCore.subscribe(fn);
    floatMenuStorage.invertOpenBoard();
    const storage = floatMenuStorageCore.getStorage();
    expect(storage.openBoard).toBe(false);
    floatMenuStorage.reset();
    expect(fn).toHaveBeenCalledTimes(2);
    expect(floatMenuStorageCore.getStorage()).toEqual(INITIAL_STATE);
  })

})
