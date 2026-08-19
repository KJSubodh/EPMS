import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Fetch dashboard summary
export const fetchDashboardSummary = createAsyncThunk(
    'analytics/fetchDashboardSummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/analytics/dashboard-summary');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard summary');
        }
    }
);

// Fetch project status
export const fetchProjectStatus = createAsyncThunk(
    'analytics/fetchProjectStatus',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/analytics/project-status');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch project status');
        }
    }
);

// Fetch task trend
export const fetchTaskTrend = createAsyncThunk(
    'analytics/fetchTaskTrend',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/analytics/task-trend');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch task trend');
        }
    }
);

// Fetch team performance
export const fetchTeamPerformance = createAsyncThunk(
    'analytics/fetchTeamPerformance',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/analytics/team-performance');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch team performance');
        }
    }
);

// Fetch priority distribution
export const fetchPriorityDistribution = createAsyncThunk(
    'analytics/fetchPriorityDistribution',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/analytics/priority-distribution');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch priority distribution');
        }
    }
);

// Fetch user activity
export const fetchUserActivity = createAsyncThunk(
    'analytics/fetchUserActivity',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/analytics/user-activity');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user activity');
        }
    }
);

const initialState = {
    dashboardSummary: null,
    projectStatus: [],
    taskTrend: [],
    teamPerformance: [],
    priorityDistribution: [],
    userActivity: {},
    isLoading: false,
    error: null
};

const analyticsSlice = createSlice({
    name: 'analytics',
    initialState,
    reducers: {
        clearAnalytics: (state) => {
            state.dashboardSummary = null;
            state.projectStatus = [];
            state.taskTrend = [];
            state.teamPerformance = [];
            state.priorityDistribution = [];
            state.userActivity = {};
        }
    },
    extraReducers: (builder) => {
        builder
            // Dashboard Summary
            .addCase(fetchDashboardSummary.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
                state.isLoading = false;
                state.dashboardSummary = action.payload;
            })
            .addCase(fetchDashboardSummary.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Project Status
            .addCase(fetchProjectStatus.fulfilled, (state, action) => {
                state.projectStatus = action.payload;
            })
            // Task Trend
            .addCase(fetchTaskTrend.fulfilled, (state, action) => {
                state.taskTrend = action.payload;
            })
            // Team Performance
            .addCase(fetchTeamPerformance.fulfilled, (state, action) => {
                state.teamPerformance = action.payload;
            })
            // Priority Distribution
            .addCase(fetchPriorityDistribution.fulfilled, (state, action) => {
                state.priorityDistribution = action.payload;
            })
            // User Activity
            .addCase(fetchUserActivity.fulfilled, (state, action) => {
                state.userActivity = action.payload;
            });
    }
});

export const { clearAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;