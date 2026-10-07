import { forwardRef } from 'react';

export const Select = forwardRef(({ className = '', label, error, options, placeholder, id, ...props }, ref) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && <label htmlFor={selectId} className="block text-[13px] font-bold text-[#1D1C1D] mb-1">{label}</label>}
      <select
        ref={ref}
        id={selectId}
        className={`w-full px-3 py-2 border rounded-[6px] text-[15px] bg-white focus:outline-none focus:ring-2 focus:ring-[#1264A3] focus:border-[#1264A3] ${error ? 'border-[#E01E5A]' : 'border-[#1D1C1D]/30'} ${className}`}
        {...props}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {error && <p className="mt-1 text-[13px] text-[#E01E5A]" role="alert">{error}</p>}
    </div>
  );
});
Select.displayName = 'Select';
