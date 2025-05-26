import React from 'react';
import { Plane } from 'lucide-react';

const RecentSearch = () => {
  const recentSearches = [
    { text: "DK Chicago to Geneva on 28th of May 4 People", options: "Full More Options" },
    { text: "Newburgh to Miami 25 May 5 pax", options: "Full More Options" },
    { text: "Hawthorne to Euroairport Basel-Mulhouse-Freiburg on 23 May 2025", options: "Full More Options" },
    { text: "Hawthorne to Euroairport Basel-Mulhouse-Freiburg on 23 May 2025", options: "Full More Options" },
    { text: "Newburgh Field to Miami Intl (MIA) on 25 May 2025", options: "Full More Options" }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex justify-between items-center p-3 border-b border-gray-100">
        <h3 className="font-medium text-gray-900 text-sm">Recent Search</h3>
        <button className="text-gray-400 hover:text-gray-600 text-lg">×</button>
      </div>
      <div className="p-3 space-y-3 max-h-80 overflow-y-auto">
        {recentSearches.map((search, index) => (
          <div key={index} className="flex items-start justify-between py-2 border-b border-gray-50 last:border-b-0">
            <div className="flex-1 pr-2">
              <p className="text-xs text-gray-700 leading-relaxed">{search.text}</p>
            </div>
            <div className="flex items-center space-x-1 text-xs text-blue-600 whitespace-nowrap">
              <Plane size={10} />
              <span>{search.options}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentSearch; 