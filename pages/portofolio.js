// pages/portofolio.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getActiveInvestments } from '../utils/api';
import { Icon } from '@iconify/react';
import BottomNavbar from '../components/BottomNavbar';
import Copyright from '../components/copyright';

export default function Portofolio() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [investments, setInvestments] = useState({});
  const [tabKeys, setTabKeys] = useState([]);
  const [invLoading, setInvLoading] = useState(true);
  const [invError, setInvError] = useState('');
  const [applicationData, setApplicationData] = useState(null);

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
        income: 0,
      });
    } else {
      setUserData(user);
    }
    setLoading(false);
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

  useEffect(() => {
    setInvLoading(true);
    setInvError('');
    getActiveInvestments()
      .then(res => {
        const data = res.data || {};
        setInvestments(data);
        const origKeys = Object.keys(data);
        const preferred = ['Monitor', 'Insight', 'Autopilot'];
        const keys = [
          ...preferred.filter(k => origKeys.includes(k)),
          ...origKeys.filter(k => !preferred.includes(k))
        ];
        setTabKeys(keys);
        if (keys.length > 0) setActiveTab(keys[0]);
      })
      .catch(e => setInvError(e.message || 'Gagal memuat investasi aktif'))
      .finally(() => setInvLoading(false));
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  const getStatusConfig = (status) => {
    const statusConfig = {
      'Running': { 
        color: 'text-brand-emerald', 
        bgColor: 'bg-brand-emerald/10', 
        borderColor: 'border-brand-emerald/30',
        text: 'Berjalan', 
        icon: 'mdi:play-circle' 
      },
      'Completed': { 
        color: 'text-brand-gold', 
        bgColor: 'bg-brand-gold/10', 
        borderColor: 'border-brand-gold/30',
        text: 'Selesai', 
        icon: 'mdi:check-circle' 
      },
      'Suspended': { 
        color: 'text-red-400', 
        bgColor: 'bg-red-500/10', 
        borderColor: 'border-red-400/30',
        text: 'Ditangguhkan', 
        icon: 'mdi:pause-circle' 
      }
    };
    return statusConfig[status] || statusConfig['Running'];
  };

  const getStatusBadge = (status) => {
    const config = getStatusConfig(status);
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} border ${config.borderColor}`}>
        <Icon icon={config.icon} className={`w-4 h-4 ${config.color}`} />
        <span className={`text-xs font-bold ${config.color}`}>
          {config.text}
        </span>
      </div>
    );
  };

  const getProfitTypeConfig = (profitType) => {
    if (profitType === 'unlocked') {
      return { 
        color: 'text-brand-emerald', 
        bgColor: 'bg-brand-emerald/10', 
        borderColor: 'border-brand-emerald/30',
        text: 'Terbuka',
        icon: 'mdi:lock-open'
      };
    }
    return { 
      color: 'text-brand-gold', 
      bgColor: 'bg-brand-gold/10', 
      borderColor: 'border-brand-gold/30',
      text: 'Terkunci',
      icon: 'mdi:lock'
    };
  };

  const getProfitTypeBadge = (profitType) => {
    const config = getProfitTypeConfig(profitType);
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold ${config.bgColor} border ${config.borderColor} ${config.color}`}>
        <Icon icon={config.icon} className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('monitor')) return 'mdi:monitor-dashboard';
    if (name.includes('insight')) return 'mdi:lightbulb-on';
    if (name.includes('autopilot')) return 'mdi:rocket-launch';
    return 'mdi:chart-line';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.18),rgba(5,6,8,0.95))]"></div>
          <div className="absolute -top-32 -left-24 w-[360px] h-[360px] bg-brand-gold/18 blur-[160px] rounded-full"></div>
        </div>
        <div className="flex flex-col items-center relative z-10">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-3 border-brand-gold/20 border-t-brand-gold"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-brand-gold/40"></div>
          </div>
          <p className="text-white/70 text-sm mt-4">Memuat data...</p>
        </div>
      </div>
    );
  }

  const totalInvested = Object.values(investments).flat().reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalReturned = Object.values(investments).flat().reduce((sum, inv) => sum + (inv.total_returned || 0), 0);
  const totalInvestments = Object.values(investments).flat().length;

  return (
    <div className="min-h-screen bg-brand-black text-white relative overflow-hidden pb-32">
      <Head>
        <title>{applicationData?.name || 'Money Rich'} | Portofolio Saya</title>
        <meta name="description" content={`${applicationData?.name || 'Money Rich'} Portfolio`} />
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
            <Icon icon="mdi:chart-line" className="w-4 h-4" />
            Portfolio
                </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">
                Portofolio Saya
              </h1>
              <p className="text-sm text-white/60 max-w-2xl mt-2">
                Kelola dan pantau semua investasi aktif Anda. Lihat progress, profit, dan status setiap investasi.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Icon icon="mdi:account-circle" className="w-4 h-4 text-brand-gold" />
                <span>{userData?.name || 'User'}</span>
                  </div>
                </div>
              </div>
            </div>

        {/* Stats Overview */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="relative overflow-hidden rounded-3xl border border-brand-gold/25 bg-gradient-to-br from-brand-gold/12 via-brand-surface to-brand-surface-soft p-5 shadow-[0_18px_45px_rgba(5,6,8,0.45)]">
            <div className="absolute -top-16 -right-12 w-40 h-40 rounded-full bg-brand-gold/35 blur-3xl opacity-70"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center">
                  <Icon icon="mdi:chart-line-variant" className="text-brand-gold w-5 h-5" />
                </div>
                <p className="text-xs uppercase tracking-[0.35em] text-brand-gold/80 font-semibold">Total Investasi</p>
                  </div>
              <p className="text-3xl font-black text-white">{totalInvestments}</p>
              <p className="text-[11px] text-white/55 mt-2">Investasi Aktif</p>
                  </div>
                </div>

          <div className="relative overflow-hidden rounded-3xl border border-brand-emerald/25 bg-gradient-to-br from-brand-surface via-brand-charcoal to-brand-surface-soft p-5 shadow-[0_18px_45px_rgba(5,6,8,0.45)]">
            <div className="absolute -bottom-16 -left-20 w-44 h-44 rounded-full bg-brand-emerald/30 blur-3xl opacity-60"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-emerald/20 border border-brand-emerald/30 flex items-center justify-center">
                  <Icon icon="mdi:currency-usd" className="text-brand-emerald w-5 h-5" />
              </div>
                <p className="text-xs uppercase tracking-[0.35em] text-brand-emerald/80 font-semibold">Total Investasi</p>
            </div>
              <p className="text-3xl font-black text-brand-emerald">Rp {formatCurrency(totalInvested)}</p>
              <p className="text-[11px] text-white/55 mt-2">Nilai investasi</p>
          </div>
        </div>

          <div className="relative overflow-hidden rounded-3xl border border-brand-gold/25 bg-gradient-to-br from-brand-surface via-brand-charcoal to-brand-surface-soft p-5 shadow-[0_18px_45px_rgba(5,6,8,0.45)]">
            <div className="absolute -top-16 -right-12 w-40 h-40 rounded-full bg-brand-gold/20 blur-3xl opacity-60"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center">
                  <Icon icon="mdi:cash-multiple" className="text-brand-gold w-5 h-5" />
              </div>
                <p className="text-xs uppercase tracking-[0.35em] text-brand-gold/80 font-semibold">Total Return</p>
            </div>
              <p className="text-3xl font-black text-brand-gold">Rp {formatCurrency(totalReturned)}</p>
              <p className="text-[11px] text-white/55 mt-2">Profit diterima</p>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tabKeys.length === 0 ? (
              <div className="flex items-center gap-2 text-white/60 text-xs py-2">
                <Icon icon="mdi:information-outline" className="w-4 h-4" />
                <span>Tidak ada kategori investasi</span>
              </div>
            ) : (
              tabKeys.map((key, idx) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`min-w-[140px] flex-1 px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 whitespace-nowrap border ${
                    activeTab === key
                      ? 'bg-gradient-to-r from-brand-gold to-brand-gold-deep text-brand-black border-transparent shadow-lg shadow-brand-gold/30 scale-105'
                      : 'bg-brand-surface text-white/70 hover:text-white hover:bg-brand-surface-soft border-white/10 hover:scale-102'
                  }`}
                >
                  <Icon icon={getCategoryIcon(key)} className="w-5 h-5" />
                  {key}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Investment List */}
        <div className="space-y-4">
          {invLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-3 border-brand-gold/20 border-t-brand-gold"></div>
                <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-brand-gold/40"></div>
              </div>
              <p className="text-white/70 text-center mt-4 text-sm">Mengambil data investasi...</p>
            </div>
          ) : invError ? (
            <div className="relative animate-shake mb-6">
              <div className="absolute -inset-0.5 bg-red-500/50 rounded-2xl blur"></div>
              <div className="relative bg-red-500/10 border border-red-400/30 rounded-2xl p-4 flex items-start gap-3">
                <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-red-300 text-sm leading-relaxed">{invError}</span>
              </div>
            </div>
          ) : !activeTab || !investments[activeTab] || investments[activeTab].length === 0 ? (
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface-soft/90 p-12 text-center shadow-[0_20px_60px_rgba(5,6,8,0.6)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,193,82,0.1),transparent)]"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-brand-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-brand-gold/20">
                  <Icon icon="mdi:database-off" className="text-brand-gold w-10 h-10" />
                </div>
                <h3 className="text-white font-black text-xl mb-3">Belum Ada Investasi</h3>
                <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
                  Anda belum memiliki investasi di kategori &quot;{activeTab}&quot;. Mulai investasi pertama Anda untuk melihat portofolio.
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-gold to-brand-gold-deep text-brand-black font-bold text-sm hover:shadow-lg shadow-brand-gold/30 transition-all duration-300"
                >
                  Lihat Produk
                </button>
              </div>
            </div>
          ) : (
            investments[activeTab].map((inv) => {
              const percent = inv.duration > 0 ? Math.round((inv.total_paid / inv.duration) * 100) : 0;
              const profitType = inv.product_category?.profit_type || 'locked';
              return (
                <div key={inv.id} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface-soft/90 p-6 shadow-[0_20px_60px_rgba(5,6,8,0.6)] hover:shadow-[0_25px_70px_rgba(232,193,82,0.2)] transition-all duration-300 hover:scale-[1.01] hover:border-brand-gold/30">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.08),transparent)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                  {/* Header */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-gold to-brand-gold-deep flex items-center justify-center shadow-lg shadow-brand-gold/30">
                          <Icon icon="mdi:receipt-text" className="text-brand-black w-7 h-7" />
                      </div>
                      <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-white font-black text-base">{inv.product_name || 'Produk Investasi'}</p>
                            {getProfitTypeBadge(profitType)}
                          </div>
                          <p className="text-white/60 text-xs font-mono">#{inv.order_id}</p>
                          <p className="text-white/50 text-xs mt-1">
                          {inv.category_name && (
                              <span className="inline-flex items-center gap-1">
                                <Icon icon={getCategoryIcon(inv.category_name)} className="w-3 h-3" />
                                {inv.category_name}
                            </span>
                          )}
                          </p>
                      </div>
                    </div>
                      {getStatusBadge(inv.status)}
                  </div>

                    {/* Investment Details Grid */}
                    <div className="grid sm:grid-cols-2 gap-4 mb-5">
                      <div className="rounded-2xl border border-white/10 bg-brand-black/40 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center">
                            <Icon icon="mdi:wallet" className="text-brand-gold w-4 h-4" />
                          </div>
                          <p className="text-xs uppercase tracking-[0.35em] text-white/45">Investasi</p>
                        </div>
                        <p className="text-white font-black text-lg">Rp {formatCurrency(inv.amount)}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-brand-black/40 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-brand-emerald/20 border border-brand-emerald/30 flex items-center justify-center">
                            <Icon icon="mdi:cash-refund" className="text-brand-emerald w-4 h-4" />
                    </div>
                          <p className="text-xs uppercase tracking-[0.35em] text-white/45">Profit Harian</p>
                      </div>
                        <p className="text-brand-emerald font-black text-lg">Rp {formatCurrency(inv.daily_profit)}</p>
                    </div>
                  </div>

                  {/* Total Profit */}
                    <div className="rounded-2xl border border-brand-emerald/30 bg-gradient-to-r from-brand-emerald/10 to-brand-emerald/5 p-4 mb-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-brand-emerald/20 border border-brand-emerald/30 flex items-center justify-center">
                            <Icon icon="mdi:cash-multiple" className="text-brand-emerald w-4 h-4" />
                          </div>
                          <span className="text-white/80 text-sm font-semibold">Total Profit</span>
                      </div>
                        <span className="text-brand-emerald font-black text-lg">Rp {formatCurrency(inv.total_returned)}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/70 text-xs">Progress Investasi</span>
                        <span className="text-white text-xs font-bold">{percent}%</span>
                    </div>
                    <div className="h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/10 relative">
                      <div 
                          className="h-full bg-gradient-to-r from-brand-gold to-brand-gold-deep rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-white/50">
                        <span>{inv.total_paid || 0} hari</span>
                        <span>dari {inv.duration || 0} hari</span>
                    </div>
                  </div>

                  {/* Dates */}
                  {inv.last_return_at && inv.next_return_at && (
                      <div className="flex justify-between text-xs text-white/60 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-1">
                        <Icon icon="mdi:clock-outline" className="w-3 h-3" />
                        <span>Terakhir: {new Date(inv.last_return_at).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon icon="mdi:clock-fast-forward" className="w-3 h-3" />
                        <span>Berikutnya: {new Date(inv.next_return_at).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              );
            })
          )}
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
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          
          .animate-shake { animation: shake 0.5s ease-in-out; }
        
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
