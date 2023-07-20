import useSyncExternalStoreWithSelector from "./index.ts";

/**
 * 外部数据
 */
let data = {
  a: 0,
  b: 0,
  c: 99,
};

const listenList: (() => void)[] = [];

const subscribe = (render: () => void) => {
  listenList.push(render);

  return () => {
    listenList.splice(listenList.indexOf(render));
  };
};

const update = () => {
  console.log(listenList);
  for (let index = 0; index < listenList.length; index++) {
    const fn = listenList[index];

    fn();
  }
};

// const selector = () => {};

const Index = () => {
  const { a, b } = useSyncExternalStoreWithSelector(
    subscribe,
    function () {
      return data;
    },
    (data) => {
      return {
        a: data.a,
        b: data.b,
      };
    },
    (pre, cur) => {
      return pre.a === cur.a && pre.b === cur.b;
    }
  );

  return (
    <div>
      <div>
        <button
          onClick={() => {
            data = {
              ...data,
              a: (data.a += 1),
            };
            update();
          }}
        >
          数据变更
        </button>
        <div>
          {a}-{b}
        </div>
      </div>
    </div>
  );
};

export default Index;
