type Listener = {
  callback: () => void;
  prev: Listener | null;
  next: Listener | null;
};

const createListenerCollection = () => {
  let first: Listener | null = null;
  let last: Listener | null = null;

  return {
    clear() {},

    notify() {},
    get() {},

    subscribe(callback: () => void) {
      last = {
        prev: last,
        next: null,
        callback: callback,
      };

      let listener = last;

      if (listener.prev) {
        listener.prev.next = listener;
      } else {
        first = listener;
      }

      return () => {};
    },
  };
};
