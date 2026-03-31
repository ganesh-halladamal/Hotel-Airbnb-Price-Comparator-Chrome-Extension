import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
