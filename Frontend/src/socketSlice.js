import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  socketId: null,  // Store only the socket ID instead of the whole socket instance
  connected: false, // Store connection status
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    // Action to set socket metadata
    setsocket: (state, action) => {
      state.socketId = action.payload.socketId || null;
      state.connected = action.payload.connected || false;
    },
    resetSocket: (state) => {
      state.socketId = null;
      state.connected = false;
    },
  },
});

export const { setsocket, resetSocket } = socketSlice.actions;

export default socketSlice.reducer;
