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
        border: none;
        border-radius: 0.75rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex !important;
        padding: 0;
        background-color: white;
      }
      .react-datepicker__header {
        background-color: white;
        border-bottom: none;
        border-top-left-radius: 0.75rem;
        border-top-right-radius: 0;
        padding: 0.75rem 0 0.5rem;
        margin: 0;
      }
      .react-datepicker__month-container {
        background-color: white;
        border-radius: 0.75rem 0 0 0.75rem;
        padding: 0;
        margin: 0;
      }
      .react-datepicker__day-name {
        color: #666;
        font-weight: 500;
        width: 2rem;
        margin: 0.2rem;
        font-size: 0.8rem;
      }
      .react-datepicker__day {
        width: 2rem;
        height: 2rem;
        line-height: 2rem;
        margin: 0.2rem;
        border-radius: 50%;
        color: #333;
        font-size: 0.9rem;
      }
      .react-datepicker__time-container {
        border-left: 1px solid #ddd;
        width: 100px;
        border-radius: 0 0.75rem 0.75rem 0;
        overflow: hidden;
        margin: 0;
        padding: 0;
        background-color: #f8f9fa;
      }
      .react-datepicker__time-container .react-datepicker__time-box {
        width: 100px;
        overflow-x: hidden;
        height: 100%;
        margin: 0;
      }
      .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item {
        padding: 4px 10px;
        height: 30px;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .react-datepicker__month {
        margin: 0.4rem;
      }
      .react-datepicker__current-month {
        font-size: 1rem;
        font-weight: 600;
        color: #333;
        margin-bottom: 0.5rem;
      }
      .react-datepicker__navigation {
        top: 1rem;
      }
      .react-datepicker__navigation--next--with-time:not(.react-datepicker__navigation--next--with-today-button) {
        right: 110px;
      }
      .react-datepicker__time-list {
        padding: 0 !important;
        height: 220px !important;
      }
      .react-datepicker__header--time {
        padding: 0.75rem 0 0.5rem;
        background-color: #f8f9fa;
        border-bottom: none;
      }
      .react-datepicker-time__header {
        font-size: 1rem;
        font-weight: 600;
        color: #333;
        padding: 0;
        margin-bottom: 0.5rem;
      }
      .react-datepicker-popper[data-placement^="bottom"] .react-datepicker__triangle::before,
      .react-datepicker-popper[data-placement^="bottom"] .react-datepicker__triangle::after {
        border-bottom-color: white;
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
        color: #38b6ff;
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
        display: flex;
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
        height: 42px;
        padding: 0.375rem 0.75rem;
        border: 1px solid #000;
        border-radius: 4px 0 0 4px;
        font-size: 1rem;
        color: #495057;
        background-color: #fff;
        background-clip: padding-box;
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
      }
      .date-time-wrapper .react-datepicker__input-container input:focus {
        color: #495057;
        background-color: #fff;
        outline: 0;
        border-color: #0071e3;
        box-shadow: 0 0 0 1px #0071e3;
      }
      .date-picker-error {
        border-color: #dc2626 !important;
        background-color: #fee2e2 !important;
        color: #dc2626 !important;
      }
      /* Calendar icon styling */
      .calendar-button {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #0071e3;
        color: white;
        height: 42px;
        width: 42px;
        border: 1px solid #000;
        border-left: none;
        border-radius: 0 4px 4px 0;
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
        background-color: white;
        border-radius: 0.75rem;
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
        background-color: #f8f9fa;
      }
      .react-datepicker__time-box {
        border-radius: 0;
      }
      
      /* Title row with month and time header */
      .react-datepicker__header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      /* Date and time sections positioned exactly */
      .react-datepicker__month-container {
        background: white;
      }
      .react-datepicker__time-container {
        background: #f8f9fa;
      }
      
      /* Month navigation arrows */
      .react-datepicker__navigation--previous,
      .react-datepicker__navigation--next {
        top: 20px;
      }
      
      /* AM/PM indicator */
      .react-datepicker__time-list-item {
        position: relative;
      }
      .react-datepicker__time-list-item::after {
        content: attr(data-ampm);
        font-size: 0.7rem;
        margin-left: 3px;
        color: #666;
      }
    `;
    document.head.appendChild(styleTag);

    // Cleanup function to remove styles when component unmounts
    return () => {
      document.head.removeChild(styleTag);
    };
  }, []); // Empty dependency array means this runs once on mount

  // Function to add AM/PM indicators to time list items
  const addAmPmAttributes = () => {
    setTimeout(() => {
      const timeItems = document.querySelectorAll('.react-datepicker__time-list-item');
      timeItems.forEach(item => {
        const time = item.textContent.trim();
        const hour = parseInt(time.split(':')[0], 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        item.setAttribute('data-ampm', ampm);
      });
    }, 100);
  };

  return (
    <div className="date-time-wrapper">
      <DatePicker
        selected={selected}
        onChange={onChange}
        showTimeSelect
        timeFormat="hh:mm"
        timeIntervals={15}
        timeCaption="Time"
        dateFormat="MMM d, yyyy h:mm aa"
        placeholderText={placeholder}
        className={`w-full ${hasError ? 'date-picker-error' : ''}`}
        popperClassName={popperClassName}
        minDate={minDate}
        showPopperArrow={false}
        calendarClassName="side-time-calendar"
        customInput={
          <input
            className={`w-full h-[42px] ${hasError ? 'date-picker-error' : ''}`}
          />
        }
        onCalendarOpen={addAmPmAttributes}
        onMonthChange={addAmPmAttributes}
        onYearChange={addAmPmAttributes}
      />
      <div className="calendar-button">
        <Calendar className="w-5 h-5 text-white" />
      </div>
      {hasError && (
        <div className="text-red-600 text-xs mt-1 absolute -bottom-5 left-0">Required field</div>
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