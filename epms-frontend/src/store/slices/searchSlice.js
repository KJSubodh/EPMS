// src/store/slices/searchSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

export const search = createAsyncThunk(
  'search/execute',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await api.post('/search', searchParams);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const getSuggestions = createAsyncThunk(
  'search/suggestions',
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get(`/search/suggestions?query=${query}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get suggestions');
    }
  }
);

const initialState = {
  results: [],
  totalCount: 0,
  totalPages: 0,
  typeCounts: {},
  suggestions: [],
  isLoading: false,
  isOpen: false,
  query: '',
  filters: {
    type: 'all',
    statuses: [],
    priorities: [],
    assignedToId: null,
    projectId: null,
    dueDateFrom: null,
    dueDateTo: null,
    createdAtFrom: null,
    createdAtTo: null,
    sortBy: 'createdAt',
    sortDirection: 'desc'
  },
  pagination: {
    page: 0,
    size: 10
  },
  error: null
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    openSearch: (state) => {
      state.isOpen = true;
    },
    closeSearch: (state) => {
      state.isOpen = false;
      state.query = '';
      state.results = [];
      state.selectedIndex = -1;
    },
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    setFilter: (state, action) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
    },
    setTypeFilter: (state, action) => {
      state.filters.type = action.payload;
    },
    toggleStatusFilter: (state, action) => {
      const status = action.payload;
      const index = state.filters.statuses.indexOf(status);
      if (index > -1) {
        state.filters.statuses.splice(index, 1);
      } else {
        state.filters.statuses.push(status);
      }
    },
    clearFilters: (state) => {
      state.filters = {
        type: 'all',
        statuses: [],
        priorities: [],
        assignedToId: null,
        projectId: null,
        dueDateFrom: null,
        dueDateTo: null,
        createdAtFrom: null,
        createdAtTo: null,
        sortBy: 'createdAt',
        sortDirection: 'desc'
      };
      state.query = '';
      state.results = [];
      state.totalCount = 0;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setSelectedIndex: (state, action) => {
      state.selectedIndex = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(search.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(search.fulfilled, (state, action) => {
        state.isLoading = false;
        state.results = action.payload.results || [];
        state.totalCount = action.payload.totalCount || 0;
        state.totalPages = action.payload.totalPages || 0;
        state.typeCounts = action.payload.typeCounts || {};
        state.suggestions = action.payload.suggestions || [];
        state.selectedIndex = -1;
      })
      .addCase(search.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      .addCase(getSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload || [];
      })
      .addCase(getSuggestions.rejected, (state, action) => {
        console.error('Failed to get suggestions:', action.payload);
      });
  }
});

export const {
  openSearch,
  closeSearch,
  setQuery,
  setFilter,
  setTypeFilter,
  toggleStatusFilter,
  clearFilters,
  setPage,
  clearError,
  setSelectedIndex
} = searchSlice.actions;

export default searchSlice.reducer;