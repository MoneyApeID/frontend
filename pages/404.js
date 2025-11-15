import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import Copyright from '../components/copyright';

export default function Error404() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(8);
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
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const goHome = () => {
    router.push('/dashboard');
  };

  const goBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-4 relative overflow-hidden text-white">
      <Head>
        <title>{applicationData?.name || 'Money Rich'} | 404 - Halaman Tidak Ditemukan</title>
        <meta name="description" content={`${applicationData?.name || 'Money Rich'} 404 - Halaman Tidak Ditemukan`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Background elements - Money Rich style */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.18),rgba(5,6,8,0.95))]"></div>
        <div className="absolute -top-40 -left-32 w-[420px] h-[420px] rounded-full bg-brand-gold/20 blur-[180px] opacity-70"></div>
        <div className="absolute bottom-20 right-[-140px] w-[520px] h-[520px] rounded-full bg-brand-gold-deep/15 blur-[220px] opacity-80"></div>
        <div className="absolute bottom-[-120px] left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full bg-brand-emerald/12 blur-[200px] opacity-70"></div>
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

        {/* Floating 404 */}
        <div className="relative mb-8">
          <div className="absolute -inset-8 bg-gradient-to-r from-brand-gold/20 to-brand-emerald/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="relative text-center">
            <h1 className="text-[120px] font-black text-transparent bg-gradient-to-r from-brand-gold to-brand-emerald bg-clip-text leading-none mb-2">
              404
            </h1>
            <div className="flex items-center justify-center gap-2">
              <Icon icon="mdi:map-marker-question" className="w-6 h-6 text-brand-gold" />
              <p className="text-white/60 text-sm">Halaman Tidak Ditemukan</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-white mb-3">Oops! Anda Tersesat</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-4">
            Halaman yang Anda cari mungkin telah dipindahkan, dihapus, 
            atau tidak pernah ada.
          </p>
          
          {/* Auto Redirect Notice */}
          <div className="inline-flex items-center gap-2 bg-brand-surface border border-brand-gold/30 rounded-xl px-4 py-2">
            <Icon icon="mdi:information" className="w-4 h-4 text-brand-gold" />
            <span className="text-white/70 text-xs">
              Redirect otomatis dalam <span className="text-brand-gold font-mono font-bold">{countdown}s</span>
            </span>
          </div>
        </div>

        {/* Search Box */}
        <div className="bg-brand-surface-soft/90 backdrop-blur-xl rounded-2xl p-4 border border-white/10 mb-6 shadow-[0_20px_60px_rgba(5,6,8,0.55)]">
          <div className="flex items-center gap-2 mb-3">
            <Icon icon="mdi:magnify" className="w-5 h-5 text-brand-gold" />
            <h3 className="text-white text-sm font-semibold">Mungkin Anda Mencari:</h3>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 p-3 rounded-xl transition-all duration-300 group border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-gold/20 rounded-lg flex items-center justify-center border border-brand-gold/30">
                  <Icon icon="mdi:view-dashboard" className="w-4 h-4 text-brand-gold" />
                </div>
                <span className="text-white text-sm">Dashboard</span>
              </div>
              <Icon icon="mdi:chevron-right" className="w-5 h-5 text-white/40 group-hover:text-brand-gold transition-colors" />
            </button>

            <button
              onClick={() => router.push('/profile')}
              className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 p-3 rounded-xl transition-all duration-300 group border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-emerald/20 rounded-lg flex items-center justify-center border border-brand-emerald/30">
                  <Icon icon="mdi:account" className="w-4 h-4 text-brand-emerald" />
                </div>
                <span className="text-white text-sm">Profile</span>
              </div>
              <Icon icon="mdi:chevron-right" className="w-5 h-5 text-white/40 group-hover:text-brand-emerald transition-colors" />
            </button>

            <button
              onClick={() => router.push('/portofolio')}
              className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 p-3 rounded-xl transition-all duration-300 group border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-gold/20 rounded-lg flex items-center justify-center border border-brand-gold/30">
                  <Icon icon="mdi:chart-line" className="w-4 h-4 text-brand-gold" />
                </div>
                <span className="text-white text-sm">Portofolio</span>
              </div>
              <Icon icon="mdi:chevron-right" className="w-5 h-5 text-white/40 group-hover:text-brand-gold transition-colors" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={goBack}
            className="flex items-center justify-center gap-2 bg-brand-surface border border-white/10 hover:bg-brand-surface-soft text-white py-4 rounded-xl font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Icon icon="mdi:arrow-left" className="w-5 h-5" />
            Kembali
          </button>

          <button
            onClick={goHome}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-gold to-brand-gold-deep hover:from-brand-gold-deep hover:to-brand-gold text-brand-black py-4 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-brand-gold/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Icon icon="mdi:home" className="w-5 h-5" />
            Beranda
          </button>
        </div>

        {/* Help Card */}
        <div className="bg-brand-surface-soft/90 backdrop-blur-xl rounded-2xl p-4 border border-white/10 text-center shadow-[0_20px_60px_rgba(5,6,8,0.55)]">
          <Icon icon="mdi:lifebuoy" className="w-8 h-8 text-brand-gold mx-auto mb-3" />
          <p className="text-white/60 text-xs mb-3">Masih butuh bantuan?</p>
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
