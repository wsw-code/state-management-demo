
import {useContext} from 'react'
import {Context} from './Provider'
import useSyncExternalStoreWithSelector from '../useSyncExternalStoreWithSelector'




function createSelectorHook() {

  const useReduxContext = ()=>{
    return useContext(Context)
  } 


  return function<TState,Selected>(selector: (state: TState) => Selected,isEqual?:(pre:Selected,cur:Selected)=>boolean) {

    const {store,subscription} = useReduxContext();
    const value = useSyncExternalStoreWithSelector(subscription.addNestedSub,store.getState.bind(store),selector,isEqual || ((cur,pre)=>cur === pre))
    return value
  }
}



 const useSelector = createSelectorHook()

 export default useSelector