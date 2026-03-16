// pages/vip.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import BottomNavbar from '../components/BottomNavbar';
import Copyright from '../components/copyright';

export default function VIPPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [applicationData, setApplicationData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Harus match dengan backend calculateVIPLevel (investment.go)
  const VIP_THRESHOLDS = {
    0: 0,
    1: 50000,
    2: 1200000,
    3: 10000000,
    4: 30000000,
    5: 150000000,
  };

  const VIP_BENEFITS = {
    0: [
      'Akses produk tanpa syarat VIP',
      'Investasi di kategori Neura',
    ],
    1: [
      'Semua benefit VIP 0',
      'Akses produk Finora 1',
    ],
    2: [
      'Semua benefit VIP 1',
      'Akses produk Finora 2',
    ],
    3: [
      'Semua benefit VIP 2',
      'Akses produk Finora 3 & semua Corex',
    ],
    4: [
      'Semua benefit VIP 3',
      'Akses produk Finora 4',
    ],
    5: [
      'Semua benefit VIP 4',
      'Akses produk Finora 5',
      'Akses semua produk eksklusif',
    ],
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    const accessExpire = sessionStorage.getItem('access_expire');
    if (!token || !accessExpire) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const app = JSON.parse(localStorage.getItem('application') || '{}');

    setUserData({
      name: user.name || 'User',
      level: user.level ?? 0,
      total_invest_vip: user.total_invest_vip || 0,
      total_invest: user.total_invest || 0,
      balance: user.balance || 0
    });

    setApplicationData({
      name: app.name || 'Money Rich',
      company: app.company || 'Money Rich Holdings'
    });

    setLoading(false);
  }, [router]);

  const getVIPProgress = () => {
    const totalVIP = userData?.total_invest_vip || 0;
    const currentLevel = userData?.level ?? 0;
    const nextLevel = currentLevel + 1;

    // Sudah level 5 (maksimal)
    if (currentLevel >= 5) {
      return {
        current: currentLevel,
        next: null,
        progress: 100,
        remaining: 0,
        nextThreshold: 0
      };
    }

    const nextThreshold = VIP_THRESHOLDS[nextLevel];
    const currentThreshold = VIP_THRESHOLDS[currentLevel] || 0;
    const range = nextThreshold - currentThreshold;
    const invested = totalVIP - currentThreshold;
    const progress = range > 0 ? (invested / range) * 100 : 0;
    const remaining = nextThreshold - totalVIP;

    return {
      current: currentLevel,
      next: nextLevel,
      progress: Math.min(Math.max(progress, 0), 100),
      remaining: Math.max(remaining, 0),
      nextThreshold
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getVIPConfig = (level) => {
    const configs = {
      0: {
        gradient: 'from-gray-500 to-gray-600',
        text: 'text-gray-400',
        border: 'border-gray-500/30',
        icon: 'mdi:account-circle',
        bgGlow: 'bg-gray-500/20',
        name: 'Member',
        description: 'Akses produk dasar'
      },
      1: {
        gradient: 'from-brand-gold to-brand-gold-deep',
        text: 'text-brand-gold',
        border: 'border-brand-gold/30',
        icon: 'mdi:star-circle',
        bgGlow: 'bg-brand-gold/20',
        name: 'VIP 1',
        description: 'Akses produk Finora 1'
      },
      2: {
        gradient: 'from-brand-emerald to-teal-500',
        text: 'text-brand-emerald',
        border: 'border-brand-emerald/30',
        icon: 'mdi:star-four-points',
        bgGlow: 'bg-brand-emerald/20',
        name: 'VIP 2',
        description: 'Akses produk Finora 2'
      },
      3: {
        gradient: 'from-blue-500 to-indigo-600',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
        icon: 'mdi:diamond-stone',
        bgGlow: 'bg-blue-500/20',
        name: 'VIP 3',
        description: 'Akses Finora 3 & Corex'
      },
      4: {
        gradient: 'from-purple-500 to-pink-600',
        text: 'text-purple-400',
        border: 'border-purple-500/30',
        icon: 'mdi:crown',
        bgGlow: 'bg-purple-500/20',
        name: 'VIP 4',
        description: 'Akses produk Finora 4'
      },
      5: {
        gradient: 'from-red-500 to-orange-500',
        text: 'text-red-400',
        border: 'border-red-500/30',
        icon: 'mdi:trophy',
        bgGlow: 'bg-red-500/20',
        name: 'VIP 5',
        description: 'Akses semua produk'
      }
    };
    return configs[level] || configs[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.18),rgba(5,6,8,0.95))]"></div>
          <div className="absolute -top-32 -left-24 w-[360px] h-[360px] bg-brand-gold/18 blur-[160px] rounded-full"></div>
        </div>
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-brand-gold/20 border-t-brand-gold"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-brand-gold/40"></div>
        </div>
      </div>
    );
  }

  const vipProgress = getVIPProgress();
  const currentLevel = userData?.level ?? 0;
  const currentConfig = getVIPConfig(currentLevel);

  return (
    <div className="min-h-screen bg-brand-black text-white relative overflow-hidden pb-24">
      <Head>
        <title>{applicationData?.name || 'Money Rich'} | VIP Status</title>
        <meta name="description" content="VIP Membership Status" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.18),rgba(5,6,8,0.95))]"></div>
        <div className="absolute -top-32 -left-24 w-[360px] h-[360px] bg-brand-gold/18 blur-[160px] rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-[460px] h-[460px] bg-brand-gold-deep/12 blur-[220px] rounded-full"></div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-brand-emerald/12 blur-[200px] rounded-full"></div>
      </div>

      {/* Top Navigation */}
      <div className="sticky top-0 z-20 bg-brand-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center bg-brand-surface hover:bg-brand-surface-soft rounded-xl transition-all duration-300 border border-white/10"
          >
            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-8 pb-24">
        {/* Hero Header Section */}
        <div className="mb-10 flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-brand-gold w-fit">
            <Icon icon="mdi:crown" className="w-4 h-4" />
            VIP Status
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Status VIP Anda
            </h1>
            <p className="text-sm text-white/60 max-w-2xl mt-2">
              Pantau level VIP Anda dan akses produk eksklusif. Naik level dengan berinvestasi di kategori Neura (locked) untuk membuka produk VIP yang lebih tinggi.
            </p>
          </div>
        </div>

        {/* Current VIP Level - Hero Card */}
        <div className="relative mb-8">
          <div className={`absolute -inset-1 bg-gradient-to-r ${currentConfig.gradient} rounded-3xl blur-xl opacity-30`}></div>

          <div className="relative bg-brand-surface-soft/90 rounded-3xl p-8 border border-white/10 shadow-[0_20px_60px_rgba(5,6,8,0.6)]">
            <div className="text-center mb-6">
              <div className={`inline-flex items-center gap-4 bg-gradient-to-r ${currentConfig.gradient} rounded-3xl px-8 py-6 shadow-2xl border border-white/20`}>
                <div className="relative">
                  <div className={`absolute inset-0 ${currentConfig.bgGlow} blur-xl rounded-full animate-pulse`}></div>
                  <Icon icon={currentConfig.icon} className="w-16 h-16 text-white drop-shadow-2xl relative z-10" />
                </div>
                <div className="text-left">
                  <p className="text-white/90 text-xs font-semibold uppercase tracking-wide mb-1">Level VIP Anda</p>
                  <div className="flex items-center gap-2">
                    <p className="text-white text-4xl font-black">VIP</p>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-2 border border-white/30">
                      <p className="text-white text-4xl font-black">{currentLevel}</p>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm mt-2 font-semibold">{currentConfig.name}</p>
                  <p className="text-white/70 text-xs mt-1">{currentConfig.description}</p>
                </div>
              </div>
            </div>

            {vipProgress.next ? (
              <>
                <div className="rounded-2xl border border-white/10 bg-brand-black/40 p-5 mb-5">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-white/70 font-semibold">Progress ke VIP {vipProgress.next}</span>
                    <span className={`font-black ${getVIPConfig(vipProgress.next).text}`}>
                      {vipProgress.progress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/10">
                    <div
                      className={`h-full bg-gradient-to-r ${getVIPConfig(vipProgress.next).gradient} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${vipProgress.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-brand-gold/30 bg-gradient-to-br from-brand-gold/10 to-brand-gold-deep/5 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center">
                        <Icon icon="mdi:currency-usd" className="text-brand-gold w-4 h-4" />
                      </div>
                      <p className="text-xs uppercase tracking-[0.35em] text-white/45 font-semibold">Investasi VIP</p>
                    </div>
                    <p className="text-white font-black text-xl">{formatCurrency(userData?.total_invest_vip || 0)}</p>
                  </div>
                  <div className="rounded-2xl border border-brand-emerald/30 bg-gradient-to-br from-brand-emerald/10 to-brand-emerald/5 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-brand-emerald/20 border border-brand-emerald/30 flex items-center justify-center">
                        <Icon icon="mdi:target" className="text-brand-emerald w-4 h-4" />
                      </div>
                      <p className="text-xs uppercase tracking-[0.35em] text-white/45 font-semibold">Butuh Lagi</p>
                    </div>
                    <p className="text-brand-emerald font-black text-xl">{formatCurrency(vipProgress.remaining)}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-brand-emerald/30 bg-gradient-to-r from-brand-emerald/10 to-brand-emerald/5 p-6 text-center">
                <Icon icon="mdi:trophy" className="w-16 h-16 text-brand-emerald mx-auto mb-3 animate-bounce" />
                <p className="text-brand-emerald font-black text-xl mb-2">VIP Level Maksimal!</p>
                <p className="text-white/70 text-sm">Anda telah mencapai level VIP tertinggi. Semua produk tersedia untuk Anda.</p>
              </div>
            )}
          </div>
        </div>

        {/* VIP Levels Timeline */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center">
              <Icon icon="mdi:format-list-bulleted" className="text-brand-gold w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-white">Benefit Setiap Level</h2>
          </div>

          <div className="space-y-4">
            {[0, 1, 2, 3, 4, 5].map((level) => {
              const isUnlocked = currentLevel >= level;
              const isCurrent = currentLevel === level;
              const threshold = VIP_THRESHOLDS[level];
              const config = getVIPConfig(level);

              return (
                <div
                  key={level}
                  className={`relative ${isCurrent ? 'scale-[1.02]' : ''} transition-all duration-300`}
                >
                  {isCurrent && (
                    <div className={`absolute -inset-1 bg-gradient-to-r ${config.gradient} rounded-3xl blur-lg opacity-40`}></div>
                  )}

                  <div className={`
                    relative bg-brand-surface-soft/90 rounded-3xl p-6 border transition-all duration-300 shadow-[0_20px_60px_rgba(5,6,8,0.6)]
                    ${isCurrent ? `${config.border} border-2 shadow-xl` : 'border-white/10'}
                    ${!isUnlocked && !isCurrent ? 'opacity-60' : ''}
                  `}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {isCurrent && (
                            <div className={`absolute inset-0 ${config.bgGlow} blur-lg rounded-2xl animate-pulse`}></div>
                          )}
                          <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${config.gradient} flex flex-col items-center justify-center shadow-lg border border-white/20`}>
                            <Icon icon={config.icon} className="w-8 h-8 text-white mb-1" />
                            <span className="text-white text-lg font-black">{level}</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-2xl font-black ${config.text}`}>
                              VIP {level}
                            </h3>
                          </div>
                          <p className="text-white/60 text-sm font-semibold">{config.name}</p>
                          {threshold > 0 && (
                            <p className="text-white/70 text-sm font-bold mt-1">
                              Minimal investasi Neura: {formatCurrency(threshold)}
                            </p>
                          )}
                          {threshold === 0 && (
                            <p className="text-brand-gold text-sm font-bold mt-1">
                              Level default untuk user baru
                            </p>
                          )}
                        </div>
                      </div>

                      {isCurrent && (
                        <div className="bg-brand-emerald/20 border border-brand-emerald/40 rounded-full px-4 py-2">
                          <span className="text-brand-emerald text-xs font-black">Level Saat Ini</span>
                        </div>
                      )}
                      {!isUnlocked && (
                        <div className="bg-brand-gold/20 border border-brand-gold/40 rounded-full px-4 py-2">
                          <span className="text-brand-gold text-xs font-black">Terkunci</span>
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-brand-black/40 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon icon="mdi:gift" className="w-5 h-5 text-brand-gold" />
                        <p className="text-white font-semibold text-sm">Benefits:</p>
                      </div>
                      <ul className="space-y-2">
                        {VIP_BENEFITS[level].map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-white/80">
                            <span className={`text-base flex-shrink-0 mt-0.5 ${isUnlocked ? 'text-brand-emerald' : 'text-white/30'}`}>
                              {isUnlocked ? '✓' : '○'}
                            </span>
                            <span className="flex-1">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {!isUnlocked && threshold > 0 && (
                      <div className="mt-4 rounded-xl border border-brand-gold/30 bg-brand-gold/10 p-3 text-center">
                        <p className="text-brand-gold text-sm font-black">
                          Target: {formatCurrency(threshold)} investasi Neura untuk membuka level ini
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How to Upgrade */}
        <div className="relative mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-gold/30 to-brand-emerald/30 rounded-3xl blur-xl opacity-30"></div>

          <div className="relative bg-brand-surface-soft/90 rounded-3xl p-6 border border-white/10 shadow-[0_20px_60px_rgba(5,6,8,0.6)]">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center">
                <Icon icon="mdi:information" className="text-brand-gold w-6 h-6" />
              </div>
              <h3 className="text-white font-black text-xl">Cara Naik Level VIP</h3>
            </div>

            <div className="space-y-4 mb-6">
              <div className="rounded-2xl border border-brand-emerald/30 bg-gradient-to-br from-brand-emerald/10 to-brand-emerald/5 p-4">
                <div className="flex items-start gap-3">
                  <Icon icon="mdi:check-circle" className="w-6 h-6 text-brand-emerald flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-brand-emerald font-black text-sm mb-1">Investasi di Kategori Neura (Locked)</p>
                    <p className="text-white/70 text-xs leading-relaxed">
                      Hanya investasi di kategori Neura (locked profit) yang dihitung untuk naik level VIP. Semakin besar total investasi Neura Anda, semakin tinggi level VIP yang bisa dicapai.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-brand-black/40 p-4">
                <div className="flex items-start gap-3">
                  <Icon icon="mdi:lightbulb" className="w-6 h-6 text-brand-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">Syarat VIP</p>
                    <p className="text-white/70 text-xs leading-relaxed">
                      VIP 1: Rp 50.000 | VIP 2: Rp 1.200.000 | VIP 3: Rp 10.000.000 | VIP 4: Rp 30.000.000 | VIP 5: Rp 150.000.000
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-deep hover:from-brand-gold-deep hover:to-brand-gold text-brand-black font-black py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-brand-gold/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Icon icon="mdi:rocket" className="w-5 h-5" />
              Lihat Produk Investasi
              <Icon icon="mdi:arrow-right" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="rounded-2xl border border-white/10 bg-brand-black/40 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center">
                <Icon icon="mdi:chart-line" className="text-brand-gold w-5 h-5" />
              </div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/45 font-semibold">Total Investasi</p>
            </div>
            <p className="text-white font-black text-2xl">{formatCurrency(userData?.total_invest || 0)}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-brand-black/40 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand-emerald/20 border border-brand-emerald/30 flex items-center justify-center">
                <Icon icon="mdi:crown" className="text-brand-emerald w-5 h-5" />
              </div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/45 font-semibold">Investasi VIP (Neura)</p>
            </div>
            <p className="text-brand-emerald font-black text-2xl">{formatCurrency(userData?.total_invest_vip || 0)}</p>
          </div>
        </div>
      </div>

      <Copyright />

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

          .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
          .animate-slideUp { animation: slideUp 0.5s ease-out; }
      `}</style>
    </div>
  );
}
