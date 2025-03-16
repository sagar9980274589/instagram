import { configureStore, combineReducers } from "@reduxjs/toolkit";
import UserSlice from "./UserSlice.js";
import PostSlice from "./PostSlice.js";
import socketSlice from "./socketSlice.js";
import chatSlice from "./chatSlice.js";
import storage from "redux-persist/lib/storage"; // defaults to localStorage
import { persistReducer, persistStore } from "redux-persist";

// Persist config
const persistConfig = {
  key: "root",
  storage,
};

// Combine reducers
const rootReducer = combineReducers({
  chat: chatSlice,
  data: UserSlice,
  posts: PostSlice,
  socket: socketSlice,
});

// Apply persistReducer to the root reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "socketio/setsocket", // Ignore socket-related actions
        ],
        ignoredPaths: ["socket.socketId", "socket.connected"], // Ignore socket fields in state
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);
