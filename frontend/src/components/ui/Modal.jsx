import { Fragment, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-[90vw]' };
  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = 'unset'; };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return createPortal(
    <Fragment>
      <div className="fixed inset-0 bg-[#1D1C1D]/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
        <div className={`w-full ${sizes[size]} bg-white rounded-[8px] shadow-xl border border-[#DDDDDD]`} onClick={(e) => e.stopPropagation()}>
          {(title || onClose) && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#DDDDDD]">
              {title && <h2 className="text-[18px] font-bold text-[#1D1C1D]">{title}</h2>}
              <button onClick={onClose} className="p-1 rounded-[6px] text-[#696969] hover:bg-[#F8F8F8] hover:text-[#1D1C1D]" aria-label="Close modal"><X className="w-5 h-5" /></button>
            </div>
          )}
          <div className="p-4">{children}</div>
        </div>
      </div>
    </Fragment>,
    document.body
  );
}
