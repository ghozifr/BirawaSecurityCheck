import * as React from "react"

import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({placeholder, className, type,  ...props }, ref) => {
    return (
      <input
        type={type}
        placeholder={placeholder}
        min={0}
        className={cn(
          "appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight",
          "focus:outline-none focus:border-red-400",
          "focus:ring-4 focus:ring-red-100", // Menambahkan ring yang lebih tebal dengan opacity rendah
          "transition-all duration-200", // Mengubah ke transition-all agar ring juga mendapat efek transisi
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
