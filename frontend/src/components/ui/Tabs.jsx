import { createContext, useContext } from 'react';

const TabsContext = createContext(null);

export function Tabs({ value, onValueChange, children, className = '' }) {
  return <TabsContext.Provider value={{ value, onValueChange }}><div className={className}>{children}</div></TabsContext.Provider>;
}

export function TabsList({ children, className = '' }) {
  return <div className={`flex gap-0 border-b border-[#DDDDDD] ${className}`} role="tablist">{children}</div>;
}

export function TabsTrigger({ value, children, className = '', disabled }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsTrigger must be used within Tabs');
  const isActive = ctx.value === value;
  return (
    <button
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => !disabled && ctx.onValueChange(value)}
      className={`px-4 py-2 text-[13px] font-bold border-b-2 -mb-px transition-colors ${isActive ? 'border-[#1164A3] text-[#1164A3]' : 'border-transparent text-[#696969] hover:text-[#1D1C1D]'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = '' }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsContent must be used within Tabs');
  if (ctx.value !== value) return null;
  return <div role="tabpanel" className={`${className}`}>{children}</div>;
}
