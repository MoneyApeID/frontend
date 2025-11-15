// pages/history/investment.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { getInvestmentHistory, getPaymentByOrderId } from '../../utils/api';
import BottomNavbar from '../../components/BottomNavbar';
import Copyright from '../../components/copyright';

export default function RiwayatDeposit() {
  const router = useRouter();
  const [investments, setInvestments] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showLimitDropdown, setShowLimitDropdown] = useState(false);
  const [applicationData, setApplicationData] = useState(null);
  const [totalInvested, setTotalInvested] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchInvestmentHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {
        limit,
        page
      };
      
      const res = await getInvestmentHistory(queryParams);
      if (res.success && res.data) {
        const invs = res.data.investments || res.data || [];
        const fetchedInvestments = Array.isArray(invs) ? invs : [];
        setInvestments(fetchedInvestments);
        
        // Get total count from API response
        const total = res.data?.total || res.data?.total_count || res.total || fetchedInvestments.length;
        setTotalCount(typeof total === 'number' ? total : Number(total) || fetchedInvestments.length);
        
        const totalInvest = fetchedInvestments.reduce((sum, inv) => {
          const status = paymentStatus[inv.order_id]?.status || inv.status;
          return ['Success', 'Completed', 'Running'].includes(status)
            ? sum + (inv.amount || 0)
            : sum;
        }, 0);
        setTotalInvested(totalInvest);
        
        const statusObj = {};
        await Promise.all(
          fetchedInvestments.map(async (inv) => {
            try {
              const payRes = await getPaymentByOrderId(inv.order_id);
              if (payRes.success && payRes.data) {
                statusObj[inv.order_id] = {
                  status: payRes.data.status,
                  expired_at: payRes.data.expired_at,
                  payment_method: payRes.data.payment_method,
                  product: payRes.data.product
                };
              } else {
                statusObj[inv.order_id] = { 
                  status: inv.status || 'Unknown', 
                  expired_at: null,
                  payment_method: null,
                  product: null
                };
              }
            } catch {
              statusObj[inv.order_id] = { 
                status: inv.status || 'Unknown', 
                expired_at: null,
                payment_method: null,
                product: null
              };
            }
          })
        );
        setPaymentStatus(statusObj);
      } else {
        setInvestments([]);
        setPaymentStatus({});
        setTotalCount(0);
        setError(res.message || 'Gagal memuat riwayat investasi');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      console.error('Error fetching investment history:', err);
      setInvestments([]);
      setPaymentStatus({});
      setTotalCount(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    const accessExpire = sessionStorage.getItem('access_expire');
    if (!token || !accessExpire) {
      router.push('/login');
      return;
    }
    fetchInvestmentHistory();
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    fetchInvestmentHistory();
    try { 
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
    } catch (e) {
      console.log('Scroll failed:', e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage !== page) {
      setPage(newPage);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusConfig = (status, expired_at) => {
    if (status === 'Pending' && expired_at) {
      const expiredDate = new Date(expired_at);
      const now = new Date();
      const diff = (expiredDate.getTime() - now.getTime()) / 1000;
      if (diff < 0) {
        return {
          color: 'text-gray-400', 
          bgColor: 'bg-gray-500/10', 
          borderColor: 'border-gray-400/30',
          text: 'Kadaluarsa', 
          icon: 'mdi:timer-off'
        };
      }
    }

    const statusConfig = {
      'Success': { 
        color: 'text-brand-emerald', 
        bgColor: 'bg-brand-emerald/10', 
        borderColor: 'border-brand-emerald/30',
        text: 'Berhasil', 
        icon: 'mdi:check-circle' 
      },
      'Completed': { 
        color: 'text-brand-emerald', 
        bgColor: 'bg-brand-emerald/10', 
        borderColor: 'border-brand-emerald/30',
        text: 'Berhasil', 
        icon: 'mdi:check-circle' 
      },
      'Running': { 
        color: 'text-brand-emerald', 
        bgColor: 'bg-brand-emerald/10', 
        borderColor: 'border-brand-emerald/30',
        text: 'Berjalan', 
        icon: 'mdi:play-circle' 
      },
      'Pending': { 
        color: 'text-brand-gold', 
        bgColor: 'bg-brand-gold/10', 
        borderColor: 'border-brand-gold/30',
        text: 'Menunggu', 
        icon: 'mdi:clock-outline' 
      },
      'Failed': { 
        color: 'text-red-400', 
        bgColor: 'bg-red-500/10', 
        borderColor: 'border-red-400/30',
        text: 'Gagal', 
        icon: 'mdi:close-circle' 
      },
      'Expired': { 
        color: 'text-gray-400', 
        bgColor: 'bg-gray-500/10', 
        borderColor: 'border-gray-400/30',
        text: 'Kadaluarsa', 
        icon: 'mdi:timer-off' 
      }
    };

    return statusConfig[status] || statusConfig['Pending'];
  };

  const getStatusBadge = (status, expired_at) => {
    const config = getStatusConfig(status, expired_at);
    
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} border ${config.borderColor}`}>
        <Icon icon={config.icon} className={`w-4 h-4 ${config.color}`} />
        <span className={`text-xs font-bold ${config.color}`}>
          {config.text}
        </span>
      </div>
    );
  };

  const getPaymentMethodIcon = (method) => {
    if (method === 'QRIS') {
      return 'mdi:qrcode';
    } else if (method === 'BANK') {
      return 'mdi:bank';
    }
    return 'mdi:credit-card';
  };

  const shouldShowPayButton = (status, expired_at) => {
    if (status === 'Pending' && expired_at) {
      const expiredDate = new Date(expired_at);
      const now = new Date();
      const diff = (expiredDate.getTime() - now.getTime()) / 1000;
      return diff > 0;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-brand-black text-white relative overflow-hidden pb-32">
      <Head>
        <title>{applicationData?.name || 'Money Rich'} | Riwayat Investasi</title>
        <meta name="description" content={`${applicationData?.name || 'Money Rich'} Investment History`} />
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
            <Icon icon="mdi:history" className="w-4 h-4" />
            Investment History
            </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">
                Riwayat Investasi
              </h1>
              <p className="text-sm text-white/60 max-w-2xl mt-2">
                Lihat semua riwayat pembelian dan status pembayaran investasi Anda. Pantau perkembangan portofolio investasi Anda.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Icon icon="mdi:shield-check" className="w-4 h-4 text-brand-emerald" />
              Data terlindungi & terenkripsi
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="relative overflow-hidden rounded-3xl border border-brand-gold/25 bg-gradient-to-br from-brand-gold/12 via-brand-surface to-brand-surface-soft p-5 shadow-[0_18px_45px_rgba(5,6,8,0.45)]">
            <div className="absolute -top-16 -right-12 w-40 h-40 rounded-full bg-brand-gold/35 blur-3xl opacity-70"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center">
                  <Icon icon="mdi:counter" className="text-brand-gold w-5 h-5" />
                </div>
                <p className="text-xs uppercase tracking-[0.35em] text-brand-gold/80 font-semibold">Total Transaksi</p>
              </div>
              <p className="text-3xl font-black text-white">{investments.length}</p>
              <p className="text-[11px] text-white/55 mt-2">Riwayat investasi</p>
            </div>
        </div>

          <div className="relative overflow-hidden rounded-3xl border border-brand-emerald/25 bg-gradient-to-br from-brand-surface via-brand-charcoal to-brand-surface-soft p-5 shadow-[0_18px_45px_rgba(5,6,8,0.45)]">
            <div className="absolute -bottom-16 -left-20 w-44 h-44 rounded-full bg-brand-emerald/30 blur-3xl opacity-60"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-emerald/20 border border-brand-emerald/30 flex items-center justify-center">
                  <Icon icon="mdi:cash-multiple" className="text-brand-emerald w-5 h-5" />
                </div>
                <p className="text-xs uppercase tracking-[0.35em] text-brand-emerald/80 font-semibold">Total Investasi</p>
              </div>
              <p className="text-3xl font-black text-brand-emerald">{formatCurrency(totalInvested)}</p>
              <p className="text-[11px] text-white/55 mt-2">Investasi berhasil</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-white/4 to-white/[0.02] p-5 shadow-[0_18px_45px_rgba(5,6,8,0.45)]">
            <div className="absolute top-0 right-0 w-28 h-28 bg-brand-gold/10 blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-white/10 flex items-center justify-center">
                  <Icon icon="mdi:chart-line" className="text-brand-gold w-5 h-5" />
              </div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/45 font-semibold">Status</p>
            </div>
              <p className="text-2xl font-black text-white">
                {investments.filter(inv => {
                  const status = paymentStatus[inv.order_id]?.status || inv.status;
                  return ['Success', 'Completed', 'Running'].includes(status);
                }).length}/{investments.length}
              </p>
              <p className="text-[11px] text-white/55 mt-2">Investasi aktif</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="relative animate-shake mb-6">
            <div className="absolute -inset-0.5 bg-red-500/50 rounded-2xl blur"></div>
            <div className="relative bg-red-500/10 border border-red-400/30 rounded-2xl p-4 flex items-start gap-3">
              <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-red-300 text-sm leading-relaxed">{error}</span>
            </div>
          </div>
        )}

        {/* Investments List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-3 border-brand-gold/20 border-t-brand-gold"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-brand-gold/40"></div>
            </div>
            <p className="text-white/70 text-sm mt-4">Memuat riwayat investasi...</p>
          </div>
        ) : investments.length === 0 && !error ? (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface-soft/90 p-12 text-center shadow-[0_20px_60px_rgba(5,6,8,0.6)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,193,82,0.1),transparent)]"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-brand-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-brand-gold/20">
                <Icon icon="mdi:database-off" className="text-brand-gold w-10 h-10" />
              </div>
              <h3 className="text-white font-black text-xl mb-3">Belum Ada Riwayat</h3>
              <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
                Anda belum melakukan pembelian investasi. Riwayat investasi akan muncul di sini setelah pembelian pertama.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center gap-2 rounded-xl border border-brand-gold/40 bg-brand-gold/15 px-5 py-3 text-sm font-semibold text-brand-gold transition-transform duration-300 hover:-translate-y-0.5"
              >
                <Icon icon="mdi:chart-line" className="w-4 h-4" />
                Mulai Investasi
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {investments.map((investment) => {
              const paymentInfo = paymentStatus[investment.order_id] || {};
              const status = paymentInfo.status || investment.status;
              const showPayButton = shouldShowPayButton(status, paymentInfo.expired_at);
              
              return (
                <div key={investment.id || investment.order_id} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface-soft/90 p-6 shadow-[0_20px_60px_rgba(5,6,8,0.6)] hover:shadow-[0_25px_70px_rgba(232,193,82,0.2)] transition-all duration-300 hover:scale-[1.01] hover:border-brand-gold/30">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.08),transparent)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-gold to-brand-gold-deep flex items-center justify-center shadow-lg shadow-brand-gold/30">
                          <Icon icon="mdi:chart-line-variant" className="text-brand-black w-7 h-7" />
                      </div>
                      <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-white font-black text-base">{paymentInfo.product || 'Produk Investasi'}</p>
                            {getStatusBadge(status, paymentInfo.expired_at)}
                          </div>
                        <p className="text-white/60 text-xs font-mono">#{investment.order_id}</p>
                          <p className="text-white/50 text-xs mt-1">
                            {investment.created_at ? formatDate(investment.created_at) : 'Tanggal tidak tersedia'}
                          </p>
                      </div>
                    </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.35em] text-white/45 mb-1">Jumlah Investasi</p>
                        <p className="text-2xl font-black text-brand-gold">
                          {formatCurrency(investment.amount || 0)}
                        </p>
                      </div>
                  </div>

                    {/* Details Grid */}
                    <div className="grid sm:grid-cols-3 gap-4 mb-4">
                      {/* Payment Method */}
                      {paymentInfo.payment_method && (
                        <div className="rounded-2xl border border-white/10 bg-brand-black/40 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center">
                              <Icon icon={getPaymentMethodIcon(paymentInfo.payment_method)} className="text-brand-gold w-4 h-4" />
                            </div>
                            <p className="text-xs uppercase tracking-[0.35em] text-white/45">Metode</p>
                          </div>
                          <p className="text-white font-bold text-sm">{paymentInfo.payment_method}</p>
                        </div>
                      )}

                      {/* Status Info */}
                      <div className="rounded-2xl border border-white/10 bg-brand-black/40 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
                            ['Success', 'Completed', 'Running'].includes(status)
                              ? 'bg-brand-emerald/20 border-brand-emerald/30'
                              : status === 'Pending'
                              ? 'bg-brand-gold/20 border-brand-gold/30'
                              : 'bg-red-500/20 border-red-500/30'
                          }`}>
                            <Icon icon={getStatusConfig(status, paymentInfo.expired_at).icon} className={`w-4 h-4 ${getStatusConfig(status, paymentInfo.expired_at).color}`} />
                          </div>
                          <p className="text-xs uppercase tracking-[0.35em] text-white/45">Status</p>
                        </div>
                        <p className={`font-bold text-sm ${getStatusConfig(status, paymentInfo.expired_at).color}`}>
                          {getStatusConfig(status, paymentInfo.expired_at).text}
                        </p>
                    </div>
                    
                      {/* Date Info */}
                      <div className="rounded-2xl border border-white/10 bg-brand-black/40 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center">
                            <Icon icon="mdi:calendar-clock" className="text-brand-gold w-4 h-4" />
                          </div>
                          <p className="text-xs uppercase tracking-[0.35em] text-white/45">Tanggal</p>
                        </div>
                      <p className="text-white font-bold text-sm">
                          {investment.created_at ? formatDate(investment.created_at).split(',')[0] : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Payment Button for Pending Status */}
                  {showPayButton && (
                    <div className="pt-4 border-t border-white/10">
                      <button
                        onClick={() => router.push(`/payment?order_id=${investment.order_id}`)}
                          className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-deep hover:from-brand-gold-deep hover:to-brand-gold text-brand-black font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/30 hover:shadow-brand-gold/50 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Icon icon="mdi:credit-card-check" className="w-5 h-5" />
                        <span>Bayar Sekarang</span>
                      </button>
                      {paymentInfo.expired_at && (
                          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-brand-gold/80">
                            <Icon icon="mdi:timer-outline" className="w-4 h-4" />
                          <span>
                            Batas waktu: {formatDate(paymentInfo.expired_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {investments.length > 0 && (
          <div className="space-y-4 mt-8">
            {/* Limit Selector and Page Info */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Limit Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLimitDropdown(!showLimitDropdown)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:text-white hover:border-white/20 transition-all"
                >
                  <Icon icon="mdi:format-list-bulleted" className="w-4 h-4" />
                  <span>{limit} per halaman</span>
                  <Icon icon="mdi:chevron-down" className={`w-4 h-4 transition-transform ${showLimitDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showLimitDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={() => setShowLimitDropdown(false)}
                    ></div>
                    <div className="absolute bottom-full left-0 mb-2 z-40 bg-brand-surface border border-white/10 rounded-xl shadow-xl overflow-hidden min-w-[150px]">
                      {[10, 20, 50, 100].map((l) => (
                        <button
                          key={l}
                          onClick={() => {
                            setLimit(l);
                            setPage(1);
                            setShowLimitDropdown(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm transition-all ${
                            limit === l
                              ? 'bg-brand-gold/20 text-brand-gold border-l-2 border-brand-gold'
                              : 'text-white/70 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {l} per halaman
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Page Info */}
              <div className="text-sm text-white/60">
                Menampilkan {((page - 1) * limit) + 1} - {Math.min(page * limit, totalCount || investments.length)} dari {totalCount || investments.length} investasi
              </div>
            </div>

            {/* Pagination Buttons */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  if (page > 1) handlePageChange(page - 1);
                }}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-semibold"
              >
                <Icon icon="mdi:chevron-left" className="w-5 h-5" />
                Sebelumnya
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-2">
                {[...Array(Math.min(5, Math.ceil((totalCount || investments.length) / limit) || 1))].map((_, idx) => {
                  const totalPages = Math.ceil((totalCount || investments.length) / limit) || 1;
                  const pageNum = Math.max(1, Math.min(page - 2 + idx, totalPages));
                  if (pageNum < 1 || pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all duration-300 text-sm ${
                        page === pageNum
                          ? 'bg-brand-gold text-brand-black border-brand-gold shadow-brand-glow font-bold'
                          : 'bg-white/5 text-white border-white/10 hover:border-brand-gold/30'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  const totalPages = Math.ceil((totalCount || investments.length) / limit) || 1;
                  if (page < totalPages) {
                    handlePageChange(page + 1);
                  }
                }}
                disabled={(() => {
                  // Disable if we're on the last page
                  const totalPages = Math.ceil((totalCount || investments.length) / limit) || 1;
                  const isLastPage = page >= totalPages;
                  
                  // Also disable if we got less than limit items (meaning no more pages)
                  const hasLessThanLimit = investments.length < limit;
                  
                  return isLastPage || hasLessThanLimit;
                })()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-semibold"
              >
                Selanjutnya
                <Icon icon="mdi:chevron-right" className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
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
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          
          .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
          .animate-slideUp { animation: slideUp 0.5s ease-out; }
          .animate-shake { animation: shake 0.5s ease-in-out; }
            `}</style>
    </div>
  );
}
