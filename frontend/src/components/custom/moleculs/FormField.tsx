import React from 'react';
import Label from '../atom/Label';
import Input from '../atom/Input';
interface FormFieldProps {
  label: string;
  type: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  readonly?: boolean;
  IsHorizontal?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  type,
  id,
  value,
  onChange,
  placeholder,
  IsHorizontal = false,
  required = false,
  readonly = false,
}) => {
  return (
    <div className={`flex  ${IsHorizontal ? "flex-row items-center gap-x-2" : "flex-col"}`}>
      <div className='flex items-start gap-0.5 justify-start relative w-[90px] '>
        <Label htmlFor={id}>{label}</Label>
        {required && <span className='text-primary relative -top-1'>*</span>}
      </div>
      <Input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        readonly={readonly}
      />
    </div>
  );
};

export default FormField;
