import { forwardRef } from 'react';

export const Input = forwardRef(({ className = '', label, error, helperText, id, ...props }, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} className="block text-[13px] font-bold text-[#1D1C1D] mb-1">{label}</label>}
      <input
        ref={ref}
        id={inputId}
        className={`w-full px-3 py-2 border rounded-[6px] text-[15px] placeholder-[#696969] bg-white focus:outline-none focus:ring-2 focus:ring-[#1264A3] focus:border-[#1264A3] ${error ? 'border-[#E01E5A] focus:ring-[#E01E5A] focus:border-[#E01E5A]' : 'border-[#1D1C1D]/30'} ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
      {error && <p id={`${inputId}-error`} className="mt-1 text-[13px] text-[#E01E5A]" role="alert">{error}</p>}
      {helperText && !error && <p className="mt-1 text-[13px] text-[#696969]">{helperText}</p>}
    </div>
  );
});
Input.displayName = 'Input';
