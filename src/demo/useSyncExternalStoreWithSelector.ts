import {
  useSyncExternalStore,
  useDebugValue,
  useMemo,
  useRef,
  useEffect,
} from "react";

type InstProps = {
  hasValue: boolean;
  value: any;
};

/**
 *
 * @param subscribe 订阅函数
 * @param getSnapshot 数据快照
 * @param selector
 * @param isEqual 比较函数
 */

const useSyncExternalStoreWithSelector = (
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => any,
  selector: (val: any) => any,
  isEqual: (a: any, b: any) => boolean
) => {
  let inst: InstProps;
  const instRef = useRef<InstProps>(null as unknown as InstProps);

  const _useMemo = useMemo(() => {
    /**是否第一次执行 */
    let hasMemo = false;
    let memoizedSnapshot: any;
    let memoizedSelection: any;

    if (instRef.current === null) {
      inst = {
        hasValue: false,
        value: null,
      };
    } else {
      instRef.current = inst;
    }

    const memoizedSelector = (nextSnapshot: ReturnType<typeof getSnapshot>) => {
      if (!hasMemo) {
        hasMemo = true;
        memoizedSnapshot = nextSnapshot;
        memoizedSelection = selector(memoizedSnapshot);

        var _nextSelection = selector(nextSnapshot);

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
  }, [value]);

  useDebugValue(value);

  return value;
};

export default useSyncExternalStoreWithSelector;
