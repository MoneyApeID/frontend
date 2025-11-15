import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { isMobileApp, isIOS, isAndroid, isDesktop, isAppInstalled } from '../utils/mobileAppDetection';
import CustomAlert from './CustomAlert';

/**
 * AppInstallButton Component
 * Smart app installation button that detects if app is installed
 * Only shows for browser users, hidden for mobile app users
 */
export default function AppInstallButton({ applicationData, className = "" }) {
  const [isInMobileApp, setIsInMobileApp] = useState(false);
  const [deviceType, setDeviceType] = useState({ isIOS: false, isAndroid: false, isDesktop: false });
  const [isAppInstalledState, setIsAppInstalledState] = useState(false);
  const [isCheckingInstallation, setIsCheckingInstallation] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    setIsInMobileApp(isMobileApp());
    setDeviceType({
      isIOS: isIOS(),
      isAndroid: isAndroid(),
      isDesktop: isDesktop()
    });

    // Check if app is installed
    const checkAppInstallation = async () => {
      try {
        const installed = await isAppInstalled();
        setIsAppInstalledState(installed);
      } catch (error) {
        console.log('Error checking app installation:', error);
        setIsAppInstalledState(false);
      } finally {
        setIsCheckingInstallation(false);
      }
    };

    checkAppInstallation();
  }, []);

  const handleAppAction = () => {
    // Jika sudah terinstall, buka aplikasi
    if (isAppInstalledState) {
      openApp();
      return;
    }

    // Jika belum terinstall, install aplikasi
    handleInstallApp();
  };

  const openApp = () => {
    if (deviceType.isAndroid) {
      // Android: Coba buka aplikasi menggunakan intent atau link Play Store
      if (applicationData?.link_app) {
        // Coba gunakan intent untuk membuka aplikasi langsung
        const packageName = extractPackageName(applicationData.link_app);
        if (packageName) {
          // Intent untuk membuka aplikasi jika terinstall
          const intent = `intent://open#Intent;scheme=https;package=${packageName};end`;
          
          // Buat iframe tersembunyi untuk mencoba membuka aplikasi
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = intent;
          document.body.appendChild(iframe);
          
          // Hapus iframe setelah beberapa saat
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
          
          // Jika aplikasi tidak terbuka, arahkan ke Play Store setelah delay
          setTimeout(() => {
            // Check if page is still visible (app didn't open)
            if (!document.hidden) {
              window.open(applicationData.link_app, '_blank');
            }
          }, 1500);
        } else {
          // Jika tidak bisa extract package name, langsung buka Play Store
          window.open(applicationData.link_app, '_blank');
        }
      } else {
        showNoLinkAlert();
      }
    } else if (deviceType.isIOS) {
      // iOS: Gunakan custom URL scheme atau fallback ke PWA
      const customScheme = `ciroos://open`;
      
      // Try custom scheme first
      const testLink = document.createElement('a');
      testLink.href = customScheme;
      testLink.style.display = 'none';
      document.body.appendChild(testLink);
      testLink.click();
      document.body.removeChild(testLink);
      
      // Fallback setelah timeout
      setTimeout(() => {
        // Jika tidak bisa buka custom scheme, tampilkan guide
        if (!document.hidden) {
          showIOSInstallGuide();
        }
      }, 1500);
    }
  };

  const handleInstallApp = () => {
    // Jika Android dan ada link_app, redirect ke Play Store
    if (deviceType.isAndroid && applicationData?.link_app) {
      window.open(applicationData.link_app, '_blank');
      return;
    }

    // Jika iOS, tampilkan panduan PWA
    if (deviceType.isIOS) {
      showIOSInstallGuide();
      return;
    }

    // Jika desktop, tampilkan alert khusus
    if (deviceType.isDesktop) {
      showDesktopAlert();
      return;
    }

    // Jika tidak ada link_app, tampilkan pesan
    showNoLinkAlert();
  };

  // Helper function untuk extract package name dari Play Store URL
  const extractPackageName = (playStoreUrl) => {
    if (!playStoreUrl) return null;
    
    // Format: https://play.google.com/store/apps/details?id=com.example.app
    const match = playStoreUrl.match(/[?&]id=([^&]+)/);
    return match ? match[1] : null;
  };

  const showIOSInstallGuide = () => {
    setAlertConfig({
      title: 'Install Aplikasi pada Perangkat iOS',
      message: 'Untuk menginstall aplikasi di iPhone/iPad:\n\n1. Tap tombol Share (kotak dengan panah) di bawah\n2. Scroll dan pilih "Add to Home Screen"\n3. Tap "Add"\n4. Icon aplikasi akan muncul di home screen Anda!',
      type: 'info',
      confirmText: 'Mengerti'
    });
    setShowAlert(true);
  };

  const showDesktopAlert = () => {
    setAlertConfig({
      title: 'Install Hanya untuk Mobile',
      message: 'Aplikasi hanya tersedia untuk perangkat mobile (Android & iOS).\n\nUntuk Android: Download dari Play Store\nUntuk iOS: Gunakan "Add to Home Screen" di Safari',
      type: 'warning',
      confirmText: 'Mengerti'
    });
    setShowAlert(true);
  };

  const showNoLinkAlert = () => {
    setAlertConfig({
      title: 'Link Download Belum Tersedia',
      message: 'Link download aplikasi belum tersedia. Silakan hubungi layanan bantuan untuk informasi lebih lanjut.',
      type: 'error',
      confirmText: 'OK'
    });
    setShowAlert(true);
  };

  // Jangan tampilkan jika di aplikasi mobile
  if (isInMobileApp) {
    return null;
  }

  // Tentukan icon dan text berdasarkan status
  const getButtonConfig = () => {
    if (isCheckingInstallation) {
      return {
        icon: 'mdi:loading',
        text: 'Checking...',
        subtitle: 'Memeriksa instalasi',
        isLoading: true
      };
    }

    if (isAppInstalledState) {
      return {
        icon: 'mdi:open-in-app',
        text: 'BUKA APLIKASI',
        subtitle: `Lanjutkan di aplikasi ${applicationData?.name || 'Money Rich'}`,
        isLoading: false
      };
    }

    if (deviceType.isIOS) {
      return {
        icon: 'mdi:apple',
        text: 'INSTALL APLIKASI',
        subtitle: 'Add to Home Screen',
        isLoading: false
      };
    } else if (deviceType.isAndroid) {
      return {
        icon: 'ri:google-play-fill',
        text: 'INSTALL APLIKASI',
        subtitle: 'Google Play Store',
        isLoading: false
      };
    } else {
      return {
        icon: 'mdi:cellphone-download',
        text: 'INSTALL APLIKASI',
        subtitle: 'Khusus Mobile',
        isLoading: false
      };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <>
      <div className={`relative ${className}`}>
        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-gold/30 to-brand-emerald/30 rounded-2xl blur opacity-40"></div>
        <div className="relative bg-gradient-to-br from-brand-surface to-brand-surface-soft rounded-2xl p-5 border border-white/10 text-center shadow-[0_20px_60px_rgba(5,6,8,0.6)]">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isAppInstalledState 
                ? 'bg-brand-emerald/20 border-brand-emerald/30' 
                : 'bg-brand-gold/20 border-brand-gold/30'
            }`}>
              <Icon 
                icon={buttonConfig.icon} 
                className={`w-6 h-6 ${
                  isAppInstalledState ? 'text-brand-emerald' : 'text-brand-gold'
                } ${buttonConfig.isLoading ? 'animate-spin' : ''}`} 
              />
            </div>
            <h3 className="text-white font-bold text-base">
              {applicationData?.name || 'Money Rich'} App
            </h3>
          </div>
          
          <p className="text-white/60 text-xs mb-4">
            {isAppInstalledState 
              ? 'Aplikasi sudah terinstall, klik untuk membuka'
              : deviceType.isIOS 
                ? 'Install aplikasi untuk akses lebih cepat & mudah'
                : deviceType.isAndroid
                  ? 'Download aplikasi resmi dari Play Store'
                  : 'Aplikasi tersedia untuk perangkat mobile'
            }
          </p>
          
          <button
            onClick={handleAppAction}
            disabled={isCheckingInstallation}
            className={`inline-flex items-center gap-2 ${
              isAppInstalledState
                ? 'bg-gradient-to-r from-brand-emerald to-teal-600 hover:from-teal-600 hover:to-brand-emerald text-white'
                : 'bg-gradient-to-r from-brand-gold to-brand-gold-deep hover:from-brand-gold-deep hover:to-brand-gold text-brand-black'
            } hover:scale-[1.02] active:scale-[0.98] font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg ${
              isAppInstalledState ? 'shadow-brand-emerald/30' : 'shadow-brand-gold/30'
            } ${
              isCheckingInstallation ? 'opacity-50 cursor-not-allowed' : ''
            } w-full`}
          >
            <Icon icon={buttonConfig.icon} className={`w-5 h-5 ${buttonConfig.isLoading ? 'animate-spin' : ''}`} />
            <span className="flex-1">{buttonConfig.text}</span>
          </button>

          <p className="text-white/40 text-[10px] mt-3 flex items-center justify-center gap-1">
            <Icon icon="mdi:information-outline" className="w-3 h-3" />
            {buttonConfig.subtitle}
          </p>

          {/* Additional info for Android users */}
          {deviceType.isAndroid && !isAppInstalledState && (
            <div className="mt-4 p-3 bg-brand-black/40 rounded-lg border border-white/10">
              <p className="text-white/50 text-[10px] leading-relaxed">
                <Icon icon="mdi:shield-check" className="w-3 h-3 inline mr-1 text-brand-emerald" />
                Aplikasi resmi & aman dari Google Play Store
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Custom Alert */}
      <CustomAlert
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        {...alertConfig}
      />
    </>
  );
}