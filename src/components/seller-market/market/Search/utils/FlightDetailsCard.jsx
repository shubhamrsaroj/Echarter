import React from 'react';
import { Card } from 'primereact/card';
import PropTypes from 'prop-types';

const FlightDetailsCard = ({ flightData }) => {
  if (!flightData) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderRow = (label, value) => (
    <div className="flex justify-between items-start">
      <span className="text-[#3E4451] font-inter text-sm font-normal leading-[20px]">
        {label} –
      </span>
      <span className="text-black font-inter text-sm font-normal leading-[20px] text-right max-w-[60%] break-words">
        {value || 'N/A'}
      </span>
    </div>
  );

  return (
    <Card className="w-full shadow-md border rounded-lg p-3">
      <div className="flex flex-col space-y-3 text-sm">
        {renderRow('From', flightData.fromCity)}
        {renderRow('To', flightData.toCity)}
        {renderRow('Seats', flightData.seats)}
        {renderRow('Aircraft', flightData.acType)}
        {renderRow('Date From', formatDate(flightData.dateFrom))}
        {renderRow('Date To', formatDate(flightData.dateTo))}
        {renderRow('Price', flightData.price || 'Contact for pricing')}
      </div>
    </Card>
  );
};

FlightDetailsCard.propTypes = {
  flightData: PropTypes.object
};

export default FlightDetailsCard;
