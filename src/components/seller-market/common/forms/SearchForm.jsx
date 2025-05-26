import React, { useState } from 'react';
import { Plane, Calendar, Users, Clock, ArrowUpDown, Plus, Trash2 } from 'lucide-react';

const SearchForm = () => {
  const [passengers, setPassengers] = useState(1);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4 flex space-x-4">
        <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Trip Category</option>
          <option>Business</option>
          <option>Personal</option>
          <option>Charter</option>
        </select>
        <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Aircraft Category</option>
          <option>Light Jet</option>
          <option>Mid-size Jet</option>
          <option>Heavy Jet</option>
          <option>Turboprop</option>
        </select>
        <button className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium">
          Search
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Places / Airport</label>
          <div className="relative">
            <Plane className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter departure"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Destination</label>
          <div className="relative">
            <Plane className="absolute left-3 top-3 h-4 w-4 text-gray-400 transform rotate-90" />
            <input 
              type="text" 
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter destination"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Arrival / Departure</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input 
              type="date" 
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Passengers</label>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setPassengers(Math.max(1, passengers - 1))}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-600">−</span>
            </button>
            <div className="flex items-center justify-center w-12 h-8 border border-gray-300 rounded">
              <Users className="h-4 w-4 text-gray-400 mr-1" />
              <span className="text-sm font-medium">{passengers}</span>
            </div>
            <button 
              onClick={() => setPassengers(passengers + 1)}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-600">+</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end space-x-2">
        <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors" title="Schedule">
          <Clock className="h-4 w-4 text-gray-600" />
        </button>
        <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors" title="Swap">
          <ArrowUpDown className="h-4 w-4 text-gray-600" />
        </button>
        <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors" title="Add Stop">
          <Plus className="h-4 w-4 text-gray-600" />
        </button>
        <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-red-500" title="Clear">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default SearchForm; 