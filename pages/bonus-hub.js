// pages/bonus-hub.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import BottomNavbar from '../components/BottomNavbar';
import Copyright from '../components/copyright';

export default function BonusHub() {
  const router = useRouter();
  const [applicationData, setApplicationData] = useState(null);
  const [userData, setUserData] = useState({
    spin_ticket: 0,
    balance: 0,
    income: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    const accessExpire = sessionStorage.getItem('access_expire');
    if (!token || !accessExpire) {
      router.push('/login');
      return;
    }
    
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserData({
          spin_ticket: user.spin_ticket || 0,
          balance: user.balance || 0,
          income: user.income || 0,
        });
      }
    } catch {}

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
  }, [router]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  return (
    <div className="min-h-screen bg-brand-black text-white relative overflow-hidden pb-32">
      <Head>
        <title>{applicationData?.name || 'Money Rich'} | Bonus Hub</title>
        <meta name="description" content={`${applicationData?.name || 'Money Rich'} Bonus Hub`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.18),rgba(5,6,8,0.95))]"></div>
        <div className="absolute -top-32 -left-24 w-[360px] h-[360px] bg-brand-gold/18 blur-[160px] rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-[460px] h-[460px] bg-brand-gold-deep/12 blur-[220px] rounded-full"></div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-brand-emerald/12 blur-[200px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-8 pb-24">
        {/* Hero Header Section */}
        <div className="mb-10 flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-brand-gold w-fit">
            <Icon icon="mdi:star-circle" className="w-4 h-4" />
            Bonus Hub
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">Bonus Hub</h1>
            <p className="text-sm text-white/60 max-w-2xl mt-2">
              Pilih cara favorit Anda untuk mendapatkan bonus dan hadiah spesial.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="relative overflow-hidden rounded-3xl border border-brand-gold/25 bg-gradient-to-br from-brand-gold/12 via-brand-surface to-brand-surface-soft p-5 shadow-[0_18px_45px_rgba(5,6,8,0.45)]">
            <div className="absolute -top-16 -right-12 w-40 h-40 rounded-full bg-brand-gold/35 blur-3xl opacity-70"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center">
                  <Icon icon="mdi:ticket" className="text-brand-gold w-5 h-5" />
                </div>
                <p className="text-xs uppercase tracking-[0.35em] text-brand-gold/80 font-semibold">Kredit Spin</p>
              </div>
              <p className="text-3xl font-black text-white">{userData.spin_ticket}</p>
              <p className="text-[11px] text-white/55 mt-2">Kredit tersedia</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-brand-emerald/25 bg-gradient-to-br from-brand-surface via-brand-charcoal to-brand-surface-soft p-5 shadow-[0_18px_45px_rgba(5,6,8,0.45)]">
            <div className="absolute -bottom-16 -left-20 w-44 h-44 rounded-full bg-brand-emerald/30 blur-3xl opacity-60"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-emerald/20 border border-brand-emerald/30 flex items-center justify-center">
                  <Icon icon="mdi:wallet" className="text-brand-emerald w-5 h-5" />
                </div>
                <p className="text-xs uppercase tracking-[0.35em] text-brand-emerald/80 font-semibold">Saldo</p>
              </div>
              <p className="text-3xl font-black text-brand-emerald">Rp {formatCurrency(userData.income)}</p>
              <p className="text-[11px] text-white/55 mt-2">Saldo Anda</p>
            </div>
          </div>
        </div>

        {/* Bonus Options */}
        <div className="grid sm:grid-cols-3 gap-6">
          {/* Spin Wheel Card */}
          <button
            onClick={() => router.push('/bonus-hub/spin-wheel')}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface-soft/90 p-8 shadow-[0_20px_60px_rgba(5,6,8,0.6)] hover:shadow-[0_25px_70px_rgba(232,193,82,0.2)] transition-all duration-300 hover:scale-[1.02] hover:border-brand-gold/30"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.08),transparent)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-gold to-brand-gold-deep flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Icon icon="mdi:dharmachakra" className="text-brand-black w-8 h-8" />
              </div>
              <h3 className="text-white font-black text-xl text-center mb-2">Spin Wheel</h3>
              <p className="text-white/60 text-sm text-center mb-4">
                Putar roda keberuntungan dan dapatkan hadiah spesial
              </p>
              <div className="flex items-center justify-center gap-2 text-brand-gold text-sm font-bold">
                <span>Putar Sekarang</span>
                <Icon icon="mdi:arrow-right" className="w-5 h-5" />
              </div>
            </div>
          </button>

          {/* Task Card */}
          <button
            onClick={() => router.push('/bonus-hub/task')}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface-soft/90 p-8 shadow-[0_20px_60px_rgba(5,6,8,0.6)] hover:shadow-[0_25px_70px_rgba(232,193,82,0.2)] transition-all duration-300 hover:scale-[1.02] hover:border-brand-gold/30"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.08),transparent)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-emerald to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Icon icon="mdi:gift" className="text-white w-8 h-8" />
              </div>
              <h3 className="text-white font-black text-xl text-center mb-2">Tugas Bonus</h3>
              <p className="text-white/60 text-sm text-center mb-4">
                Selesaikan tugas dan klaim hadiah eksklusif
              </p>
              <div className="flex items-center justify-center gap-2 text-brand-emerald text-sm font-bold">
                <span>Lihat Tugas</span>
                <Icon icon="mdi:arrow-right" className="w-5 h-5" />
              </div>
            </div>
          </button>

          {/* Binary Tree Card */}
          <button
            onClick={() => router.push('/bonus-hub/binary')}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface-soft/90 p-8 shadow-[0_20px_60px_rgba(5,6,8,0.6)] hover:shadow-[0_25px_70px_rgba(232,193,82,0.2)] transition-all duration-300 hover:scale-[1.02] hover:border-brand-gold/30"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.08),transparent)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Icon icon="mdi:sitemap" className="text-white w-8 h-8" />
              </div>
              <h3 className="text-white font-black text-xl text-center mb-2">Binary Tree</h3>
              <p className="text-white/60 text-sm text-center mb-4">
                Lihat struktur binary dan klaim rewards
              </p>
              <div className="flex items-center justify-center gap-2 text-purple-400 text-sm font-bold">
                <span>Lihat Binary</span>
                <Icon icon="mdi:arrow-right" className="w-5 h-5" />
              </div>
            </div>
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-8 relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface-soft/90 p-6 shadow-[0_20px_60px_rgba(5,6,8,0.6)]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:information" className="text-brand-gold w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-black text-base mb-2">Info Bonus</h4>
              <p className="text-white/60 text-sm leading-relaxed">
                Gunakan kredit spin untuk memutar roda keberuntungan, atau selesaikan tugas bonus untuk mendapatkan hadiah tambahan. Semua hadiah akan langsung ditambahkan ke saldo Anda.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Copyright />

      {/* Bottom Navigation - Floating */}
      <BottomNavbar />
    </div>
  );
}

