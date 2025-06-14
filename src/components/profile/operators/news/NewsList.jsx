import React from 'react';
import NewsCard from './NewsCard';

const NewsList = ({ articles }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6">News</h2>
      
      <div className="border-t border-gray-200 pt-6">
        {articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <NewsCard key={article.id || index} article={article} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-500">No news articles available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsList; 