import { Dropdown } from 'primereact/dropdown';
import PropTypes from 'prop-types';
import React from 'react';

const AircraftSelector = ({
  id,
  selectedAircraft,
  aircraftTypes,
  loading,
  error,
  onSelectAircraft,
  hasError,
  label
}) => {
  // Find object from selected string (used for controlled value binding)
  const selectedAircraftObj =
    Array.isArray(aircraftTypes) &&
    aircraftTypes.find((ac) => ac.name === selectedAircraft);

  // Filter out invalid aircraft types
  const validAircraftTypes = Array.isArray(aircraftTypes)
    ? aircraftTypes.filter(
        (aircraft) =>
          aircraft.slp !== null &&
          aircraft.slp !== undefined &&
          aircraft.cons !== null &&
          aircraft.cons !== undefined
      )
    : [];

  return (
    <div className="w-full text-left">
      {label && <label className="block text-sm font-medium text-black mb-2">{label}</label>}
      <Dropdown
        value={selectedAircraftObj || null}
        options={validAircraftTypes}
        optionLabel="name"
        placeholder="Select Aircraft"
        loading={loading ? loading.toString() : undefined}
        className={`w-full text-left ${hasError ? 'p-invalid' : ''}`}
        onChange={(e) => {
          if (e.value) onSelectAircraft(id, e.value);
        }}
        emptyMessage="No aircraft available"
      />
      {error && <small className="p-error block mt-1">{error}</small>}
    </div>
  );
};

AircraftSelector.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  selectedAircraft: PropTypes.string,
  aircraftTypes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      slp: PropTypes.number,
      cons: PropTypes.number
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.string,
  onSelectAircraft: PropTypes.func.isRequired,
  hasError: PropTypes.bool,
  label: PropTypes.string
};

export default AircraftSelector;
