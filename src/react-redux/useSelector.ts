
import {useContext} from 'react'
import {Context} from './Provider'
import useSyncExternalStoreWithSelector from '../demo/useSyncExternalStoreWithSelector'




function createSelectorHook() {

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const useReduxContext = ()=>{
    return useContext(Context)
  } 


  return function<TState,Selected>(selector: (state: TState) => Selected,isEqual?:(pre:Selected,cur:Selected)=>boolean) {

    const {store,subscription} = useReduxContext();



    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const value = useSyncExternalStoreWithSelector(subscription.addNestedSub,store.getState.bind(store),selector,isEqual || ((cur,pre)=>cur === pre))

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return
    return value
  }
}





 const useSelector = createSelectorHook()

 export default useSelector