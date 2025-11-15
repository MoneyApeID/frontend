import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

/**
 * CustomAlert Component
 * Custom alert modal yang sesuai dengan desain website
 */
export default function CustomAlert({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'info', 'success', 'warning', 'error'
  showCancel = false,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel'
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: 'mdi:check-circle', color: 'text-brand-emerald', bgColor: 'bg-brand-emerald/20 border-brand-emerald/30' };
      case 'warning':
        return { icon: 'mdi:alert-circle', color: 'text-brand-gold', bgColor: 'bg-brand-gold/20 border-brand-gold/30' };
      case 'error':
        return { icon: 'mdi:close-circle', color: 'text-red-400', bgColor: 'bg-red-500/20 border-red-500/30' };
      default:
        return { icon: 'mdi:information', color: 'text-brand-gold', bgColor: 'bg-brand-gold/20 border-brand-gold/30' };
    }
  };

  const { icon, color, bgColor } = getIconAndColor();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-auto">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-gold/30 to-brand-emerald/30 rounded-2xl blur opacity-40"></div>
        <div className="relative bg-gradient-to-br from-brand-surface to-brand-surface-soft rounded-2xl p-6 border border-white/10 shadow-[0_20px_60px_rgba(5,6,8,0.6)]">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${bgColor}`}>
              <Icon icon={icon} className={`w-6 h-6 ${color}`} />
            </div>
            <h3 className="text-white font-bold text-lg">{title}</h3>
          </div>
          
          {/* Message */}
          <div className="mb-6">
            <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
              {message}
            </p>
          </div>
          
          {/* Actions */}
          <div className={`flex gap-3 ${showCancel ? 'justify-end' : 'justify-center'}`}>
            {showCancel && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 border border-white/20"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
              className="px-6 py-2 bg-gradient-to-r from-brand-gold to-brand-gold-deep hover:from-brand-gold-deep hover:to-brand-gold text-brand-black font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-brand-glow"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
