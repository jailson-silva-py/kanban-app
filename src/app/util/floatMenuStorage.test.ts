import { floatMenuStorage,floatMenuStorageCore, subscribers } from "./floatMenuStorage"

beforeEach(() => {
  subscribers.clear();
  floatMenuStorage.reset();
})

const INITIAL_STATE = {
  isOpenInBox: true, isOpenBoard: true,
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

  test("A função closeBoard define isOpenBoard para false, mas não quando isInBox já é false", () => {
    const fn = vi.fn()
    //Primeiro inverter openInBox para false e testar se openBoard muda
    floatMenuStorageCore.subscribe(fn);
    floatMenuStorage.closeInBox();
    floatMenuStorage.closeBoard();
    const storage = floatMenuStorageCore.getStorage();

    // Irá inverter para false apenas quando openInBox for true (pra não ficar sem nada na tela).

    expect(storage.isOpenBoard).toBe(true);

    //Inverte openInBox pra true pra ver se o openBoard fica true
    floatMenuStorage.openInBox();
    floatMenuStorage.closeBoard();
    //Chama só 3 vezes porque uma foi impedido de chamar por conta da restrição
    expect(fn).toHaveBeenCalledTimes(3)
    expect(floatMenuStorageCore.getStorage().isOpenBoard).toBe(false);
  })

    test("A função openBoard define isOpenBoard para true", () => {

    const fn = vi.fn()
    floatMenuStorageCore.subscribe(fn);
    floatMenuStorage.closeBoard();
    const storage = floatMenuStorageCore.getStorage();
  
    expect(storage.isOpenBoard).toBe(false);
    floatMenuStorage.openBoard();
    expect(floatMenuStorageCore.getStorage().isOpenBoard).toBe(true);
  })



  test("A função closeInBox define isOpenInBox para false, mas não quando isOpenBoard já é false", () => {
    const fn = vi.fn()
    //Primeiro inverter openBoard para false e testar se openInBox muda
    floatMenuStorageCore.subscribe(fn);
    floatMenuStorage.closeBoard();
    floatMenuStorage.closeInBox();
    const storage = floatMenuStorageCore.getStorage();

    // Irá inverter para false apenas quando openBoard for true (pra não ficar sem nada na tela).
    expect(storage.isOpenInBox).toBe(true);

    //Inverte openBoard pra true pra ver se o openInBox fica true
    floatMenuStorage.openBoard();
    floatMenuStorage.closeInBox();
    //Chama só 3 vezes porque uma foi impedido de chamar por conta da restrição
    expect(fn).toHaveBeenCalledTimes(3)
    expect(floatMenuStorageCore.getStorage().isOpenInBox).toBe(false);
  })

  test("A função openInBox define isOpenInBox para true", () => {

    const fn = vi.fn()
    floatMenuStorageCore.subscribe(fn);
    floatMenuStorage.closeInBox();
    const storage = floatMenuStorageCore.getStorage();
  
    expect(storage.isOpenInBox).toBe(false);
    floatMenuStorage.openInBox();
    expect(floatMenuStorageCore.getStorage().isOpenInBox).toBe(true);
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
    floatMenuStorage.closeBoard();
    const storage = floatMenuStorageCore.getStorage();
    expect(storage.isOpenBoard).toBe(false);
    floatMenuStorage.reset();
    expect(fn).toHaveBeenCalledTimes(2);
    expect(floatMenuStorageCore.getStorage()).toEqual(INITIAL_STATE);
  })

})
