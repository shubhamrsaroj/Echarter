import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Carousel } from 'primereact/carousel';
import { Dialog } from 'primereact/dialog';
import ScheduleList from '../schedule/ScheduleList';

const AircraftDetail = ({ aircraft, schedules, onBack }) => {
  const [imagePreview, setImagePreview] = useState(null);
  
  if (!aircraft) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Aircraft not found</p>
        <Button label="Back" icon="pi pi-arrow-left" className="mt-4" onClick={onBack} />
      </div>
    );
  }
  
  const { 
    type, 
    tailNumber, 
    seats, 
    image, 
    images = [], 
    yom, 
    yor, 
    base,
    mtow,
    currency = 'USD',
    perHour
  } = aircraft;
  
  // Combine main image with other images
  const allImages = [image, ...(images || [])].filter(Boolean);
  
  const imageTemplate = (img) => {
    return (
      <div className="flex justify-center p-2">
        <img 
          src={img} 
          alt={`${type} aircraft`} 
          className="w-full h-64 object-cover rounded-lg cursor-pointer"
          onClick={() => setImagePreview(img)}
        />
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <Button 
          label="Back" 
          icon="pi pi-arrow-left" 
          className="p-button-outlined" 
          onClick={onBack} 
        />
        <h1 className="text-2xl font-bold">Tail</h1>
      </div>
      
      {/* Aircraft Images */}
      <div className="mb-6">
        {allImages.length > 0 ? (
          <Carousel 
            value={allImages} 
            numVisible={1} 
            numScroll={1} 
            itemTemplate={imageTemplate}
            showIndicators
            className="custom-carousel"
          />
        ) : (
          <div className="h-64 bg-gray-100 flex items-center justify-center rounded-lg">
            <i className="pi pi-image text-gray-300 text-5xl"></i>
          </div>
        )}
      </div>
      
      {/* Aircraft Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-xl font-bold mb-4">Aircraft Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Aircraft Type:</span>
              <span className="font-medium">{type || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Registration:</span>
              <span className="font-medium">{tailNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Seats:</span>
              <span className="font-medium">{seats || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Year of Manufacture:</span>
              <span className="font-medium">{yom || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Year of Refurbishment:</span>
              <span className="font-medium">{yor || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Base:</span>
              <span className="font-medium">{base || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">MTOW:</span>
              <span className="font-medium">{mtow || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4">Pricing</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600">Per Hour Rate:</span>
              <span className="text-xl font-bold">{currency} {perHour || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-600">Availability:</span>
              <Tag value="Available" className="bg-green-500 text-white" />
            </div>
            
            <Button 
              label="Get a Quote" 
              icon="pi pi-plus" 
              className="w-full p-button-primary bg-indigo-700 hover:bg-indigo-800 border-none"
            />
          </div>
        </div>
      </div>
      
      {/* Schedule Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Schedule</h2>
        {schedules && schedules.length > 0 ? (
          <ScheduleList schedules={schedules} />
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-500">No schedules available for this aircraft</p>
          </div>
        )}
      </div>
      
      {/* Image Preview Dialog */}
      <Dialog
        visible={!!imagePreview}
        onHide={() => setImagePreview(null)}
        dismissableMask
        style={{ width: '90vw', maxWidth: '1000px' }}
        header="Image Preview"
      >
        {imagePreview && (
          <div className="flex justify-center">
            <img 
              src={imagePreview} 
              alt="Aircraft" 
              className="max-w-full max-h-[70vh] object-contain"
            />
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default AircraftDetail; 