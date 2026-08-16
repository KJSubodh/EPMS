// src/store/slices/emailSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

export const fetchEmailPreferences = createAsyncThunk(
  'email/fetchPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/email/preferences');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch preferences');
    }
  }
);

export const updateEmailPreferences = createAsyncThunk(
  'email/updatePreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      const response = await api.put('/email/preferences', preferences);
      toast.success('Email preferences updated successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update preferences';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  preferences: {
    taskAssignment: true,
    dueReminders: true,
    taskCompletion: true,
    dailyDigest: false,
    commentNotifications: true,
  },
  isLoading: false,
  error: null,
};

const emailSlice = createSlice({
  name: 'email',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmailPreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmailPreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preferences = action.payload;
      })
      .addCase(fetchEmailPreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateEmailPreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEmailPreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preferences = action.payload;
      })
      .addCase(updateEmailPreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = emailSlice.actions;
export default emailSlice.reducer;