type ToastType = "success" | "error" | "info";
type Position =
  | "bottom-right"
  | "bottom-left"
  | "bottom-center"
  | "top-right"
  | "top-left"
  | "top-center";

export interface ToastOptions {
  id?: number;
  type: ToastType;
  title?: string;
  message: string;
  position?: Position;
  duration: number;
  timer?: ReturnType<typeof setTimeout>;
}

type Subscriber = (toasts: ToastOptions[]) => void;

const subscribers = new Set<Subscriber>();

const notifySubscribers = () => {
  subscribers.forEach((fn) => {
    fn([...toasts]);
  });
};

export let toasts: ToastOptions[] = [];

let count = 10;

const initialToast: ToastOptions = {
  type: "info",
  title: "",
  message: "",
  position: "bottom-left",
  duration: 5000,
};

export const toastCore = {
  subscribe: function (fn: (toasts: ToastOptions[]) => void) {
    subscribers.add(fn);
    return () => {
      subscribers.delete(fn);
    };
  },
  removeToast: (id: number) => {
    const currToast = toasts.find((value) => value.id === id);
    if (currToast?.timer) {
      clearTimeout(currToast.timer);
    }
    const t = toasts.filter((value) => value.id !== id);
    toasts = t;
    notifySubscribers();
  },

  getAll: function () {
    return toasts;
  },

  addToast: function ({ ...args }: ToastOptions) {
    count += 4;
    const toastObj = { ...initialToast, ...args };
    toastObj.id = count;
    toastObj.timer = setTimeout(() => {
      toastCore.removeToast(toastObj.id!);
    }, toastObj.duration);
    toasts = [toastObj, ...toasts];
    notifySubscribers();
    return toastObj;
  },
};

export const toast = {
  toastObj: {} as ToastOptions,
  success: function (message: string, duration: number = 5000) {
    const t = toastCore.addToast({ message, type: "success", duration });
    this.toastObj = t;
  },
  error: function (message: string, duration: number = 5000) {
    const t = toastCore.addToast({ message, type: "error", duration });
    this.toastObj = t;
  },
  info: function (message: string, duration: number = 5000) {
    const t = toastCore.addToast({ message, type: "info", duration });
    this.toastObj = t;
  },
};
