import { createSlice } from "@reduxjs/toolkit";
const chatSlice=createSlice({
    name:"chat",
    initialState:{
        onlineusers:[]
    }
    ,
    reducers:{
        setonlineusers:(state,action)=>{
            state.onlineusers=action.payload;
         
        }
    }
})
export const {setonlineusers} =chatSlice.actions;
export default chatSlice.reducer;