import { ChevronDown } from "lucide-react";
import { useState } from "react";

type Props = {
    date: Date,
    changeYear: (year: number) => void,
    minYear: number,
    maxYear: number
}

const YearDropdown = ({ date, changeYear, minYear, maxYear }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (year: number) => {
    changeYear(year);
    setIsOpen(false); // Close the dropdown after selecting an option
  };

  return (
    <div className="relative w-auto">
      <div
        className="flex cursor-pointer font-normal tracking-[1px] text-[12.6px] bg-gray-200 items-center"
        onClick={toggleDropdown}
      >
        {date?.getFullYear()}
        <ChevronDown className="size-[11px] ml-[2px]"/>
        {/* <img src="/src/assets/down_arrow.svg" alt="" className="w-[6px] ml-1"/> */}
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-[200px] bg-white border overflow-y-auto p-1 rounded-sm shadow-lg">
          {Array.from({ length: maxYear - minYear + 1 }, (_, i) => (
            <div
              key={i}
              className="px-2 py-1 cursor-pointer hover:bg-gray-200 text-[12px] rounded-xs"
              onClick={() => handleOptionClick(maxYear - i)}
            >
              {maxYear - i}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default YearDropdown;
