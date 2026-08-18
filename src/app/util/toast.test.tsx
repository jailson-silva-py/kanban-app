import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { toast, toastCore } from "./toast";

function limparTodosOsToasts() {
  [...toastCore.getAll()].forEach((t) => toastCore.removeToast(t.id!));
}

describe("toastCore.addToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    limparTodosOsToasts();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("mescla as opções padrão (initialToast) com as fornecidas", () => {
    const t = toastCore.addToast({
      type: "success",
      message: "Salvo com sucesso",
      duration: 3000,
    });

    expect(t.type).toBe("success");
    expect(t.message).toBe("Salvo com sucesso");
    expect(t.position).toBe("bottom-left"); // veio do initialToast
    expect(t.title).toBe(""); // veio do initialToast
  });

  it("gera um id numérico único para cada toast", () => {
    const t1 = toastCore.addToast({ type: "info", message: "a", duration: 1000 });
    const t2 = toastCore.addToast({ type: "info", message: "b", duration: 1000 });

    expect(t1.id).toBeDefined();
    expect(t2.id).toBeDefined();
    expect(t1.id).not.toBe(t2.id);
  });

  it("insere o novo toast no início da lista (LIFO)", () => {
    toastCore.addToast({ type: "info", message: "primeiro", duration: 1000 });
    toastCore.addToast({ type: "info", message: "segundo", duration: 1000 });

    const all = toastCore.getAll();
    expect(all[0].message).toBe("segundo");
    expect(all[1].message).toBe("primeiro");
  });

  it("notifica os subscribers ao adicionar um toast", () => {
    const fn = vi.fn();
    const unsubscribe = toastCore.subscribe(fn);

    toastCore.addToast({ type: "info", message: "oi", duration: 1000 });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn.mock.calls[0][0]).toHaveLength(1);
    expect(fn.mock.calls[0][0][0].message).toBe("oi");

    unsubscribe();
  });

  it("remove automaticamente o toast após o tempo de duration", () => {
    toastCore.addToast({ type: "info", message: "some sozinho", duration: 2000 });
    expect(toastCore.getAll()).toHaveLength(1);

    vi.advanceTimersByTime(2000);

    expect(toastCore.getAll()).toHaveLength(0);
  });
});

describe("toastCore.removeToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    limparTodosOsToasts();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("remove o toast pelo id", () => {
    const t = toastCore.addToast({ type: "error", message: "erro", duration: 5000 });

    toastCore.removeToast(t.id!);

    expect(toastCore.getAll().find((x) => x.id === t.id)).toBeUndefined();
  });

  it("cancela o timer pendente ao remover manualmente (evita dupla remoção)", () => {
    const clearSpy = vi.spyOn(global, "clearTimeout");
    const t = toastCore.addToast({ type: "error", message: "erro", duration: 5000 });

    toastCore.removeToast(t.id!);

    expect(clearSpy).toHaveBeenCalledWith(t.timer);
    clearSpy.mockRestore();
  });

  it("não quebra ao tentar remover um id inexistente", () => {
    expect(() => toastCore.removeToast(999999)).not.toThrow();
  });

  it("notifica os subscribers ao remover um toast", () => {
    const t = toastCore.addToast({ type: "info", message: "x", duration: 5000 });
    const fn = vi.fn();
    const unsubscribe = toastCore.subscribe(fn);

    toastCore.removeToast(t.id!);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn.mock.calls[0][0]).toHaveLength(0);

    unsubscribe();
  });
});

describe("toastCore.subscribe", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    limparTodosOsToasts();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("para de notificar após o unsubscribe", () => {
    const fn = vi.fn();
    const unsubscribe = toastCore.subscribe(fn);

    unsubscribe();
    toastCore.addToast({ type: "info", message: "y", duration: 1000 });

    expect(fn).not.toHaveBeenCalled();
  });

  it("suporta múltiplos subscribers simultâneos", () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    const unsub1 = toastCore.subscribe(fn1);
    const unsub2 = toastCore.subscribe(fn2);

    toastCore.addToast({ type: "info", message: "z", duration: 1000 });

    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledTimes(1);

    unsub1();
    unsub2();
  });
});

describe("toast (fachada success/error/info)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    limparTodosOsToasts();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("toast.success cria um toast do tipo 'success'", () => {
    toast.success("Deu certo!");
    expect(toast.toastObj.type).toBe("success");
    expect(toast.toastObj.message).toBe("Deu certo!");
  });

  it("toast.error cria um toast do tipo 'error'", () => {
    toast.error("Deu ruim!");
    expect(toast.toastObj.type).toBe("error");
    expect(toast.toastObj.message).toBe("Deu ruim!");
  });

  it("toast.info cria um toast do tipo 'info'", () => {
    toast.info("Só um aviso");
    expect(toast.toastObj.type).toBe("info");
    expect(toast.toastObj.message).toBe("Só um aviso");
  });

  it("usa duration padrão de 5000ms quando não informado", () => {
    toast.success("padrão");
    expect(toast.toastObj.duration).toBe(5000);
  });

  it("respeita a duration customizada", () => {
    toast.success("customizado", 1500);
    expect(toast.toastObj.duration).toBe(1500);
  });
});
