// In socketSlice.js
import { createSlice } from "@reduxjs/toolkit";
const socketSlice = createSlice({
  name: "socket",
  initialState: {
    connected: false, // Store only connected status or other serializable data
    userId: null,
  },
  reducers: {
    setSocket: (state, action) => {
      state.connected = action.payload.connected;
      state.userId = action.payload.userId;
    },
  },
});

export const { setSocket } = socketSlice.actions;
export default socketSlice.reducer;
