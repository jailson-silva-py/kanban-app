type FloatMenuStorage = {
  isOpenInBox: boolean
  isOpenBoard: boolean,
  isShow: boolean,
  timer?:ReturnType<typeof setTimeout> | null
};

const initialStorage: FloatMenuStorage = {
  isOpenInBox: true, isOpenBoard: true,
  isShow: false
};
let storage: FloatMenuStorage = { ...initialStorage };

type Subscriber = (objStorage: FloatMenuStorage) => void;
export const subscribers = new Set<Subscriber>();
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

  closeInBox() {

    if (!storage.isOpenBoard && storage.isOpenInBox) {
      return
    }
    storage = { ...storage, isOpenInBox: false }
    notifySubscribers();
  },
  openInBox() {

    storage = { ...storage, isOpenInBox: true }
    notifySubscribers();

  },

  openBoard() {
    storage = {...storage, isOpenBoard:true}
    notifySubscribers();
  },

  closeBoard() {
    if (!storage.isOpenInBox && storage.isOpenBoard) return;
    storage = {...storage, isOpenBoard:false}
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
