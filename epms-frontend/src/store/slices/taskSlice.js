// src/store/slices/taskSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

// ==================== TASK CRUD ====================

export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/tasks');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch task');
    }
  }
);

export const fetchTasksByProject = createAsyncThunk(
  'tasks/fetchByProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tasks/project/${projectId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project tasks');
    }
  }
);

export const fetchMyTasks = createAsyncThunk(
  'tasks/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/tasks/my-tasks');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch my tasks');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async ({ projectId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/tasks/project/${projectId}`, data);
      toast.success('Task created successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create task';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tasks/${id}`, data);
      toast.success('Task updated successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update task';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  'tasks/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/tasks/${id}/status?status=${status}`);
      toast.success('Task status updated!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update status';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted successfully!');
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete task';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ==================== DOCUMENT MANAGEMENT ====================

// ✅ Upload document with progress tracking
export const uploadTaskDocument = createAsyncThunk(
  'tasks/uploadDocument',
  async ({ taskId, file, onProgress }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(`/tasks/${taskId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        }
      });
      
      toast.success('File uploaded successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload file';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteTaskDocument = createAsyncThunk(
  'tasks/deleteDocument',
  async (documentId, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/documents/${documentId}`);
      toast.success('File deleted successfully!');
      return documentId;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete file';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchTaskDocuments = createAsyncThunk(
  'tasks/fetchDocuments',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tasks/${taskId}/documents`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch documents');
    }
  }
);

export const downloadDocument = createAsyncThunk(
  'tasks/downloadDocument',
  async (documentId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tasks/documents/${documentId}/download`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'download';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('File downloaded!');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to download file';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ==================== KANBAN BOARD ====================

export const fetchBoardData = createAsyncThunk(
  'tasks/fetchBoard',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tasks/project/${projectId}/board`);
      return { projectId, columns: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch board');
    }
  }
);

export const fetchMyBoard = createAsyncThunk(
  'tasks/fetchMyBoard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/tasks/my-board');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch board');
    }
  }
);

export const updateBoard = createAsyncThunk(
  'tasks/updateBoard',
  async (boardData, { rejectWithValue }) => {
    try {
      await api.put('/tasks/board', boardData);
      return boardData;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update board';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ==================== SLICE ====================

const initialState = {
  tasks: [],
  currentTask: null,
  documents: [],
  board: null,
  myBoard: null,
  isLoading: false,
  isLoadingDocuments: false,
  isLoadingBoard: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,
  total: 0
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearDocuments: (state) => {
      state.documents = [];
    },
    clearBoard: (state) => {
      state.board = null;
    },
    clearMyBoard: (state) => {
      state.myBoard = null;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    resetUploadProgress: (state) => {
      state.uploadProgress = 0;
      state.isUploading = false;
    },
    updateBoardColumns: (state, action) => {
      const { columns } = action.payload;
      if (state.board) {
        state.board.columns = columns;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // ==================== FETCH TASKS ====================
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload;
        state.total = action.payload.length;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // ==================== FETCH TASK BY ID ====================
      .addCase(fetchTaskById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // ==================== FETCH TASKS BY PROJECT ====================
      .addCase(fetchTasksByProject.fulfilled, (state, action) => {
        state.tasks = action.payload;
        state.total = action.payload.length;
      })
      
      // ==================== FETCH MY TASKS ====================
      .addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.tasks = action.payload;
        state.total = action.payload.length;
      })
      
      // ==================== CREATE TASK ====================
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
        state.total += 1;
      })
      
      // ==================== UPDATE TASK ====================
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      
      // ==================== UPDATE TASK STATUS ====================
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      
      // ==================== DELETE TASK ====================
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
        state.total -= 1;
        if (state.currentTask?.id === action.payload) {
          state.currentTask = null;
        }
      })
      
      // ==================== DOCUMENT UPLOAD ====================
      .addCase(uploadTaskDocument.pending, (state) => {
        state.isUploading = true;
        state.uploadProgress = 0;
        state.error = null;
      })
      .addCase(uploadTaskDocument.fulfilled, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 100;
        state.documents.unshift(action.payload);
      })
      .addCase(uploadTaskDocument.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadProgress = 0;
        state.error = action.payload;
      })
      
      // ==================== DOCUMENT DELETE ====================
      .addCase(deleteTaskDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter(doc => doc.id !== action.payload);
      })
      
      // ==================== FETCH DOCUMENTS ====================
      .addCase(fetchTaskDocuments.pending, (state) => {
        state.isLoadingDocuments = true;
        state.error = null;
      })
      .addCase(fetchTaskDocuments.fulfilled, (state, action) => {
        state.isLoadingDocuments = false;
        state.documents = action.payload;
      })
      .addCase(fetchTaskDocuments.rejected, (state, action) => {
        state.isLoadingDocuments = false;
        state.error = action.payload;
      })
      
      // ==================== FETCH BOARD DATA ====================
      .addCase(fetchBoardData.pending, (state) => {
        state.isLoadingBoard = true;
        state.error = null;
      })
      .addCase(fetchBoardData.fulfilled, (state, action) => {
        state.isLoadingBoard = false;
        state.board = action.payload;
      })
      .addCase(fetchBoardData.rejected, (state, action) => {
        state.isLoadingBoard = false;
        state.error = action.payload;
      })
      
      // ==================== FETCH MY BOARD ====================
      .addCase(fetchMyBoard.pending, (state) => {
        state.isLoadingBoard = true;
        state.error = null;
      })
      .addCase(fetchMyBoard.fulfilled, (state, action) => {
        state.isLoadingBoard = false;
        state.myBoard = action.payload;
      })
      .addCase(fetchMyBoard.rejected, (state, action) => {
        state.isLoadingBoard = false;
        state.error = action.payload;
      })
      
      // ==================== UPDATE BOARD ====================
      .addCase(updateBoard.fulfilled, (state, action) => {
        if (state.board) {
          const updatedColumns = state.board.columns.map(col => {
            const updatedCol = action.payload.columns.find(c => c.status === col.status);
            return updatedCol || col;
          });
          state.board.columns = updatedColumns;
        }
        if (state.myBoard) {
          const updatedColumns = state.myBoard.map(col => {
            const updatedCol = action.payload.columns.find(c => c.status === col.status);
            return updatedCol || col;
          });
          state.myBoard = updatedColumns;
        }
      });
  }
});

export const { 
  clearCurrentTask, 
  clearError, 
  clearDocuments,
  clearBoard,
  clearMyBoard,
  setUploadProgress,
  resetUploadProgress,
  updateBoardColumns
} = taskSlice.actions;

export default taskSlice.reducer;