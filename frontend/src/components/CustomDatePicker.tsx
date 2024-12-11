import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useController, Control } from 'react-hook-form';
import { format, parse, setHours, setMinutes, setSeconds } from 'date-fns';
import YearDropdown from './YearDropdown';

interface CustomDatePickerProps {
  name: string;
  control: Control<any>;
  placeholder?: string;
  minYear?: number;  // Add a minYear prop
  maxYear?: number;  // Add a maxYear prop
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ name, control, placeholder, minYear = 1945, maxYear = new Date().getFullYear() }) => {
  const {
    field: { onChange, onBlur, value, ref }
  } = useController({ name, control });

  const handleChange = (date: Date | null) => {
    if (date) {
      const adjustedDate = setHours(setMinutes(setSeconds(date, 0), 0), 0);
      onChange(format(adjustedDate, 'yyyy-MM-dd')); // Save as ISO format for database
    } else {
      onChange(''); // Handle empty date input
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement, Element>) => {
    e.preventDefault(); // Prevent default behavior
    onBlur();
  };

  return (
    <DatePicker
      className="bg-white border rounded-md mt-[-4px] p-2 w-full h-[38px]"
      selected={value ? parse(value, 'yyyy-MM-dd', new Date()) : null}
      onChange={handleChange}
      onBlur={handleBlur}
      dateFormat="dd/MM/yyyy"
      placeholderText={placeholder}
      ref={ref}
      showYearDropdown
      yearDropdownItemNumber={10}  // Display 10 years at a time
      scrollableYearDropdown
      renderCustomHeader={({ date, changeYear, changeMonth, decreaseMonth, increaseMonth }) => (
        <div className="flex px-5 justify-between items-center w-full">
            <button className='font-bold' type="button" onClick={decreaseMonth}>{"<"}</button>
            <select
                className='flex pr-[8px] cursor-pointer'
                value={date.getMonth()}
                onChange={({ target: { value } }) => changeMonth(parseInt(value, 10))}
            >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
            </select>
            {/* <select
                className='cursor-pointer'
                value={date.getFullYear()}
                onChange={({ target: { value } }) => changeYear(parseInt(value, 10))}
            >
                {Array.from({ length: (maxYear - minYear + 1) }, (_, i) => (
                    <option key={i} value={minYear + i}>
                      {minYear + i}
                    </option>
                ))}
            </select> */}
            <YearDropdown
              date={date}
              changeYear={changeYear}
              minYear={minYear}
              maxYear={maxYear}
            />
            <button className='font-bold' type="button" onClick={increaseMonth}>{">"}</button>
        </div>
      )}
    />
  );
};

export default CustomDatePicker;
