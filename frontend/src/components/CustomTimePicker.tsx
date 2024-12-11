import { useRef, useState } from "react";
import { ChevronDownIcon } from "lucide-react";

type CustomTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  arrowDisabled?: boolean;
  className?: string;
};

const CustomTimePicker = ({ value, onChange, disabled = false, className, arrowDisabled = false }: CustomTimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hour, setHour] = useState(value.split(":")[0] || "00");
  const [minute, setMinute] = useState(value.split(":")[1] || "00");
  const timeOptions = generateTimeOptions();
  const minuteInputRef = useRef<HTMLInputElement>(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select(); // Automatically select the entire input when focused
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, ""); // Allow only digits
    if (input.length > 2) return; // Prevent more than 2 digits

    if (input.length === 1 && parseInt(input, 10) > 2) {
      // Automatically pad with zero if the first digit is > 2
      setHour(`0${input}`);
      // Move focus to minute input after updating hour
      setTimeout(() => minuteInputRef.current?.focus(), 0);
    } else if (input.length === 2) {
      // Validate and set the hour, then move focus
      const validHour = String(Math.max(0, Math.min(23, parseInt(input, 10)))).padStart(2, "0");
      setHour(validHour);
      setTimeout(() => minuteInputRef.current?.focus(), 0);
    } else {
      setHour(input); // Allow intermediate states
    }
  };

  const handleHourBlur = () => {
    if (hour.length === 1) {
      setHour(hour.padStart(2, "0")); // Pad with zero if only one digit
    } else if (hour === "") {
      setHour("00"); // Default to "00" if empty
    }
    const formattedTime = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
    onChange(formattedTime);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, ""); // Allow only digits
    if (input.length > 2) return; // Prevent more than 2 digits
    if (input.length === 1 && parseInt(input, 10) > 5) {
      // Automatically pad with zero if the first digit is > 2
      setMinute(`0${input}`);
      setTimeout(() => minuteInputRef.current?.blur(), 0);
      // Move focus to minute input after updating hour
    } else if (input.length === 2) {
      // Validate and set the hour, then move focus
      const validMinute = String(Math.max(0, Math.min(59, parseInt(input, 10)))).padStart(2, "0");
      setMinute(validMinute);
    } else {
      setMinute(input); // Allow intermediate states
    }
  };

  const handleMinuteBlur = () => {
    if (minute.length === 1) {
      setMinute(minute.padStart(2, "0")); // Pad with zero if only one digit
    } else if (minute === "") {
      setMinute("00"); // Default to "00" if empty
    }
    const formattedTime = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
    onChange(formattedTime);
  };

  const handleTimeSelect = (time: string) => {
    const [selectedHour, selectedMinute] = time.split(":");
    setHour(selectedHour);
    setMinute(selectedMinute);
    onChange(time);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className={`relative flex items-center space-x-2 ${className || ''}`}>
        <input
          id="hour-input"
          type="text"
          value={hour}
          onChange={handleHourChange}
          onBlur={handleHourBlur} // Add blur handler
          onFocus={handleFocus}
          placeholder="HH"
          maxLength={2}
          disabled={disabled}
          className={`border rounded-md py-2 px-3 w-16   ${disabled ? 'text-gray-400 bg-grey-900 font-normal italic' : 'text-gray-700 bg-white appearance-none'} focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all duration-200 text-center`}
        />
        <span className="text-gray-700">:</span>
        <input
          id="minute-input"
          type="text"
          value={minute}
          onChange={handleMinuteChange}
          onBlur={handleMinuteBlur} // Add blur handler
          onFocus={handleFocus}
          ref={minuteInputRef}
          placeholder="MM"
          maxLength={2}
          disabled={disabled}
          className={`border rounded-md py-2 px-3 w-16 ${disabled ? 'text-gray-400 bg-grey-900 font-normal italic' : 'text-gray-700 bg-white appearance-none'} focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all duration-200 text-center`}
        />
        {!disabled && !arrowDisabled && (
          <div
            onClick={toggleDropdown}
            className={`flex items-center text-gray-500 cursor-pointer hover:text-gray-700`}
          >
            <ChevronDownIcon className={`${isOpen ? "rotate-180" : "rotate-0"} transition-transform duration-200`} />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 bg-white border rounded-md mt-2 max-h-40 w-full overflow-y-auto shadow-lg">
          {timeOptions.map((time) => (
            <div
              key={time}
              onClick={() => handleTimeSelect(time)}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              {time}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const generateTimeOptions = () => {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      times.push(formattedTime);
    }
  }
  return times;
};

export default CustomTimePicker;
