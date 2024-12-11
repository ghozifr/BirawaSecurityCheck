// Button.tsx
import React from 'react';

interface ButtonProps {
  type: "button" | "submit" | "reset";
  IsDisabled? : boolean,
  onClick?: () => void;
  children: React.ReactNode;
  className?: string; 
}

const Button: React.FC<ButtonProps> = ({ type, onClick, children, className }) => (
  <button
    type={type}
    onClick={onClick}
    className={`${className} bg-primary w-full  hover:bg-primary ease-in-out duration-150  font-semibold py-2 px-4 rounded focus:outline-none `}
  >
    {children}
  </button>
);

export default Button;
