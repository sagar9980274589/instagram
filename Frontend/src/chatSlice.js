import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    onlineusers: [], // Online users list
    messages: [],    // Messages array
  },
  reducers: {
    setOnlineUsers: (state, action) => {
      state.onlineusers = action.payload;
    },
    setMessages: (state, action) => {
      // Directly set messages if the payload is an array
      state.messages.push(action.payload);
    }
   
  },
});

export const { setOnlineUsers, setMessages } = chatSlice.actions;

export default chatSlice.reducer;
