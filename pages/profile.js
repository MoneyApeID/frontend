import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import BottomNavbar from '../components/BottomNavbar';
import AppInstallButton from '../components/AppInstallButton';
import MobileAppStatus from '../components/MobileAppStatus';
import AndroidAppLinksTester from '../components/AndroidAppLinksTester';
import { logoutUser } from '../utils/api';
import { isMobileApp } from '../utils/mobileAppDetection';
import Image from 'next/image';
import Copyright from '../components/copyright';

export default function Profile() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [applicationData, setApplicationData] = useState({ link_app: '', link_cs: '', link_group: '' });
  const [loading, setLoading] = useState(true);
  
  // App Install States
  const [isInMobileApp, setIsInMobileApp] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    const accessExpire = sessionStorage.getItem('access_expire');
    if (!token || !accessExpire) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.name) {
      setUserData({
        name: "Tester",
        number: "882646678601",
        balance: 0,
	level: 0,
        total_deposit: 0,
        total_withdraw: 0,
        active: false
      });
    } else {
      setUserData(user);
    }

    let appData = {
      name: 'Money Rich',
      healthy: false,
      link_app: '',
      link_cs: '',
      link_group: '',
      company: 'Money Rich Holdings'
    };
    try {
      const rawApp = localStorage.getItem('application');
      if (rawApp) {
        const parsedApp = JSON.parse(rawApp);
        appData = {
          name: parsedApp.name || 'Money Rich',
          healthy: parsedApp.healthy ?? false,
          link_app: parsedApp.link_app || parsedApp.link_app_url || '',
          link_cs: parsedApp.link_cs || parsedApp.link_cs_url || '',
          link_group: parsedApp.link_group || parsedApp.link_group_url || '',
          company: parsedApp.company || parsedApp.name || 'Money Rich Holdings'
        };
      } else {
        appData.link_app = localStorage.getItem('link_app') || '';
        appData.link_cs = localStorage.getItem('link_cs') || '';
        appData.link_group = localStorage.getItem('link_group') || '';
      }
    } catch (e) {
      appData.link_app = localStorage.getItem('link_app') || '';
      appData.link_cs = localStorage.getItem('link_cs') || '';
      appData.link_group = localStorage.getItem('link_group') || '';
    }
    setApplicationData(appData);
    setLoading(false);

    // Detect if running in mobile app (TWA/WebView)
    setIsInMobileApp(isMobileApp());
  }, [router]);

  const handleLogout = () => {
    try {
      logoutUser().catch(() => {});
    } catch (e) {}

    sessionStorage.removeItem('token');
    sessionStorage.removeItem('access_expire');
    localStorage.removeItem('user');
    localStorage.removeItem('application');
    if (typeof document !== 'undefined') {
      document.cookie = 'refresh_token=; Max-Age=0; path=/;';
    }
    router.push('/login');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  const isVerified = userData?.active === true;

  const getVIPConfig = (level) => {
    const configs = {
      0: { icon: 'mdi:shield-account', gradient: 'from-brand-surface-soft to-brand-charcoal' },
      1: { icon: 'mdi:star-circle', gradient: 'from-brand-gold to-brand-gold-deep' },
      2: { icon: 'mdi:medal', gradient: 'from-amber-400 to-amber-600' },
      3: { icon: 'mdi:trophy-variant', gradient: 'from-amber-500 to-orange-500' },
      4: { icon: 'mdi:diamond-stone', gradient: 'from-brand-emerald to-teal-500' },
      5: { icon: 'mdi:crown-circle', gradient: 'from-brand-gold to-amber-300' }
    };
    return configs[level] || configs[0];
  };

  const vipConfig = getVIPConfig(userData?.level || 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.18),rgba(5,6,8,0.95))]"></div>
        </div>

        <div className="flex flex-col items-center relative z-10">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-3 border-brand-gold/20 border-t-brand-gold"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-brand-gold/40"></div>
          </div>
          <p className="text-white/70 text-sm mt-4">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black pb-32 relative overflow-hidden">
      <Head>
        <title>{applicationData?.name || 'Money Rich'} | Profile</title>
        <meta name="description" content={`${applicationData?.name || 'Money Rich'} Profile`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Background elements - matching referral/dashboard style */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.18),rgba(5,6,8,0.95))]"></div>
        <div className="absolute -top-40 -left-32 w-[420px] h-[420px] rounded-full bg-brand-gold/20 blur-[180px] opacity-70"></div>
        <div className="absolute bottom-20 right-[-140px] w-[520px] h-[520px] rounded-full bg-brand-gold-deep/15 blur-[220px] opacity-80"></div>
        <div className="absolute bottom-[-120px] left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full bg-brand-emerald/12 blur-[200px] opacity-70"></div>
      </div>

      <div className="max-w-md mx-auto relative z-10">
        {/* Hero Profile Section - New Design */}
        <div className="relative pt-8 pb-6 px-4">
          <div className="relative overflow-hidden rounded-b-[3rem] border-b border-brand-gold/30 bg-gradient-to-b from-brand-surface via-brand-surface-soft to-brand-charcoal shadow-[0_25px_70px_rgba(5,6,8,0.75)]">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-brand-gold/15 blur-3xl"></div>
              <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-brand-emerald/10 blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-gold-deep/8 blur-3xl"></div>
            </div>

            <div className="relative z-10 px-6 py-8">
              {/* Profile Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-br from-brand-gold to-brand-gold-deep rounded-3xl blur-lg opacity-50"></div>
                    <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-gold to-brand-gold-deep flex items-center justify-center shadow-xl shadow-brand-gold/50 border-4 border-brand-black">
                      <Icon icon="mdi:account-circle" className="text-brand-black w-14 h-14" />
                    </div>
                    {isVerified && (
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand-gold border-4 border-brand-black flex items-center justify-center">
                        <Icon icon="mdi:check" className="text-brand-black w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl font-black text-white truncate">{userData?.name || 'Tester'}</h1>
                      <button 
                        onClick={() => router.push('/vip')}
                        className={`flex-shrink-0 flex items-center gap-1.5 bg-gradient-to-r ${vipConfig.gradient} px-3 py-1.5 rounded-lg border border-white/20 shadow-lg`}
                      >
                        <Icon icon={vipConfig.icon} className="w-4 h-4 text-white" />
                        <span className="text-white text-xs font-black">VIP {userData?.level || 0}</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
                      <Icon icon="mdi:phone" className="w-4 h-4 text-brand-gold" />
                      <span className="truncate">+62{userData?.number || '882646678601'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                        isVerified 
                          ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isVerified ? 'bg-brand-gold' : 'bg-red-400'} ${isVerified ? 'animate-pulse' : ''}`}></div>
                        {isVerified ? 'Verified Investor' : 'Unverified'}
                </div>
                  </div>
                  </div>
                </div>
              </div>
              
              {/* Balance Cards - Horizontal Layout */}
              <div className="space-y-3 mb-6">
                {/* Balance Card */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-gold to-brand-gold-deep rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-brand-black/80 via-brand-charcoal/90 to-brand-black/80 backdrop-blur-xl rounded-2xl p-5 border border-brand-gold/30 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-gold/30 to-brand-gold-deep/30 border border-brand-gold/40 flex items-center justify-center">
                          <Icon icon="mdi:wallet" className="w-7 h-7 text-brand-gold" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white/50 text-xs font-semibold mb-1 uppercase tracking-wider">Balance</p>
                          <p className="text-2xl font-black text-brand-gold mb-1">
                            {formatCurrency(userData?.balance || 0)}
                          </p>
                          <p className="text-white/40 text-[10px]">Untuk investasi produk</p>
                  </div>
                </div>
                      <button
                        onClick={() => router.push('/deposit')}
                        className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-gold/20 hover:bg-brand-gold/30 border border-brand-gold/40 flex items-center justify-center transition-all hover:scale-110"
                      >
                        <Icon icon="mdi:plus" className="w-5 h-5 text-brand-gold" />
              </button>
            </div>
          </div>
        </div>

                {/* Income Card */}
          <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-emerald to-teal-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-brand-black/80 via-brand-charcoal/90 to-brand-black/80 backdrop-blur-xl rounded-2xl p-5 border border-brand-emerald/30 overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-emerald/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-emerald/30 to-teal-500/30 border border-brand-emerald/40 flex items-center justify-center">
                          <Icon icon="mdi:trending-up" className="w-7 h-7 text-brand-emerald" />
                </div>
                        <div className="flex-1">
                          <p className="text-white/50 text-xs font-semibold mb-1 uppercase tracking-wider">Income</p>
                          <p className="text-2xl font-black text-brand-emerald mb-1">
                            {formatCurrency(userData?.income || 0)}
                          </p>
                          <p className="text-white/40 text-[10px]">Dapat ditarik kapan saja</p>
            </div>
          </div>
                      <button
                        onClick={() => router.push('/withdraw')}
                        className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-emerald/20 hover:bg-brand-emerald/30 border border-brand-emerald/40 flex items-center justify-center transition-all hover:scale-110"
                      >
                        <Icon icon="mdi:arrow-up" className="w-5 h-5 text-brand-emerald" />
                      </button>
                </div>
              </div>
            </div>
          </div>
          
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-brand-black/40 backdrop-blur-sm rounded-xl p-3 border border-white/5 text-center">
                  <Icon icon="mdi:chart-line" className="w-5 h-5 text-brand-gold mx-auto mb-1" />
                  <p className="text-white/40 text-[10px] mb-0.5">Portofolio</p>
                  <button
                    onClick={() => router.push('/portofolio')}
                    className="text-brand-gold text-xs font-bold hover:underline"
                  >
                    Lihat
                  </button>
                </div>
                <div className="bg-brand-black/40 backdrop-blur-sm rounded-xl p-3 border border-white/5 text-center">
                  <Icon icon="mdi:bank" className="w-5 h-5 text-brand-emerald mx-auto mb-1" />
                  <p className="text-white/40 text-[10px] mb-0.5">Bank</p>
                  <button
                    onClick={() => router.push('/bank')}
                    className="text-brand-emerald text-xs font-bold hover:underline"
                  >
                    Kelola
                  </button>
                </div>
                <div className="bg-brand-black/40 backdrop-blur-sm rounded-xl p-3 border border-white/5 text-center">
                  <Icon icon="mdi:calendar-star" className="w-5 h-5 text-brand-gold mx-auto mb-1" />
                  <p className="text-white/40 text-[10px] mb-0.5">Member</p>
                  <p className="text-brand-gold text-xs font-bold">{new Date().getFullYear()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="px-4 mb-6">
          <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => router.push('/dashboard')}
              className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-brand-gold to-brand-gold-deep p-5 border border-brand-gold/40 shadow-xl shadow-brand-gold/30 hover:shadow-brand-gold/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-brand-black/30 flex items-center justify-center border border-brand-black/20">
                  <Icon icon="mdi:rocket-launch" className="w-6 h-6 text-brand-black" />
                </div>
                <span className="text-brand-black font-black text-sm">Investasi</span>
                <span className="text-brand-black/70 text-[10px] font-semibold">Beli Produk</span>
              </div>
          </button>
          
          <button 
            onClick={() => router.push('/withdraw')}
              className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-brand-emerald to-teal-500 p-5 border border-brand-emerald/40 shadow-xl shadow-brand-emerald/30 hover:shadow-brand-emerald/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center border border-white/30">
                  <Icon icon="mdi:cash-refund" className="w-6 h-6 text-white" />
                </div>
                <span className="text-white font-black text-sm">Withdraw</span>
                <span className="text-white/80 text-[10px] font-semibold">Tarik Dana</span>
              </div>
          </button>
        </div>
        </div>

        {/* App Install/Status Section */}
        <div className="px-4 mb-6">
          <AppInstallButton applicationData={applicationData} className="mb-4" />
          <MobileAppStatus applicationData={applicationData} />
        </div>

        {/* Menu Sections with Categories */}
        <div className="px-4 space-y-6 mb-6">
          {/* Transactions Section */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-1 h-5 bg-gradient-to-b from-brand-gold to-brand-gold-deep rounded-full"></div>
              <h3 className="text-white font-black text-sm uppercase tracking-wider">Transaksi & Riwayat</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
          <button 
                onClick={() => router.push('/history/deposits')}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-surface to-brand-surface-soft p-4 border border-brand-gold/20 hover:border-brand-gold/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-brand-gold/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-brand-gold/20 flex items-center justify-center mb-3 border border-brand-gold/30">
                    <Icon icon="mdi:wallet-plus" className="w-5 h-5 text-brand-gold" />
            </div>
                  <p className="text-white font-bold text-sm mb-1">Riwayat</p>
                  <p className="text-white/50 text-xs">Deposit</p>
            </div>
          </button>
          
          <button 
            onClick={() => router.push('/history/withdraw')}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-surface to-brand-surface-soft p-4 border border-brand-emerald/20 hover:border-brand-emerald/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-brand-emerald/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-brand-emerald/20 flex items-center justify-center mb-3 border border-brand-emerald/30">
                    <Icon icon="mdi:cash-fast" className="w-5 h-5 text-brand-emerald" />
            </div>
                  <p className="text-white font-bold text-sm mb-1">Riwayat</p>
                  <p className="text-white/50 text-xs">Penarikan</p>
            </div>
          </button>

          <button 
            onClick={() => router.push('/transactions')}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-surface to-brand-surface-soft p-4 border border-white/10 hover:border-brand-gold/30 transition-all hover:scale-[1.02] active:scale-[0.98] col-span-2"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-brand-gold/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-gold/20 flex items-center justify-center border border-brand-gold/30">
                    <Icon icon="mdi:swap-horizontal-variant" className="w-5 h-5 text-brand-gold" />
            </div>
            <div className="flex-1 text-left">
                    <p className="text-white font-bold text-sm mb-0.5">Semua Transaksi</p>
                    <p className="text-white/50 text-xs">Lihat riwayat lengkap transaksi Anda</p>
                  </div>
                  <Icon icon="mdi:chevron-right" className="w-5 h-5 text-white/40" />
            </div>
          </button>
            </div>
          </div>

          {/* Settings & Support Section */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-1 h-5 bg-gradient-to-b from-brand-emerald to-teal-500 rounded-full"></div>
              <h3 className="text-white font-black text-sm uppercase tracking-wider">Pengaturan & Bantuan</h3>
            </div>
            <div className="space-y-2">
              <button 
                onClick={() => router.push('/password')}
                className="group w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-brand-surface to-brand-surface-soft border border-white/10 hover:border-brand-gold/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-gold/20 flex items-center justify-center border border-brand-gold/30 group-hover:bg-brand-gold/30 transition-colors">
                  <Icon icon="mdi:lock-reset" className="w-5 h-5 text-brand-gold" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white font-bold text-sm">Ganti Kata Sandi</p>
                  <p className="text-white/50 text-xs">Ubah password akun Anda</p>
                </div>
                <Icon icon="mdi:chevron-right" className="w-5 h-5 text-white/40" />
          </button>
          
          {applicationData.link_cs ? (
            <a
              href={applicationData.link_cs}
              target="_blank"
              rel="noopener noreferrer"
                  className="group w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-brand-surface to-brand-surface-soft border border-white/10 hover:border-brand-emerald/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
                  <div className="w-11 h-11 rounded-xl bg-brand-emerald/20 flex items-center justify-center border border-brand-emerald/30 group-hover:bg-brand-emerald/30 transition-colors">
                    <Icon icon="mdi:help-circle-outline" className="w-5 h-5 text-brand-emerald" />
              </div>
              <div className="flex-1 text-left">
                    <p className="text-white font-bold text-sm">Bantuan Pengguna</p>
                    <p className="text-white/50 text-xs">Dapatkan bantuan dari tim support</p>
              </div>
                  <Icon icon="mdi:chevron-right" className="w-5 h-5 text-white/40" />
            </a>
          ) : (
                <button disabled className="w-full flex items-center gap-3 p-4 rounded-xl bg-brand-surface/50 border border-white/10 opacity-50 cursor-not-allowed">
                  <div className="w-11 h-11 rounded-xl bg-brand-emerald/10 flex items-center justify-center border border-brand-emerald/20">
                    <Icon icon="mdi:help-circle-outline" className="w-5 h-5 text-brand-emerald/40" />
              </div>
              <div className="flex-1 text-left">
                    <p className="text-white/40 font-bold text-sm">Bantuan Pengguna</p>
                    <p className="text-white/30 text-xs">Tidak tersedia</p>
              </div>
            </button>
          )}

              {applicationData.link_group && (
            <a
              href={applicationData.link_group}
              target="_blank"
              rel="noopener noreferrer"
                  className="group w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-brand-surface to-brand-surface-soft border border-white/10 hover:border-cyan-500/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
                  <div className="w-11 h-11 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 group-hover:bg-cyan-500/30 transition-colors">
                <Icon icon="mdi:telegram" className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1 text-left">
                    <p className="text-white font-bold text-sm">Saluran Telegram</p>
                    <p className="text-white/50 text-xs">Bergabung dengan komunitas</p>
              </div>
                  <Icon icon="mdi:chevron-right" className="w-5 h-5 text-white/40" />
                </a>
          )}

          {userData?.level !== 0 && (
            <a
              href="https://t.me/+fwFbZTLbjdcyM2Y1"
              target="_blank"
              rel="noopener noreferrer"
                  className="group w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-brand-surface to-brand-surface-soft border border-white/10 hover:border-cyan-500/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
                  <div className="w-11 h-11 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 group-hover:bg-cyan-500/30 transition-colors">
                <Icon icon="mdi:telegram" className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1 text-left">
                    <p className="text-white font-bold text-sm">Diskusi Telegram</p>
                    <p className="text-white/50 text-xs">Komunitas investor VIP</p>
              </div>
                  <Icon icon="mdi:chevron-right" className="w-5 h-5 text-white/40" />
            </a>
          )}
            </div>
            </div>

          {/* Legal & Information Section */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-1 h-5 bg-gradient-to-b from-brand-gold to-brand-emerald rounded-full"></div>
              <h3 className="text-white font-black text-sm uppercase tracking-wider">Informasi & Legal</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => router.push('/terms-and-conditions')}
                className="group p-3 rounded-xl bg-gradient-to-br from-brand-surface to-brand-surface-soft border border-white/10 hover:border-brand-emerald/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
                <div className="w-9 h-9 rounded-lg bg-brand-emerald/20 flex items-center justify-center mb-2 border border-brand-emerald/30 mx-auto">
                  <Icon icon="mdi:file-document-outline" className="w-5 h-5 text-brand-emerald" />
            </div>
                <p className="text-white font-semibold text-xs text-center">Syarat & Ketentuan</p>
          </button>
          
          <button 
            onClick={() => router.push('/privacy-policy')}
                className="group p-3 rounded-xl bg-gradient-to-br from-brand-surface to-brand-surface-soft border border-white/10 hover:border-brand-gold/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
                <div className="w-9 h-9 rounded-lg bg-brand-gold/20 flex items-center justify-center mb-2 border border-brand-gold/30 mx-auto">
                  <Icon icon="mdi:shield-check-outline" className="w-5 h-5 text-brand-gold" />
            </div>
                <p className="text-white font-semibold text-xs text-center">Kebijakan Privasi</p>
          </button>
          
          <button 
            onClick={() => router.push('/about-us')}
                className="group p-3 rounded-xl bg-gradient-to-br from-brand-surface to-brand-surface-soft border border-white/10 hover:border-brand-emerald/30 transition-all hover:scale-[1.02] active:scale-[0.98] col-span-2"
          >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-emerald/20 flex items-center justify-center border border-brand-emerald/30">
                    <Icon icon="mdi:information-outline" className="w-5 h-5 text-brand-emerald" />
            </div>
            <div className="flex-1 text-left">
                    <p className="text-white font-bold text-sm">Tentang Kami</p>
                    <p className="text-white/50 text-xs">Tentang perusahaan kami</p>
                  </div>
                  <Icon icon="mdi:chevron-right" className="w-5 h-5 text-white/40" />
            </div>
          </button>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="px-4 mb-6">
        <button
          onClick={handleLogout}
            className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500/10 via-red-600/10 to-red-500/10 p-5 border border-red-500/30 hover:border-red-500/50 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex items-center justify-center gap-3">
              <Icon icon="mdi:logout" className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-black text-sm">Keluar dari Akun</span>
            </div>
        </button>
        </div>

        {/* Copyright */}
        <div className="px-4 pb-6">
          <Copyright />
        </div>
      </div>

      {/* Bottom Navigation - Floating */}
          <BottomNavbar />

      <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideUp {
            from { transform: translateY(40px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          
          .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
          .animate-slideUp { animation: slideUp 0.5s ease-out; }
          .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
      
      {/* Android App Links Tester - Development Only */}
      <AndroidAppLinksTester />
    </div>
  );
}
