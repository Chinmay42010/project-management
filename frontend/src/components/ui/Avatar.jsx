import { forwardRef } from 'react';

export const Avatar = forwardRef(({ className = '', name, size = 'md', src, alt, ...props }, ref) => {
  const sizes = { xs: 'w-6 h-6 text-[11px]', sm: 'w-8 h-8 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-lg' };
  const getInitials = (n) => n.split(' ').map((x) => x[0]).join('').toUpperCase().slice(0, 2);
  const getColor = (n) => {
    const colors = ['bg-[#1164A3]', 'bg-[#2EB67D]', 'bg-[#E01E5A]', 'bg-[#ECB22E] text-[#1D1C1D]', 'bg-[#4A154B]', 'bg-[#36C5F0] text-[#1D1C1D]'];
    let h = 0; for (let i = 0; i < n.length; i++) h = n.charCodeAt(i) + ((h << 5) - h);
    return colors[Math.abs(h) % colors.length];
  };
  if (src) return <img ref={ref} src={src} alt={alt || name || 'Avatar'} className={`${sizes[size]} rounded-[6px] object-cover ${className}`} {...props} />;
  return <div ref={ref} className={`${sizes[size]} rounded-[6px] flex items-center justify-center font-bold text-white ${getColor(name || 'unknown')} ${className}`} {...props}>{name ? getInitials(name) : '?'}</div>;
});
Avatar.displayName = 'Avatar';
