import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authReducer';
import quizReducer from './slices/quizSlice';
import appReducer from './reducers/appReducer';
import adminCacheReducer from './slices/adminCacheSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    quiz: quizReducer,
    app: appReducer,
    adminCache: adminCacheReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: {
        warnAfter: 128, // Increase warning threshold from 32ms to 128ms
      },
      serializableCheck: {
        warnAfter: 128, // Increase warning threshold from 32ms to 128ms
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
