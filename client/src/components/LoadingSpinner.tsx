import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = '加载中...' }) => {
  return (
    <div className="loading-wrap" role="status" aria-live="polite">
      <div className="loading-ring" />
      <div className="loading-message">{message}</div>
    </div>
  );
};

export default LoadingSpinner;
