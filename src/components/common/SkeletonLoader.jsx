import React from 'react';

const SkeletonLoader = ({ variant = 'line', width, height, className = '', count = 1 }) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  const getSkeletonClasses = () => {
    switch (variant) {
      case 'circle':
        return `${baseClasses} rounded-full`;
      case 'rectangle':
        return `${baseClasses} rounded-md`;
      case 'line':
      default:
        return `${baseClasses} h-4 rounded-md`;
    }
  };

  const skeletonStyle = {
    width: width || '100%',
    height: height || undefined,
  };

  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className={`${getSkeletonClasses()} ${className}`}
          style={skeletonStyle}
        />
      ))}
    </>
  );
};

export default SkeletonLoader; 