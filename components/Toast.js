// components/Toast.js
import { useEffect } from 'react';
import { Icon } from '@iconify/react';

export default function Toast({ open, message, type = 'success', onClose }) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div 
      className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[99999] px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border transition-all duration-300 max-w-sm w-full mx-auto ${
        type === 'success' 
          ? 'bg-gradient-to-r from-emerald-950/85 via-emerald-900/80 to-teal-900/85 border-emerald-800/35 text-white/95 shadow-emerald-800/12' 
          : 'bg-gradient-to-r from-red-500/95 to-red-600/95 border-red-500/60 text-white shadow-red-500/30'
      }`}
      style={{
        animation: 'toastIn 0.3s ease-out'
      }}
    >
      <div className="flex items-center justify-center gap-2">
        {type === 'success' ? (
          <Icon icon="mdi:check-circle" className="w-5 h-5 text-white/90 flex-shrink-0" />
        ) : (
          <Icon icon="mdi:alert-circle" className="w-5 h-5 text-white flex-shrink-0" />
        )}
        <p className="font-semibold text-sm text-center text-white/90">{message}</p>
      </div>
      <style jsx>{`
        @keyframes toastIn { 
          from { 
            opacity: 0; 
            transform: translateY(40px) translateX(-50%); 
          } 
          to { 
            opacity: 1; 
            transform: translateY(0) translateX(-50%); 
          } 
        }
      `}</style>
    </div>
  );
}
