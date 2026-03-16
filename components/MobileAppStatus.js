import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { isMobileApp } from '../utils/mobileAppDetection';

/**
 * MobileAppStatus Component
 * Shows mobile app status when running in TWA/WebView
 * Only shows for mobile app users, hidden for browser users
 */
export default function MobileAppStatus({ applicationData, className = "" }) {
  const [isInMobileApp, setIsInMobileApp] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsInMobileApp(isMobileApp());
  }, []);

  // Jangan tampilkan jika tidak di aplikasi mobile
  if (!isInMobileApp) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#F45D16] to-[#0058BC] rounded-2xl blur opacity-20"></div>
      <div className="relative bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl p-5 border border-white/10 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#F45D16]/10">
            <Icon 
              icon="mdi:check-circle" 
              className="w-6 h-6 text-[#F45D16]" 
            />
          </div>
          <h3 className="text-white font-bold text-base">
            {applicationData?.name || 'Money Rich'} Mobile App
          </h3>
        </div>
        
        <p className="text-white/60 text-xs mb-4">
          Anda sedang menggunakan aplikasi mobile ✅
        </p>
        
        <div className="bg-[#F45D16]/20 text-[#F45D16] border border-[#F45D16]/30 rounded-xl py-3 px-6">
          <Icon icon="mdi:check-circle" className="w-5 h-5 inline mr-2" />
          TERINSTALL
        </div>

        <p className="text-[#F45D16] text-[10px] mt-3 flex items-center justify-center gap-1">
          <Icon icon="mdi:information" className="w-3 h-3" />
          Aplikasi mobile aktif
        </p>
      </div>
    </div>
  );
}
