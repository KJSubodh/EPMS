// src/store/index.js or store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import adminReducer from './slices/adminSlice';
import projectReducer from './slices/projectSlice';
import taskReducer from './slices/taskSlice';
import notificationReducer from './slices/notificationSlice';
import commentReducer from './slices/commentSlice';
import searchReducer from './slices/searchSlice';
import emailReducer from './slices/emailSlice';  
import analyticsReducer from './slices/analyticsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    admin: adminReducer,
    projects: projectReducer,
    tasks: taskReducer,
    notifications: notificationReducer,
    comments: commentReducer,
    search: searchReducer,
    email: emailReducer,  
    analytics: analyticsReducer,
  },
});