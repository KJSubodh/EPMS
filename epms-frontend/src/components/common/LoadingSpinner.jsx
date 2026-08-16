import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'blue' }) => {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4'
  };

  const colors = {
    blue: 'border-blue-500 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-500 border-t-transparent'
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizes[size] || sizes.md} ${colors[color] || colors.blue} rounded-full animate-spin`}
      />
    </div>
  );
};

export default LoadingSpinner;