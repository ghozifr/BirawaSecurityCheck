import React from 'react';

interface InputProps {
  type: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  readonly? :boolean;
}

const Input: React.FC<InputProps> = ({
  type,
  id,
  value,
  onChange,
  placeholder = '',
  required = false,
  readonly,
  className = "appearance-none border rounded-md w-full  py-2 px-3 text-gray-700 leading-tight focus:outline-red-500 ",
}) => {
  return (
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={className}
      readOnly={readonly}
    />
  );
};

export default Input;
