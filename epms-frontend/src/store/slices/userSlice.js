import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'users/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      console.log('🔍 Fetching user with ID:', id);
      const response = await api.get(`/users/${id}`);
      console.log('✅ User data received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const fetchEmployees = createAsyncThunk(
  'users/fetchEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/employees');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employees');
    }
  }
);

export const fetchEmployeeById = fetchUserById;

export const updateEmployee = createAsyncThunk(
  'users/updateEmployee',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/users/${id}`, data);
      toast.success('Profile updated successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/users/${id}`, data);
      toast.success('User updated successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update user';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const activateUser = createAsyncThunk(
  'users/activate',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/users/${id}/activate`);
      toast.success('User activated!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to activate user';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deactivateUser = createAsyncThunk(
  'users/deactivate',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/users/${id}/deactivate`);
      toast.success('User deactivated!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to deactivate user';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted successfully!');
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete user';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  users: [],
  currentUser: null,
  selectedUser: null,
  isLoading: false,
  error: null,
  total: 0
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
        state.total = action.payload.length;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.selectedUser = null; // Reset selected user while loading
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedUser = action.payload;
        console.log('✅ selectedUser set in Redux:', state.selectedUser);
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.selectedUser = null;
        state.error = action.payload;
        console.error('❌ fetchUserById rejected:', action.payload);
      })
      
      .addCase(fetchEmployees.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
        state.total = action.payload.length;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(updateEmployee.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
        if (state.currentUser?.id === action.payload.id) {
          state.currentUser = action.payload;
        }
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
        if (state.currentUser?.id === action.payload.id) {
          state.currentUser = action.payload;
        }
      })
      
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u.id !== action.payload);
        state.total -= 1;
        if (state.selectedUser?.id === action.payload) {
          state.selectedUser = null;
        }
      });
  }
});

export const { clearCurrentUser, clearSelectedUser, clearError } = userSlice.actions;
export default userSlice.reducer;