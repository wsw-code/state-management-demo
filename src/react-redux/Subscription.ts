type Listener = {
  callback: () => void;
  prev: Listener | null;
  next: Listener | null;
};

const createListenerCollection = () => {
  let first: Listener | null = null;
  let last: Listener | null = null;

  return {
    clear() {
      first = null;
      last = null;
    },

    notify() {},
    get() {
      let listeners: Listener[] = [];
      let listener = first;
      while (listener) {
        listeners.push(listener);
        listener = listener.next;
      }
      return listeners;
    },

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

      return function unsubscribe() {
        if (first === null) return;

        if (listener.next) {
          listener.next.prev = listener.prev;
        } else {
          last = listener.prev;
        }

        if (listener.prev) {
          listener.prev.next = listener.next;
        } else {
          first = listener.next;
        }
      };
    },
  };
};
