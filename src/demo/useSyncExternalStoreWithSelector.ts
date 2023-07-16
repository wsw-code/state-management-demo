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
  const memoizedSelector = useMemo(() => {
    /**是否第一次执行 */
    let hasMemo = false;

    if (instRef.current === null) {
      inst = {
        hasValue: false,
        value: null,
      };
      instRef.current = inst;
    }

    let memoizedSnapshot: any;
    let memoizedSelection: any;

    return (nextSnapshot: ReturnType<typeof getSnapshot>) => {
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
  }, [selector, getSnapshot, isEqual]);

  const getSelection = memoizedSelector(getSnapshot());

  const value = useSyncExternalStore(subscribe, getSelection);

  useEffect(() => {
    inst.value = value;
    inst.hasValue = true;
  }, [value]);

  useDebugValue(value);
};

export default useSyncExternalStoreWithSelector;
