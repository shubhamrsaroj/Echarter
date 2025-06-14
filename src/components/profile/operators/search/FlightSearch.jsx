import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';

const FlightSearch = ({ onSearch, className }) => {
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    dateTime: null,
    passengers: ''
  });

  const handleChange = (e, field) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSearch = () => {
    onSearch(searchParams);
  };

  const handleReset = () => {
    setSearchParams({
      from: '',
      to: '',
      dateTime: null,
      passengers: ''
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className || 'mb-8'}`}>
      <h2 className="text-2xl font-bold mb-6">Get a Quote</h2>
      
      <div className="border-t border-gray-200 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* From Field */}
          <div>
            <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-2">From</label>
            <InputText
              id="from"
              value={searchParams.from}
              onChange={(e) => handleChange(e, 'from')}
              placeholder="Search"
              className="w-full"
            />
          </div>
          
          {/* To Field */}
          <div>
            <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-2">To</label>
            <InputText
              id="to"
              value={searchParams.to}
              onChange={(e) => handleChange(e, 'to')}
              placeholder="Search"
              className="w-full"
            />
          </div>
          
          {/* Date Time Field */}
          <div>
            <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700 mb-2">Date Time</label>
            <Calendar
              id="dateTime"
              value={searchParams.dateTime}
              onChange={(e) => handleChange(e, 'dateTime')}
              showTime
              showIcon
              placeholder="Date Time"
              className="w-full"
            />
          </div>
          
          {/* Passengers Field */}
          <div>
            <label htmlFor="passengers" className="block text-sm font-medium text-gray-700 mb-2">Passengers</label>
            <InputText
              id="passengers"
              value={searchParams.passengers}
              onChange={(e) => handleChange(e, 'passengers')}
              placeholder="Placeholder"
              className="w-full"
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded">
              <i className="pi pi-image text-gray-300 text-2xl"></i>
            </div>
            <div>
              <h3 className="text-xl font-medium">Aircraft Type</h3>
              <div className="flex gap-2 mt-1">
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">Midsize</span>
                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">Tail</span>
                <span className="flex items-center bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                  <i className="pi pi-users mr-1"></i> 6
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-indigo-600 font-medium flex items-center">
                <i className="pi pi-tag mr-2"></i>
                <span>Price</span>
              </div>
              <Button 
                label="Book" 
                className="mt-2 p-button-success"
                onClick={handleSearch}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <div className="flex gap-2">
            <Button 
              icon="pi pi-plus"
              className="p-button-rounded p-button-outlined"
              aria-label="Add"
            />
            <Button 
              icon="pi pi-sort-alt"
              className="p-button-rounded p-button-outlined"
              aria-label="Sort"
            />
            <Button 
              icon="pi pi-trash"
              className="p-button-rounded p-button-outlined text-red-500 border-red-500"
              aria-label="Delete"
              onClick={handleReset}
            />
            <Button 
              label="Get Quote" 
              className="ml-2 bg-blue-500 hover:bg-blue-600 border-none"
              onClick={handleSearch}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightSearch; 