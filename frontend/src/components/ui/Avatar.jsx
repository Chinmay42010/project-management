import { forwardRef } from 'react';

export const Avatar = forwardRef(
  ({ className = '', name, size = 'md', src, alt, ...props }, ref) => {
    const sizes = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
    };

    const getInitials = (name) => {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    const getColor = (name) => {
      const colors = [
        'bg-red-500',
        'bg-orange-500',
        'bg-amber-500',
        'bg-green-500',
        'bg-emerald-500',
        'bg-teal-500',
        'bg-cyan-500',
        'bg-sky-500',
        'bg-blue-500',
        'bg-indigo-500',
        'bg-violet-500',
        'bg-purple-500',
        'bg-fuchsia-500',
        'bg-pink-500',
        'bg-rose-500',
      ];
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    };

    if (src) {
      return (
        <img
          ref={ref}
          src={src}
          alt={alt || name || 'Avatar'}
          className={`${sizes[size]} rounded-full object-cover ${className}`}
          {...props}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={`${sizes[size]} rounded-full flex items-center justify-center font-medium text-white ${getColor(name || 'unknown')} ${className}`}
        {...props}
      >
        {name ? getInitials(name) : '?'}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';