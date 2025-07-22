import React from "react";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return <input ref={ref} className={`border p-2 rounded ${className}`} {...props} />;
  }
);

Input.displayName = "Input";
