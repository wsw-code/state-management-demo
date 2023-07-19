
const initState = {
  count:0,
  count2:999
}


export default (state=initState, action:{type:string})=> {
  switch (action.type) {
    case "incremented":
      return { ...state,count:state.count + 1 };
    case "decremented":
      return { ...state,count:state.count - 1 };
      case "incremented2":
        return { ...state,count2:state.count2 + 1 };
      case "decremented2":
        return { ...state,count2:state.count2 - 1 };
    default:
      return state;
  }
}