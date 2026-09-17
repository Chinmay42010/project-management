import { createContext, useContext, useState } from 'react';

const TabsContext = createContext(null);

export function Tabs({ value, onValueChange, children, className = '' }) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = '' }) {
  return (
    <div className={`flex gap-1 ${className}`} role="tablist">
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className = '', disabled }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const isActive = context.value === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabs-${value}`}
      id={`tab-${value}`}
      disabled={disabled}
      onClick={() => !disabled && context.onValueChange(value)}
      className={`
        flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all
        ${isActive
          ? 'bg-indigo-600 text-white shadow-sm'
          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = '' }) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  if (context.value !== value) return null;

  return (
    <div
      role="tabpanel"
      aria-labelledby={`tab-${value}`}
      id={`tabs-${value}`}
      className={`animate-in fade-in-0 ${className}`}
    >
      {children}
    </div>
  );
}