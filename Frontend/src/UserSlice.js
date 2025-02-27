import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    userdata: {},
    token: "",
  };

const UserSlice=createSlice({
    name:"user",
    initialState,
    reducers:{
         setuser:(state,action)=>{
            state.userdata=action.payload
            
         },
         settoken:(state,action)=>{
            console.log(state.token);
            state.token=action.payload;
        console.log(state.token);
         }

        
    }
})
export const {setuser,settoken} = UserSlice.actions
export default UserSlice.reducer