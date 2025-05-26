import React from 'react';
import SearchForm from '../common/forms/SearchForm';

const Search = () => {
  return (
    <div className="space-y-6">
      <SearchForm />
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Results</h3>
        <p className="text-gray-600">Search results will appear here...</p>
      </div>
    </div>
  );
};

export default Search; 