//TODO: storage exclusivo do menu float com o padrão subscriber

type FloatMenuStorage = {
  openInBox: boolean
  openBoard: boolean,
  isShow: boolean,
  timer?:ReturnType<typeof setTimeout> | null
};

const initialStorage: FloatMenuStorage = {
  openInBox: true, openBoard: true,
  isShow: false
};
let storage: FloatMenuStorage = { ...initialStorage };

type Subscriber = (objStorage: FloatMenuStorage) => void;
const subscribers = new Set<Subscriber>();
const notifySubscribers = () => {
  subscribers.forEach((fn) => {
    fn({ ...storage });
  })
}
export const floatMenuStorageCore = {
  subscribe(fn: Subscriber) {
    subscribers.add(fn);
    return () => {
      subscribers.delete(fn);
    }
  },
  getStorage() {
    return storage;
  }
}

export const floatMenuStorage = {

  reset() {
    storage = { ...initialStorage }
    notifySubscribers();
  },
  invertOpenInbox() {
    if (!storage.openBoard && storage.openInBox) {
      return
    }
    storage = { ...storage, openInBox: !storage.openInBox }
    notifySubscribers();
  },
  invertOpenBoard() {
    if (!storage.openInBox && storage.openBoard) {
      return
    }
    storage = {...storage, openBoard:!storage.openBoard}
    notifySubscribers();
  },
  showMenu() {
    storage = { ...storage, isShow: true }
    notifySubscribers();
  },
  closeMenu() {
    storage = { ...storage, isShow: false}
    notifySubscribers();

  }
}
