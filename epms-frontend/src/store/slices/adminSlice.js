import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

// Fetch all users (Admin only)
export const fetchUsers = createAsyncThunk(
    'admin/fetchUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/users');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
        }
    }
);

// Update user details (Admin only) - fullName, email, department, designation, profileImage
export const updateUser = createAsyncThunk(
    'admin/updateUser',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/admin/users/${id}`, data);
            toast.success('User updated successfully!');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update user';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// Change user role (Admin only)
export const changeUserRole = createAsyncThunk(
    'admin/changeUserRole',
    async ({ id, role }, { rejectWithValue }) => {
        try {
            // CHANGE THIS LINE - use query parameter instead of body
            const response = await api.patch(`/admin/users/${id}/role?role=${role}`);
            toast.success('User role updated successfully!');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update role';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// Activate user (Admin only)
export const activateUser = createAsyncThunk(
    'admin/activateUser',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/admin/users/${id}/activate`);
            toast.success('User activated successfully!');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to activate user';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// Deactivate user (Admin only)
export const deactivateUser = createAsyncThunk(
    'admin/deactivateUser',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/admin/users/${id}/deactivate`);
            toast.success('User deactivated successfully!');
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to deactivate user';
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// Fetch single user for admin
export const fetchUserById = createAsyncThunk(
    'admin/fetchUserById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/admin/users/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
        }
    }
);

const initialState = {
    users: [],
    selectedUser: null,
    isLoading: false,
    error: null
};

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSelectedUser: (state) => {
            state.selectedUser = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Users
            .addCase(fetchUsers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            
            // Fetch single user
            .addCase(fetchUserById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedUser = action.payload;
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            
            // Update User
            .addCase(updateUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.users.findIndex(u => u.id === action.payload.id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
                if (state.selectedUser?.id === action.payload.id) {
                    state.selectedUser = action.payload;
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            
            // Change Role
            .addCase(changeUserRole.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(changeUserRole.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.users.findIndex(u => u.id === action.payload.id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
                if (state.selectedUser?.id === action.payload.id) {
                    state.selectedUser = action.payload;
                }
            })
            .addCase(changeUserRole.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            
            // Activate User
            .addCase(activateUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(activateUser.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.users.findIndex(u => u.id === action.payload.id);
                if (index !== -1) {
                    state.users[index].isActive = true;
                }
                if (state.selectedUser?.id === action.payload.id) {
                    state.selectedUser.isActive = true;
                }
            })
            .addCase(activateUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            
            // Deactivate User
            .addCase(deactivateUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deactivateUser.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.users.findIndex(u => u.id === action.payload.id);
                if (index !== -1) {
                    state.users[index].isActive = false;
                }
                if (state.selectedUser?.id === action.payload.id) {
                    state.selectedUser.isActive = false;
                }
            })
            .addCase(deactivateUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, clearSelectedUser } = adminSlice.actions;
export default adminSlice.reducer;