import { createContext, useMemo, useEffect } from "react";
import { createSubscription, Subscription } from './Subscription';
import type { Action, AnyAction, Store } from 'redux';


export interface ReactReduxContextValue<
  SS = any,
  A extends Action = AnyAction
> {
  store: Store<SS, A>
  subscription: Subscription
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
export const Context = createContext<ReactReduxContextValue>(null as any);

type Props<A extends Action = AnyAction, S = unknown> = {
  children: React.ReactNode;
  store: Store<S, A>
};

function Provider<A extends Action = AnyAction, S = unknown>({ children, store }: Props<A, S>) {


  const contextValue = useMemo(() => {
    /**生成订阅者对象  */
    const subscription = createSubscription(store)
    return {
      store,
      subscription
    }
  }, [store]);


  const previousState = useMemo(() => store.getState(), [store])

  useEffect(() => {

    const { subscription } = contextValue;
    subscription.onStateChange = subscription.notifyNestedSubs;
    subscription.trySubscribe();
    if (previousState !== store.getState()) {
      subscription.notifyNestedSubs()
    }

    return () => {
      subscription.tryUnsubscribe();
      subscription.onStateChange = null;
    }

  }, [contextValue, previousState])


  /** 使用 Context.Provider 跨组件传递subscription */
  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}


export default Provider
