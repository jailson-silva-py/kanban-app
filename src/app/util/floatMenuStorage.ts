//TODO: storage exclusivo do menu float com o padrão subscriber

type FloatMenuStorage = {
  openInBox: boolean
  openBoard: boolean
};

const initialStorage: FloatMenuStorage = { openInBox: true, openBoard: true };
let storage: FloatMenuStorage = { ...initialStorage };

type Subscriber = (objStorage: FloatMenuStorage) => void;
const subscribers = new Set<Subscriber>();
const notifySubscribers = () => {
  subscribers.forEach((fn) => {
    fn({ ...storage });
  })
}
export const floatMenuStorageCore = {
  subscribe (fn: Subscriber)  {
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
    storage = {...storage, openInBox:!storage.openInBox}
    notifySubscribers();
  },
  invertOpenBoard () {
    storage = {...storage, openBoard:!storage.openBoard}
    notifySubscribers();
  }
}
