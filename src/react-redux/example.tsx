


import { legacy_createStore } from 'redux';
import Provider from './Provider'
import reducer from './reducer'
import { Button } from 'antd'
import useSelector from './useSelector';


const store = legacy_createStore(reducer);



const Child = () => {

  const count = useSelector((state: { count: number, count2: number }) => state.count)
  const dispatch = store.dispatch
  console.log('渲染1')

  return (
    <div>
      <div>
        <Button
          type="primary"
          onClick={() => {
            dispatch({ type: 'incremented' })
          }}
        >新增</Button>
        <Button
          onClick={() => {
            dispatch({ type: 'decremented' })
          }}
        >减少</Button>
      </div>
      <div>
        我是一个页面{count}
      </div>
    </div>
  )
}

const Child2 = () => {

  const count2 = useSelector((state: { count: number, count2: number }) => state.count2)




  return (
    <div>
      <div>
        <Button
          type="primary"
          onClick={() => {
            store.dispatch({ type: 'incremented2' })
          }}
        >新增</Button>
        <Button
          onClick={() => {
            store.dispatch({ type: 'decremented2' })
          }}
        >减少</Button>
      </div>
      <div>
        我是一个页面{count2}
      </div>
    </div>
  )
}



const Index = () => {

  return (
    <Provider store={store}>
      <Child />
      <Child2 />
    </Provider>
  )
}



export default Index;