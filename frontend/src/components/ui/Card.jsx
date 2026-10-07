import { forwardRef } from 'react';

export const Card = forwardRef(({ className = '', padding = 'md', children, ...props }, ref) => {
  const paddings = { none: '', sm: 'p-4', md: 'p-4', lg: 'p-6' };
  return (
    <div ref={ref} className={`bg-white rounded-[8px] border border-[#DDDDDD] shadow-sm ${paddings[padding]} ${className}`} {...props}>
      {children}
    </div>
  );
});
Card.displayName = 'Card';

export const CardHeader = forwardRef(({ className = '', children, ...props }, ref) => (
  <div ref={ref} className={`mb-3 ${className}`} {...props}>{children}</div>
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef(({ className = '', children, ...props }, ref) => (
  <h3 ref={ref} className={`text-[15px] font-bold text-[#1D1C1D] leading-tight ${className}`} {...props}>{children}</h3>
));
CardTitle.displayName = 'CardTitle';

export const CardContent = forwardRef(({ className = '', children, ...props }, ref) => (
  <div ref={ref} className={className} {...props}>{children}</div>
));
CardContent.displayName = 'CardContent';
