import { useDebugValue } from "react";
import useSyncExternalStoreWithSelector from "../useSyncExternalStoreWithSelector";

type SetStateInternal<T> = {
  _(
    partial: T | Partial<T> | { _(state: T): T | Partial<T> }["_"],
    replace?: boolean | undefined
  ): void;
}["_"];

export interface StoreApi<T> {
  setState: SetStateInternal<T>;
  getState: () => T;
  subscribe: (listener: (state: T, prevState: T) => void) => () => void;
  /**
   * @deprecated Use `unsubscribe` returned by `subscribe`
   */
  destroy: () => void;
}

const createStore = (createState: any) => {
  type TState = ReturnType<typeof createState>;
  type Listener = (state: TState, prevState: TState) => void;
  let state: TState;
  const listeners: Set<Listener> = new Set();

  const setState = (partial: any) => {
    let nextState = typeof partial === "function" ? partial(state) : partial;

    if (!Object.is(nextState, state)) {
      const preState = state;

      state = { ...state, nextState };

      listeners.forEach((listener) => {
        listener(preState, state);
      });
    }
  };

  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const destory = () => {
    listeners.clear();
  };

  const getState = () => state;

  const api = {
    state,
    setState,
    destory,
    subscribe,
    getState,
  };

  state = createState(setState, getState, api);

  return api as any;
};

const useStore = (api: any, selector: any, equalityFn: any) => {
  const value = useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState,
    selector,
    equalityFn
  );

  useDebugValue(value);

  return value;
};

const create = (createState: any) => {
  const api = createStore(createState);

  const useBoundStore: any = (selector?: any, equalityFn?: any) =>
    useStore(api, selector, equalityFn);

  Object.assign(useBoundStore, api);

  return useBoundStore;
};

export default create;
