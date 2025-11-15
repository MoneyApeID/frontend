import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import Copyright from '../components/copyright';

export default function Error500() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const [isRetrying, setIsRetrying] = useState(false);
  const [applicationData, setApplicationData] = useState(null);

  useEffect(() => {
    const storedApplication = localStorage.getItem('application');
    if (storedApplication) {
      try {
        const parsed = JSON.parse(storedApplication);
        setApplicationData({
          name: parsed.name || 'Money Rich',
          healthy: parsed.healthy || false,
          company: parsed.company || 'Money Rich Holdings',
        });
      } catch (e) {
        setApplicationData({ name: 'Money Rich', healthy: false, company: 'Money Rich Holdings' });
      }
    } else {
      setApplicationData({ name: 'Money Rich', healthy: false, company: 'Money Rich Holdings' });
    }
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRetry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      router.reload();
    }, 500);
  };

  const goHome = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-4 relative overflow-hidden text-white">
      <Head>
        <title>{applicationData?.name || 'Money Rich'} | 500 - Server Error</title>
        <meta name="description" content={`${applicationData?.name || 'Money Rich'} 500 - Server Error`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Background elements - Money Rich style */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.18),rgba(5,6,8,0.95))]"></div>
        <div className="absolute -top-40 -left-32 w-[420px] h-[420px] rounded-full bg-red-500/15 blur-[180px] opacity-70"></div>
        <div className="absolute bottom-20 right-[-140px] w-[520px] h-[520px] rounded-full bg-orange-500/12 blur-[220px] opacity-80"></div>
        <div className="absolute bottom-[-120px] left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full bg-brand-gold/10 blur-[200px] opacity-70"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logo.svg"
            alt="Money Rich Logo"
            width={80}
            height={80}
            className="object-contain"
            unoptimized
          />
        </div>

        {/* Icon Container */}
        <div className="relative mb-8">
          <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="relative w-32 h-32 mx-auto bg-brand-surface-soft/90 backdrop-blur-xl rounded-full border border-white/10 flex items-center justify-center shadow-[0_20px_60px_rgba(5,6,8,0.55)]">
            <Icon icon="mdi:server-off" className="w-16 h-16 text-red-400" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black text-transparent bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text mb-4">
            500
          </h1>
          <h2 className="text-2xl font-bold text-white mb-3">Server Error</h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Maaf, server kami sedang mengalami masalah teknis. 
            Tim kami sedang bekerja untuk memperbaikinya.
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-brand-surface-soft/90 backdrop-blur-xl rounded-2xl p-5 border border-white/10 mb-6 shadow-[0_20px_60px_rgba(5,6,8,0.55)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-white/70 text-sm">Status Server</span>
            </div>
            <span className="text-red-400 text-sm font-semibold">Maintenance</span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:clock-outline" className="w-4 h-4 text-white/60" />
              <span className="text-white/70 text-sm">Auto Retry</span>
            </div>
            <span className="text-brand-gold font-mono text-sm font-bold">{countdown}s</span>
          </div>

          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-brand-gold to-brand-gold-deep transition-all duration-1000"
              style={{ width: `${((10 - countdown) / 10) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className={`flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all duration-300 ${
              isRetrying
                ? 'bg-brand-surface border border-white/10 text-white/40 cursor-not-allowed'
                : 'bg-gradient-to-r from-brand-gold to-brand-gold-deep hover:from-brand-gold-deep hover:to-brand-gold text-brand-black shadow-lg shadow-brand-gold/30 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <Icon 
              icon={isRetrying ? "mdi:loading" : "mdi:refresh"} 
              className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} 
            />
            {isRetrying ? 'Mencoba...' : 'Coba Lagi'}
          </button>

          <button
            onClick={goHome}
            className="flex items-center justify-center gap-2 bg-brand-surface border border-white/10 hover:bg-brand-surface-soft text-white py-4 rounded-xl font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Icon icon="mdi:home" className="w-5 h-5" />
            Beranda
          </button>
        </div>

        {/* Tips */}
        <div className="bg-brand-surface-soft/90 backdrop-blur-xl rounded-2xl p-4 border border-white/10 mb-6 shadow-[0_20px_60px_rgba(5,6,8,0.55)]">
          <div className="flex items-center gap-2 mb-3">
            <Icon icon="mdi:information" className="w-4 h-4 text-brand-gold" />
            <h3 className="text-white text-sm font-semibold">Yang Bisa Dilakukan:</h3>
          </div>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-white/60 text-xs">
              <Icon icon="mdi:check" className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
              <span>Tunggu beberapa saat dan coba lagi</span>
            </li>
            <li className="flex items-start gap-2 text-white/60 text-xs">
              <Icon icon="mdi:check" className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
              <span>Periksa koneksi internet Anda</span>
            </li>
            <li className="flex items-start gap-2 text-white/60 text-xs">
              <Icon icon="mdi:check" className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
              <span>Hubungi customer service jika masalah berlanjut</span>
            </li>
          </ul>
        </div>

        {/* Support Info */}
        <div className="text-center">
          <p className="text-white/40 text-xs mb-2">Butuh bantuan?</p>
          <button
            onClick={() => {
              const appData = JSON.parse(localStorage.getItem('application') || '{}');
              if (appData?.link_cs) {
                window.open(appData.link_cs, '_blank');
              }
            }}
            className="inline-flex items-center gap-2 text-brand-gold hover:text-brand-gold-deep text-sm font-semibold transition-colors"
          >
            <Icon icon="mdi:telegram" className="w-5 h-5" />
            Hubungi Customer Service
          </button>
        </div>

        {/* Copyright */}
        <Copyright />
      </div>
    </div>
  );
}
