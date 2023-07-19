
import { unstable_batchedUpdates } from 'react-dom';
import type {Store} from 'redux';





type VoidFunc = () => void;

type Listener = {
  callback: VoidFunc;
  prev: Listener | null;
  next: Listener | null;
};




type ListenerCollection = ReturnType<typeof createListenerCollection>


const nullListeners = {
  notify(){},
  get: () => [],
} as unknown as ListenerCollection


const createListenerCollection = () => {
  let first: Listener | null = null;
  let last: Listener | null = null;

  return {
    /**清空链表 */
    clear() {
      first = null;
      last = null;
    },
    /**执行所有订阅者callback */
    notify() {
      /**开启批量更新 */
      unstable_batchedUpdates(()=>{
        let listener = first; 
        while(listener) {
          listener.callback()
          listener = listener.next
        }
      })
    },
    /**获取所有订阅者 */
    get() {
      const listeners: Listener[] = [];
      let listener = first;
      while (listener) {
        listeners.push(listener);
        listener = listener.next;
      }
      return listeners;
    },
    /**使用链表数据结构
     * 订阅react更新函数
     * @param callback 
     * @returns 取消订阅函数
     */
    subscribe(callback: () => void) {

      /**使用此变量防止重复调用unsubscribe函数 */
      let isSubscribed = true;
      last = {
        prev: last,
        next: null,
        callback: callback,
      };

      const listener = last;

      if (listener.prev) {
        listener.prev.next = listener;
      } else {
        first = listener;
      }

      return function unsubscribe() {

        if (!isSubscribed || first === null) return;
        isSubscribed = false;

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


export interface Subscription {
  addNestedSub: (listener: VoidFunc) => VoidFunc
  notifyNestedSubs: VoidFunc
  handleChangeWrapper: VoidFunc
  isSubscribed: () => boolean
  onStateChange?: VoidFunc | null
  trySubscribe: VoidFunc
  tryUnsubscribe: VoidFunc
  getListeners: () => ListenerCollection
}



/**
 * 
 * @param store 外部store  redux Store
 * @param parentSub 在hooks中没有使用到
 * @returns 
 */
export function createSubscription(store: Store<any,any>, parentSub?: Subscription) {
  //取消订阅函数
  let unsubscribe: (()=>void) | undefined;

  /**订阅者对象 */
  let listeners: ListenerCollection = {} as unknown as ListenerCollection;

  /**
   * 添加订阅者函数返回取消订阅函数
   * @param listener  
   * @returns 
   */
  function addNestedSub(listener: () => void) {
    trySubscribe()
    return listeners.subscribe(listener)
  }

  function notifyNestedSubs() {
    /**遍历所有订阅函数并执行 */
    listeners.notify()
  }

  function handleChangeWrapper() {
    /**Provider.tsx中
     * subscription.onStateChange = subscription.notifyNestedSubs
     * 所以这里就是执行notifyNestedSubs
     */
    if (subscription.onStateChange) {
      subscription.onStateChange()
    }
  }

  function isSubscribed() {
    return Boolean(unsubscribe)
  }

  /**创建订阅者对象 */
  function trySubscribe() {

    if (!unsubscribe) {
      unsubscribe = parentSub
        ? parentSub.addNestedSub(handleChangeWrapper)
        /**redux store 订阅 */
        : store.subscribe(handleChangeWrapper)

      listeners = createListenerCollection()
    }
  }

  /**取消订阅 */
  function tryUnsubscribe() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = undefined
      listeners.clear()
      listeners = nullListeners
    }
  }

  const subscription: Subscription = {
    addNestedSub,
    notifyNestedSubs,
    handleChangeWrapper,
    isSubscribed,
    trySubscribe,
    tryUnsubscribe,
    getListeners: () => listeners,
  }

  return subscription
}