import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = '加载中...' }) => {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-lg text-gray-600">{message}</div>
    </div>
  );
};

export default LoadingSpinner;
