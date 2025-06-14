import React from 'react';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

const ScheduleList = ({ schedules, onBookClick }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6">Schedule</h2>
      
      <div className="border-t border-gray-200 pt-6">
        {schedules && schedules.length > 0 ? (
          <div className="space-y-4">
            {schedules.map((schedule, index) => (
              <div key={schedule.id || index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  {/* Aircraft Type */}
                  <div className="flex flex-col">
                    <h3 className="text-lg font-medium mb-2">Aircraft Type</h3>
                    <div className="flex gap-2">
                      <Tag value="Midsize" className="bg-blue-500 text-white text-xs" />
                      <span className="text-gray-500 text-sm">Availability Type</span>
                    </div>
                  </div>
                  
                  {/* Departure */}
                  <div className="flex items-center">
                    <i className="pi pi-plane-takeoff mr-2 text-gray-600"></i>
                    <span className="text-gray-800">{schedule.departure || 'Fort Lauderdale'}</span>
                  </div>
                  
                  {/* Arrival */}
                  <div className="flex items-center">
                    <i className="pi pi-plane-landing mr-2 text-gray-600"></i>
                    <span className="text-gray-800">{schedule.arrival || 'Denver'}</span>
                  </div>
                  
                  {/* Date */}
                  <div className="flex items-center">
                    <i className="pi pi-calendar mr-2 text-gray-600"></i>
                    <span className="text-gray-800">{schedule.date || '21 Jun 25'}</span>
                  </div>
                  
                  {/* Passengers */}
                  <div className="flex items-center">
                    <i className="pi pi-users mr-2 text-gray-600"></i>
                    <span className="text-gray-800">{schedule.passengers || '6'}</span>
                  </div>
                  
                  {/* Price */}
                  <div className="flex flex-col items-end">
                    <div className="font-medium text-lg mb-2 text-indigo-600">Price</div>
                    <Button 
                      label="Book" 
                      className="p-button-success"
                      onClick={() => onBookClick(schedule)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-500">No schedules available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleList; 