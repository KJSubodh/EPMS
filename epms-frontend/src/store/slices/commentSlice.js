// src/store/slices/commentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

export const fetchComments = createAsyncThunk(
  'comments/fetchAll',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tasks/${taskId}/comments`);
      return { taskId, comments: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments');
    }
  }
);

export const createComment = createAsyncThunk(
  'comments/create',
  async ({ taskId, content, parentId }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/tasks/${taskId}/comments`, { content, parentId });
      toast.success('Comment added!');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

export const updateComment = createAsyncThunk(
  'comments/update',
  async ({ taskId, commentId, content }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tasks/${taskId}/comments/${commentId}`, { content });
      toast.success('Comment updated!');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update comment');
    }
  }
);

export const deleteComment = createAsyncThunk(
  'comments/delete',
  async ({ taskId, commentId }, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${taskId}/comments/${commentId}`);
      toast.success('Comment deleted!');
      return commentId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete comment');
    }
  }
);

const initialState = {
  comments: {},
  isLoading: false,
  error: null
};

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comments[action.payload.taskId] = action.payload.comments;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        const comment = action.payload;
        const taskId = comment.taskId;
        if (state.comments[taskId]) {
          state.comments[taskId] = [comment, ...state.comments[taskId]];
        } else {
          state.comments[taskId] = [comment];
        }
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        const updated = action.payload;
        const taskId = updated.taskId;
        if (state.comments[taskId]) {
          const index = state.comments[taskId].findIndex(c => c.id === updated.id);
          if (index !== -1) {
            state.comments[taskId][index] = updated;
          }
        }
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const commentId = action.payload;
        for (const taskId in state.comments) {
          state.comments[taskId] = state.comments[taskId].filter(c => c.id !== commentId);
        }
      });
  }
});

export const { clearError } = commentSlice.actions;
export default commentSlice.reducer;