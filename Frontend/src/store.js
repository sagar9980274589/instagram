
// import { configureStore } from '@reduxjs/toolkit';
// import UserSlice from './UserSlice.js';
// import PostSlice from './PostSlice.js'
// import storage from 'redux-persist/lib/storage'; // defaults to localStorage
// import { persistReducer, persistStore } from 'redux-persist';

// const persistConfig = {
//     key: 'root',
//     storage,
// };

// const persistedReducer = persistReducer(persistConfig, UserSlice);

// export const store = configureStore({
//     reducer: {
//         data: persistedReducer
//     },
//     middleware: (getDefaultMiddleware) => 
//         getDefaultMiddleware({
//             serializableCheck: {
//                 ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
//             },
//         }),
// });

// export const persistor = persistStore(store);



////



import { configureStore, combineReducers } from "@reduxjs/toolkit";
import UserSlice from "./UserSlice.js";
import PostSlice from "./PostSlice.js";
import storage from "redux-persist/lib/storage"; // defaults to localStorage
import { persistReducer, persistStore } from "redux-persist";

// Persist config
const persistConfig = {
  key: "root",
  storage,
};

// Combine reducers
const rootReducer = combineReducers({
  data: UserSlice,
  posts: PostSlice,
});

// Apply persistReducer to the root reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);
