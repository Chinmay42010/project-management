import { forwardRef } from 'react';

export const Button = forwardRef(
  ({ className = '', variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-bold rounded-[6px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#36C5F0] focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-[#2EB67D] text-white hover:bg-[#259e6b] border border-transparent',
      secondary: 'bg-white text-[#1D1C1D] border border-[#DDDDDD] hover:bg-[#F8F8F8]',
      outline: 'border border-[#DDDDDD] text-[#1D1C1D] hover:bg-[#F8F8F8] bg-white',
      ghost: 'text-[#1D1C1D] hover:bg-[#F8F8F8] border border-transparent',
      danger: 'bg-[#E01E5A] text-white hover:bg-[#c91a50] border border-transparent',
      slack: 'bg-[#4A154B] text-white hover:bg-[#3a1140] border border-transparent',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-[13px] gap-1.5',
      md: 'px-4 py-2 text-[15px] gap-2',
      lg: 'px-6 py-3 text-[16px] gap-2',
    };

    return (
      <button ref={ref} className={`${base} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`} disabled={disabled || loading} {...props}>
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
