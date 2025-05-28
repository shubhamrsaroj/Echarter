import { useEffect } from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import { Calendar } from 'lucide-react';
import "react-datepicker/dist/react-datepicker.css";

const DateAndTime = ({ 
  selected, 
  onChange, 
  placeholder = "Select date & time", 
  popperClassName = "react-datepicker-left",
  minDate = null,
  hasError = false
}) => {
  
  useEffect(() => {
    // Add custom styles for date picker
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      .react-datepicker {
        font-family: inherit;
        border: 1px solid #000;
        border-radius: 0.75rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        display: flex !important;
        padding: 0;
      }
      .react-datepicker__header {
        background-color: #f8f9fa;
        border-bottom: 1px solid #000;
        border-top-left-radius: 0.75rem;
        border-top-right-radius: 0;
        padding: 0.5rem 0;
        margin: 0;
      }
      .react-datepicker__month-container {
        background-color: white;
        border-radius: 0.75rem 0 0 0.75rem;
        padding: 0;
        margin: 0;
      }
      .react-datepicker__day-name {
        color: #000;
        font-weight: 500;
        width: 1.8rem;
        margin: 0.1rem;
        font-size: 0.8rem;
      }
      .react-datepicker__day {
        width: 1.9rem;
        height: 1.8rem;
        line-height: 1.8rem;
        margin: 0.1rem;
        border-radius: 50%;
        color: #000;
        font-size: 0.85rem;
      }
      .react-datepicker__time-container {
        border-left: 1px solid #000;
        width: 80px;
        border-radius: 0 0.75rem 0.75rem 0;
        overflow: hidden;
        margin: 0;
        padding: 0;
      }
      .react-datepicker__time-container .react-datepicker__time-box {
        width: 100px;
        overflow-x: hidden;
        height: 100%;
        margin: 0;
      }
      .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item {
        padding: 2px 6px;
        height: 24px;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .react-datepicker__month {
        margin: 0.2rem;
      }
      .react-datepicker__current-month {
        font-size: 0.9rem;
        font-weight: 600;
        color: #000;
        margin-bottom: 0.2rem;
      }
      .react-datepicker__navigation {
        top: 0.6rem;
      }
      .react-datepicker__navigation--next--with-time:not(.react-datepicker__navigation--next--with-today-button) {
        right: 90px;
      }
      .react-datepicker__time-list {
        padding: 0 !important;
        height: 220px !important;
      }
      .react-datepicker__header--time {
        padding: 0.4rem 0;
      }
      .react-datepicker-time__header {
        font-size: 0.8rem;
        padding: 0.2rem;
      }
      .react-datepicker-popper[data-placement^="bottom"] .react-datepicker__triangle::before {
        border-bottom-color: #000;
      }
      .react-datepicker__day--selected {
        background-color: #38b6ff;
        color: white;
        font-weight: 500;
      }
      .react-datepicker__day:hover {
        background-color: #bce0fd;
      }
      .react-datepicker__day--today {
        font-weight: 600;
        background-color: #f3f4f6;
      }
      .react-datepicker__time-list-item--selected {
        background-color: #38b6ff !important;
        color: white !important;
        font-weight: 500 !important;
      }
      .react-datepicker__time-list-item:hover {
        background-color: #bce0fd !important;
      }
      .react-datepicker-left {
        z-index: 100;
      }
      .react-datepicker-right {
        z-index: 100;
      }
      .date-time-wrapper {
        width: 100%;
        position: relative;
      }
      .date-time-wrapper .react-datepicker-wrapper {
        width: 100%;
      }
      .date-time-wrapper .react-datepicker__input-container {
        width: 100%;
        display: flex;
        align-items: center;
      }
      .date-time-wrapper .react-datepicker__input-container input {
        width: 100%;
        box-sizing: border-box;
        height: 36px;
        padding: 0.375rem 0.75rem 0.375rem 2rem;
      }
      .date-picker-error {
        border-color: #dc2626 !important;
        background-color: #fee2e2 !important;
        color: #dc2626 !important;
      }
      /* Calendar icon styling */
      .calendar-icon {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 1;
        pointer-events: none;
      }
      /* ScrollBar styling */
      .react-datepicker__time-list::-webkit-scrollbar {
        width: 6px;
      }
      .react-datepicker__time-list::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
      }
      .react-datepicker__time-list::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 3px;
      }
      .react-datepicker__time-list::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
      /* Fix for the overall layout */
      .side-time-calendar {
        display: flex;
      }
      /* Fix for vertical alignment */
      .react-datepicker__time-container, 
      .react-datepicker__month-container {
        display: flex;
        flex-direction: column;
      }
      .react-datepicker__month-container {
        flex: 1;
      }
      /* Fix borders of time section */
      .react-datepicker__time {
        border-radius: 0;
      }
      .react-datepicker__time-box {
        border-radius: 0;
      }
    `;
    document.head.appendChild(styleTag);

    // Cleanup function to remove styles when component unmounts
    return () => {
      document.head.removeChild(styleTag);
    };
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="date-time-wrapper">
      <Calendar className="calendar-icon w-4 h-4 text-gray-600" />
      <DatePicker
        selected={selected}
        onChange={onChange}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        timeCaption="Time"
        dateFormat="MMM d, yyyy h:mm aa"
        placeholderText={placeholder}
        className={`w-full p-2 border-2 border-black rounded bg-white text-black placeholder-gray-500 ${hasError ? 'date-picker-error' : ''}`}
        popperClassName={popperClassName}
        minDate={minDate}
        showPopperArrow={false}
        calendarClassName="side-time-calendar"
      />
      {hasError && (
        <div className="text-red-600 text-xs mt-1">Required field</div>
      )}
    </div>
  );
};

DateAndTime.propTypes = {
  selected: PropTypes.instanceOf(Date),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  popperClassName: PropTypes.string,
  minDate: PropTypes.instanceOf(Date),
  hasError: PropTypes.bool
};

export default DateAndTime; 