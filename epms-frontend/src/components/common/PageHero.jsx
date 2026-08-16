// src/components/common/PageHero.jsx
import React from 'react';
import { FaSearch, FaPlus, FaChevronDown } from 'react-icons/fa';

const PageHero = ({
  // Header
  icon: Icon,
  iconColor = '#7C3AED',
  title,
  subtitle,
  
  // Stats
  stats = [],
  
  // Search
  searchValue,
  onSearch,
  searchPlaceholder = 'Search...',
  
  // Filter
  filterOptions,
  filterValue,
  onFilter,
  filterPlaceholder = 'All',
  
  // Create button
  onCreateClick,
  createLabel = 'Create',
  
  // Extra controls
  children
}) => {
  return (
    <div className="relative bg-[#151321] rounded-2xl p-6 md:p-8 mb-6 border border-[#2A2438] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      {/* Subtle inner top highlight - quiet glass edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent rounded-t-2xl"></div>
      
      {/* Icon spotlight - contained, low opacity */}
      {Icon && (
        <div 
          className="absolute top-6 md:top-8 left-6 md:left-8 w-24 h-24 rounded-full blur-3xl -translate-x-4 -translate-y-4"
          style={{ backgroundColor: `${iconColor}12` }}
        ></div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="relative">
                <div 
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-150 border"
                  style={{ 
                    backgroundColor: `${iconColor}15`,
                    borderColor: `${iconColor}25`
                  }}
                >
                  <Icon className="text-lg" style={{ color: iconColor }} />
                </div>
                {/* Quiet glow behind icon */}
                <div 
                  className="absolute inset-0 rounded-xl blur-xl -z-10"
                  style={{ 
                    backgroundColor: `${iconColor}08`,
                    transform: 'scale(1.4)'
                  }}
                ></div>
              </div>
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-white tracking-tight leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-white/40 mt-0.5 font-normal">{subtitle}</p>
              )}
            </div>
          </div>
          
          {/* Stats */}
          {stats.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 bg-white/3 rounded-xl px-4 py-2.5 border border-white/6">
              {stats.map((stat, index) => {
                const color = stat.color ? 
                  (stat.color === 'bg-gray-700' ? '#6B7280' :
                   stat.color === 'bg-green-500' ? '#16A34A' :
                   stat.color === 'bg-red-500' ? '#EF4444' :
                   stat.color === 'bg-violet-500' ? '#7C3AED' :
                   stat.color === 'bg-blue-500' ? '#3B82F6' :
                   stat.color === 'bg-amber-500' ? '#F59E0B' :
                   '#7C3AED') : '#7C3AED';
                
                return (
                  <div key={index} className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors duration-150">
                    <div 
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-150"
                      style={{ backgroundColor: `${color}12` }}
                    >
                      <div 
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: color }}
                      ></div>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white leading-none tabular-nums tracking-tight">
                        {stat.value}
                      </p>
                      <p className="text-[10px] text-white/30 font-medium uppercase tracking-wider">
                        {stat.label}
                      </p>
                    </div>
                    {index < stats.length - 1 && (
                      <div className="w-px h-7 bg-white/6 mx-1"></div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          {(searchValue !== undefined || onSearch) && (
            <div className="flex-1 relative group">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 text-sm transition-colors duration-150 group-focus-within:text-white/40" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue || ''}
                onChange={(e) => onSearch && onSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/3 border border-white/8 rounded-xl text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/6 transition-all duration-150"
              />
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter */}
            {filterOptions && onFilter && (
              <div className="relative group">
                <select
                  value={filterValue || ''}
                  onChange={(e) => onFilter(e.target.value)}
                  className="px-4 py-2.5 pr-8 bg-white/3 border border-white/8 rounded-xl text-sm text-white/90 focus:outline-none focus:border-white/20 focus:bg-white/6 transition-all duration-150 appearance-none cursor-pointer hover:bg-white/6"
                >
                  <option value="" className="bg-[#151321] text-white/90">{filterPlaceholder}</option>
                  {filterOptions.map((opt, idx) => (
                    <option key={idx} value={opt.value} className="bg-[#151321] text-white/90">{opt.label}</option>
                  ))}
                </select>
                <FaChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 text-[10px] pointer-events-none transition-colors duration-150 group-hover:text-white/40" />
              </div>
            )}

            {/* Create Button */}
            {onCreateClick && (
              <button
                onClick={onCreateClick}
                className="group flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 active:scale-[0.98]"
                style={{
                  backgroundColor: iconColor,
                  color: 'white'
                }}
              >
                <FaPlus className="text-sm transition-transform duration-150 group-hover:rotate-90" />
                {createLabel}
              </button>
            )}

            {/* Extra controls */}
            {children && (
              <div className="flex items-center gap-2 pl-2 border-l border-white/6">
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHero;