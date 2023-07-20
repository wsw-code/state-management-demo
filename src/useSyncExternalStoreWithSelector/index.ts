import {
  useSyncExternalStore,
  useDebugValue,
  useMemo,
  useRef,
  useEffect,
} from "react";

type InstProps<T> = {
  hasValue: boolean;
  value: T;
};

/**
 *
 * @param subscribe 订阅函数
 * @param getSnapshot 数据快照
 * @param selector
 * @param isEqual 比较函数
 */

const useSyncExternalStoreWithSelector = <T,S>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => S,
  selector: (val: S) => T,
  isEqual: (a: T, b: T) => boolean
) => {
  let inst: InstProps<T>;
  const instRef = useRef<InstProps<T>>(null as unknown as InstProps<T>);

  const _useMemo = useMemo(() => {
    /**是否第一次执行 */
    let hasMemo = false;
    let memoizedSnapshot: S;
    let memoizedSelection: T;

    if (instRef.current === null) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      inst = {
        hasValue: false,
        value: null as T,
      };
    } else {
      instRef.current = inst;
    }

    const memoizedSelector = (nextSnapshot: ReturnType<typeof getSnapshot>) => {
      if (!hasMemo) {
        hasMemo = true;
        memoizedSnapshot = nextSnapshot;
        memoizedSelection = selector(memoizedSnapshot);

        const  _nextSelection = selector(nextSnapshot);

        memoizedSelection = _nextSelection;

        if (isEqual !== undefined) {
          if (inst.hasValue) {
            if (isEqual(inst.value, _nextSelection)) {
              memoizedSelection = inst.value;
              return _nextSelection;
            }
          }
        }

        return _nextSelection;
      }

      const prevSnapshot = memoizedSnapshot;

      const prevSelection = memoizedSelection;

      if (Object.is(prevSnapshot, nextSnapshot)) {
        return prevSelection;
      }

      const nextSelection = selector(nextSnapshot);

      if (isEqual(prevSelection, nextSelection)) {
        return prevSelection;
      }

      memoizedSnapshot = nextSnapshot;
      memoizedSelection = nextSelection;

      return nextSelection;
    };

    return () => {
      return memoizedSelector(getSnapshot());
    };
  }, [selector, getSnapshot, isEqual]);

  const getSelection = _useMemo;

  const value = useSyncExternalStore(subscribe, getSelection);

  useEffect(() => {
    inst.value = value;
    inst.hasValue = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useDebugValue(value);

  return value 
};

export default useSyncExternalStoreWithSelector;
