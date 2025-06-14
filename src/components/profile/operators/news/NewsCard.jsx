import React from 'react';
import { Button } from 'primereact/button';

const NewsCard = ({ article }) => {
  const { title, subtitle, content, image, url } = article;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      {/* Image */}
      <div className="h-48 bg-gray-100">
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <i className="pi pi-image text-gray-300 text-5xl"></i>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-medium text-gray-800 mb-1">{title || 'Card Title'}</h3>
        <p className="text-sm text-gray-500 mb-4">{subtitle || 'Card Subtitle'}</p>
        
        <p className="text-gray-600 line-clamp-4 mb-4">
          {content || 'Molevtie tellus sit venenatis morbi eget aenean massa diam lorem. Id sit aliquam lacus mauris sed a sit enim in. Lacus egestas nulla est facilisi quam etiam id.'}
        </p>
        
        <Button 
          label="Read More" 
          icon="pi pi-plus" 
          className="p-button-sm bg-indigo-700 hover:bg-indigo-800 border-none"
          onClick={() => window.open(url, '_blank')}
        />
      </div>
    </div>
  );
};

export default NewsCard; 