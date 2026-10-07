import { forwardRef } from 'react';

export const Badge = forwardRef(({ className = '', variant = 'default', size = 'md', children, ...props }, ref) => {
  const variants = {
    default: 'bg-[#F8F8F8] text-[#1D1C1D] border border-[#DDDDDD]',
    success: 'bg-[#2EB67D] text-white',
    warning: 'bg-[#ECB22E] text-[#1D1C1D]',
    danger: 'bg-[#E01E5A] text-white',
    info: 'bg-[#36C5F0] text-[#1D1C1D]',
    outline: 'border border-[#DDDDDD] text-[#696969] bg-white',
  };
  const sizes = { sm: 'px-2 py-0.5 text-[11px]', md: 'px-2.5 py-0.5 text-xs' };
  return (
    <span ref={ref} className={`inline-flex items-center font-bold rounded-full ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </span>
  );
});
Badge.displayName = 'Badge';
