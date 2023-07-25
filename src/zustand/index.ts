import { useDebugValue } from "react";
import useSyncExternalStoreWithSelector from "../useSyncExternalStoreWithSelector";

type SetStateInternal<T> = {
  _(
    partial: T | Partial<T> | { _(state: T): T | Partial<T> }['_'],
    replace?: boolean | undefined
  ): void
}['_']



export interface StoreApi<T> {
  setState: SetStateInternal<T>;
  getState: () => T;
  subscribe: (listener: (state: T, prevState: T) => void) => () => void;
  /**
   * @deprecated Use `unsubscribe` returned by `subscribe`
   */
  destory: () => void;
}



export type StateCreator<
  T,
  U = T
> = ((
  setState: StoreApi<T>['setState'],
  getState: StoreApi<T>['getState'],
  store: StoreApi<T>
) => U)

const createStore = <T>(createState:StateCreator<T>) => {
  type TState = ReturnType<typeof createState>;
  type Listener = (state: TState, prevState: TState) => void;
  let state: TState;
  const listeners: Set<Listener> = new Set();

  const setState:StoreApi<TState>['setState'] = (partial,replace) => {
    const nextState = typeof partial === "function" ? (partial as (val:TState)=>TState)(state) : partial;

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
    setState,
    destory,
    subscribe,
    getState,
  }

  state = createState(setState, getState, api);

  return api;
}

type CreateStore = <T>(initializer: StateCreator<T>)=>StoreApi<T>;

type ExtractState<S> = S extends { getState: () => infer T } ? T : never

const defaultEqualityFn = (a:any,b:any) => a === b 


export function useStore<S>(
  api: S
): ExtractState<S>

export function useStore<S extends StoreApi<unknown>, U>(
  api: S,
  selector: (state: ExtractState<S>) => U,
  equalityFn?: (a: U, b: U) => boolean
): U

export function useStore<TState,StateSlice>(
  api: StoreApi<TState>,
  // selector:(state:TState)=>StateSlice=(api.getState as any),
  selector: (state: TState) => StateSlice = api.getState as any,
  equalityFn?:(a: StateSlice, b: StateSlice) => boolean
  ) {
  const value = useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState,
    selector,
    equalityFn=defaultEqualityFn
  );

  useDebugValue(value);

  return value;
} 

const create = <T>(createState:StateCreator<T>) => {
  const api = createStore(createState)

  const useBoundStore:any = (selector?: any, equalityFn?: any) => useStore(api, selector, equalityFn);

  Object.assign(useBoundStore, api);

  return useBoundStore;
};

export default create;
