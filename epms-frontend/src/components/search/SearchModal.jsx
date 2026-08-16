// src/components/search/SearchModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch, 
  FaTimes, 
  FaFilter, 
  FaArrowRight,
  FaTasks,
  FaProjectDiagram,
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaFlag,
  FaUser,
  FaCalendarAlt,
  FaTag
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { search, closeSearch, setQuery, setFilter, setTypeFilter, clearFilters } from '../../store/slices/searchSlice';

const SearchModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const modalRef = useRef(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const { 
    isOpen, 
    query, 
    results, 
    isLoading, 
    totalCount,
    typeCounts,
    filters,
    suggestions
  } = useSelector((state) => state.search);
  const { user } = useSelector((state) => state.auth);
  const { projects } = useSelector((state) => state.projects);
  const { users } = useSelector((state) => state.users);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        dispatch(closeSearch());
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
      }
      if (e.key === 'Enter' && selectedIndex >= 0) {
        const result = results[selectedIndex];
        if (result) {
          navigate(result.url);
          dispatch(closeSearch());
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, navigate, results, selectedIndex]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        dispatch(closeSearch());
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, dispatch]);

  const handleSearch = () => {
    if (query.trim().length > 0) {
      dispatch(search({ ...filters, query: query.trim() }));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleTypeClick = (type) => {
    dispatch(setTypeFilter(type));
    handleSearch();
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'TASK': return <FaTasks className="text-blue-500" />;
      case 'PROJECT': return <FaProjectDiagram className="text-purple-500" />;
      case 'USER': return <FaUsers className="text-green-500" />;
      default: return null;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'TASK': return 'bg-blue-500';
      case 'PROJECT': return 'bg-purple-500';
      case 'USER': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <FaSearch className={`text-gray-400 ${isLoading ? 'animate-pulse' : ''}`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              dispatch(setQuery(e.target.value));
              if (e.target.value.length > 1) {
                handleSearch();
              }
            }}
            onKeyDown={handleKeyPress}
            placeholder="Search tasks, projects, users..."
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                showFilters ? 'text-[#7C3AED]' : 'text-gray-400'
              }`}
            >
              <FaFilter className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-400 font-mono hidden sm:block">
              ⌘K
            </span>
            <button
              onClick={() => dispatch(closeSearch())}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex flex-wrap gap-4">
              {/* Type filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">Type:</span>
                <div className="flex gap-1">
                  {['all', 'tasks', 'projects', 'users'].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTypeClick(type)}
                      className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                        filters.type === type
                          ? 'bg-[#7C3AED] text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear filters */}
              <button
                onClick={() => {
                  dispatch(clearFilters());
                  handleSearch();
                }}
                className="text-xs text-[#7C3AED] hover:text-[#6D28D9] font-medium"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="overflow-y-auto max-h-[50vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-[#7C3AED] rounded-full animate-spin"></div>
            </div>
          ) : results.length > 0 ? (
            <>
              {/* Type counts */}
              {Object.keys(typeCounts).length > 0 && (
                <div className="flex items-center gap-4 px-4 py-2 bg-gray-50/50 border-b border-gray-100">
                  {Object.entries(typeCounts).map(([type, count]) => (
                    <div key={type} className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${getTypeColor(type.slice(0, -1))}`}></span>
                      <span className="text-xs text-gray-500">
                        {type}: <span className="font-medium text-gray-700">{count}</span>
                      </span>
                    </div>
                  ))}
                  <span className="text-xs text-gray-400 ml-auto">
                    {totalCount} results
                  </span>
                </div>
              )}

              {/* Results list */}
              <div className="divide-y divide-gray-100">
                {results.map((result, index) => (
                  <div
                    key={`${result.id}-${index}`}
                    onClick={() => {
                      navigate(result.url);
                      dispatch(closeSearch());
                    }}
                    className={`group flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedIndex === index ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(result.type)}/10`}>
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </p>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getTypeColor(result.type)} text-white`}>
                          {result.type}
                        </span>
                      </div>
                      {result.description && (
                        <p className="text-xs text-gray-500 truncate">{result.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-0.5 text-[10px] text-gray-400">
                        {result.status && (
                          <span className="flex items-center gap-1">
                            <FaTag className="w-2.5 h-2.5" />
                            {result.status}
                          </span>
                        )}
                        {result.priority && (
                          <span className="flex items-center gap-1">
                            <FaFlag className="w-2.5 h-2.5" />
                            {result.priority}
                          </span>
                        )}
                        {result.assignedTo && (
                          <span className="flex items-center gap-1">
                            <FaUser className="w-2.5 h-2.5" />
                            {result.assignedTo}
                          </span>
                        )}
                        {result.projectName && (
                          <span className="flex items-center gap-1">
                            <FaProjectDiagram className="w-2.5 h-2.5" />
                            {result.projectName}
                          </span>
                        )}
                        {result.createdAt && (
                          <span className="flex items-center gap-1">
                            <FaCalendarAlt className="w-2.5 h-2.5" />
                            {formatDistanceToNow(new Date(result.createdAt), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>
                    <FaArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#7C3AED] transition-colors" />
                  </div>
                ))}
              </div>
            </>
          ) : query.length > 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <FaSearch className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm font-medium text-gray-500">No results found</p>
              <p className="text-xs mt-1">Try adjusting your search or filters</p>
              {suggestions.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        dispatch(setQuery(suggestion));
                        handleSearch();
                      }}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-600 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <FaSearch className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm font-medium text-gray-500">Search for anything</p>
              <p className="text-xs mt-1">Try searching for tasks, projects, or users</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-300">
                <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-200">⌘K</kbd>
                <span>to open search</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 text-[10px] text-gray-400">
            <span>⌘K to close</span>
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          {results.length > 0 && (
            <span className="text-[10px] text-gray-400">
              {results.length} of {totalCount} results
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;