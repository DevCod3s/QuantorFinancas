import * as React from "react";
import { cn } from "@/lib/utils";

export interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export interface FloatingSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: React.ReactNode;
}

export interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="floating-input">
        <input
          ref={ref}
          className={cn("", className)}
          placeholder=" "
          {...props}
        />
        <label>{label}</label>
      </div>
    );
  }
);
FloatingInput.displayName = "FloatingInput";

const FloatingSelect = React.forwardRef<HTMLSelectElement, FloatingSelectProps>(
  ({ className, label, children, ...props }, ref) => {
    return (
      <div className="floating-input">
        <select
          ref={ref}
          className={cn("", className)}
          {...props}
        >
          {children}
        </select>
        <label>{label}</label>
      </div>
    );
  }
);
FloatingSelect.displayName = "FloatingSelect";

const FloatingTextarea = React.forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="floating-input">
        <textarea
          ref={ref}
          className={cn("resize-none", className)}
          placeholder=" "
          {...props}
        />
        <label>{label}</label>
      </div>
    );
  }
);
FloatingTextarea.displayName = "FloatingTextarea";

export { FloatingInput, FloatingSelect, FloatingTextarea };
