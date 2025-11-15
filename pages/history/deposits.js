// pages/deposits.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { getDepositHistory } from '../../utils/api';
import BottomNavbar from '../../components/BottomNavbar';
import Copyright from '../../components/copyright';

export default function Deposits() {
  const router = useRouter();
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showLimitDropdown, setShowLimitDropdown] = useState(false);
  const [applicationData, setApplicationData] = useState(null);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Check if deposit is expired and update status
  const checkAndUpdateStatus = (deposit) => {
    if (deposit.status === 'Pending' && deposit.expired_at) {
      try {
        // Parse expired_at (assuming it's in UTC ISO format from API)
        const expiredDate = new Date(deposit.expired_at);
        if (isNaN(expiredDate.getTime())) return deposit;
        
        // Get current time (Date objects in JS are stored in UTC internally)
        const now = new Date();
        
        // Compare timestamps directly (both are in UTC internally)
        // If expired_at is in the past, mark as expired
        if (expiredDate < now) {
          return { ...deposit, status: 'Expired' };
        }
      } catch (e) {
        console.error('Error checking expired status:', e);
      }
    }
    return deposit;
  };

  const fetchDepositHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDepositHistory({ limit, page });
      if (res.success && res.data) {
        const depositsData = res.data.deposits || res.data || [];
        const fetchedDeposits = Array.isArray(depositsData) ? depositsData : [];
        
        // Check and update expired status
        const updatedDeposits = fetchedDeposits.map(checkAndUpdateStatus);
        setDeposits(updatedDeposits);
        
        // Get total count from API response
        const total = res.data?.total || res.data?.total_count || res.total || updatedDeposits.length;
        setTotalCount(typeof total === 'number' ? total : Number(total) || updatedDeposits.length);
        
        // Calculate statistics for displayed items
        const totalAmt = updatedDeposits.reduce((sum, dep) => {
          const status = dep.status;
          return ['Success', 'Completed'].includes(status)
            ? sum + (dep.amount || 0)
            : sum;
        }, 0);
        
        setTotalDeposits(updatedDeposits.length);
        setTotalAmount(totalAmt);
      } else {
        setDeposits([]);
        setTotalCount(0);
        setError(res.message || 'Gagal memuat riwayat deposit');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      console.error('Error fetching deposit history:', err);
      setDeposits([]);
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
    fetchDepositHistory();
    try { 
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
    } catch (e) {
      console.log('Scroll failed:', e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  // Update expired status periodically (every 30 seconds)
  useEffect(() => {
    if (deposits.length === 0) return;
    
    const updateExpiredStatus = () => {
      setDeposits(prevDeposits => {
        const updated = prevDeposits.map(deposit => {
          if (deposit.status === 'Pending' && deposit.expired_at) {
            try {
              const expiredDate = new Date(deposit.expired_at);
              const now = new Date();
              if (!isNaN(expiredDate.getTime()) && expiredDate < now) {
                return { ...deposit, status: 'Expired' };
              }
            } catch (e) {
              // Ignore errors
            }
          }
          return deposit;
        });
        return updated;
      });
    };

    // Check immediately
    updateExpiredStatus();
    
    // Then check every 30 seconds
    const interval = setInterval(updateExpiredStatus, 30000);

    return () => clearInterval(interval);
  }, [deposits.length]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage !== page) {
      setPage(newPage);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      // Format using Jakarta timezone (WIB)
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta'
      }).format(date) + ' WIB';
    } catch (e) {
      return 'N/A';
    }
  };

  const getStatusConfig = (status) => {
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
      'Pending': { 
        color: 'text-brand-gold', 
        bgColor: 'bg-brand-gold/10', 
        borderColor: 'border-brand-gold/30',
        text: 'Menunggu', 
        icon: 'mdi:clock-outline' 
      },
      'Expired': { 
        color: 'text-gray-400', 
        bgColor: 'bg-gray-500/10', 
        borderColor: 'border-gray-400/30',
        text: 'Kadaluarsa', 
        icon: 'mdi:timer-off' 
      },
      'Failed': { 
        color: 'text-red-400', 
        bgColor: 'bg-red-500/10', 
        borderColor: 'border-red-400/30',
        text: 'Gagal', 
        icon: 'mdi:close-circle' 
      }
    };

    return statusConfig[status] || statusConfig['Pending'];
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

  const getPaymentMethodIcon = (method) => {
    if (method === 'QRIS') {
      return 'mdi:qrcode';
    } else if (method === 'BANK') {
      return 'mdi:bank';
    }
    return 'mdi:credit-card';
  };

  const getPaymentMethodLabel = (method, channel) => {
    if (method === 'QRIS') {
      return 'QRIS';
    } else if (method === 'BANK' && channel) {
      return `Bank ${channel}`;
    }
    return method || 'N/A';
  };

  const shouldShowPaymentButton = (status, expired_at) => {
    if (status === 'Pending' && expired_at) {
      try {
        const expiredDate = new Date(expired_at);
        if (isNaN(expiredDate.getTime())) return false;
        
        // Get current time
        const now = new Date();
        
        // Show button if not expired yet (expired date is in the future)
        return expiredDate > now;
      } catch (e) {
        return false;
      }
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-brand-black text-white relative overflow-hidden pb-32">
      <Head>
        <title>{applicationData?.name || 'Money Rich'} | Riwayat Deposit</title>
        <meta name="description" content={`${applicationData?.name || 'Money Rich'} Deposit History`} />
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
            <Icon icon="mdi:wallet-plus" className="w-4 h-4" />
            Deposit History
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">
                Riwayat Deposit
              </h1>
              <p className="text-sm text-white/60 max-w-2xl mt-2">
                Lihat semua riwayat deposit dan isi ulang saldo Anda. Pantau status pembayaran deposit secara real-time.
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
              <p className="text-3xl font-black text-white">{totalDeposits}</p>
              <p className="text-[11px] text-white/55 mt-2">Riwayat deposit</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-brand-emerald/25 bg-gradient-to-br from-brand-surface via-brand-charcoal to-brand-surface-soft p-5 shadow-[0_18px_45px_rgba(5,6,8,0.45)]">
            <div className="absolute -bottom-16 -left-20 w-44 h-44 rounded-full bg-brand-emerald/30 blur-3xl opacity-60"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-emerald/20 border border-brand-emerald/30 flex items-center justify-center">
                  <Icon icon="mdi:cash-multiple" className="text-brand-emerald w-5 h-5" />
                </div>
                <p className="text-xs uppercase tracking-[0.35em] text-brand-emerald/80 font-semibold">Total Deposit</p>
              </div>
              <p className="text-3xl font-black text-brand-emerald">{formatCurrency(totalAmount)}</p>
              <p className="text-[11px] text-white/55 mt-2">Deposit berhasil</p>
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
                {deposits.filter(dep => ['Success', 'Completed'].includes(dep.status)).length}/{deposits.length}
              </p>
              <p className="text-[11px] text-white/55 mt-2">Deposit berhasil</p>
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

        {/* Deposits List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-3 border-brand-gold/20 border-t-brand-gold"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-brand-gold/40"></div>
            </div>
            <p className="text-white/70 text-sm mt-4">Memuat riwayat deposit...</p>
          </div>
        ) : deposits.length === 0 && !error ? (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface-soft/90 p-12 text-center shadow-[0_20px_60px_rgba(5,6,8,0.6)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,193,82,0.1),transparent)]"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-brand-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-brand-gold/20">
                <Icon icon="mdi:wallet-off" className="text-brand-gold w-10 h-10" />
              </div>
              <h3 className="text-white font-black text-xl mb-3">Belum Ada Riwayat</h3>
              <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
                Anda belum melakukan deposit. Riwayat deposit akan muncul di sini setelah deposit pertama.
              </p>
              <button
                onClick={() => router.push('/deposit')}
                className="inline-flex items-center gap-2 rounded-xl border border-brand-gold/40 bg-brand-gold/15 px-5 py-3 text-sm font-semibold text-brand-gold transition-transform duration-300 hover:-translate-y-0.5"
              >
                <Icon icon="mdi:wallet-plus" className="w-4 h-4" />
                Deposit Sekarang
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {deposits.map((deposit) => {
              const showPayButton = shouldShowPaymentButton(deposit.status, deposit.expired_at);
              
              return (
                <div key={deposit.id} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface-soft/90 p-6 shadow-[0_20px_60px_rgba(5,6,8,0.6)] hover:shadow-[0_25px_70px_rgba(232,193,82,0.2)] transition-all duration-300 hover:scale-[1.01] hover:border-brand-gold/30">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.08),transparent)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-gold to-brand-gold-deep flex items-center justify-center shadow-lg shadow-brand-gold/30">
                          <Icon icon={getPaymentMethodIcon(deposit.payment_method)} className="text-brand-black w-7 h-7" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-white font-black text-base">
                              {getPaymentMethodLabel(deposit.payment_method, deposit.payment_channel)}
                            </p>
                            {getStatusBadge(deposit.status)}
                          </div>
                          <p className="text-white/60 text-xs font-mono">#{deposit.order_id}</p>
                          <p className="text-white/50 text-xs mt-1">
                            {deposit.created_at ? formatDate(deposit.created_at) : 'Tanggal tidak tersedia'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.35em] text-white/45 mb-1">Jumlah Deposit</p>
                        <p className="text-2xl font-black text-brand-gold">
                          {formatCurrency(deposit.amount || 0)}
                        </p>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid sm:grid-cols-3 gap-4 mb-4">
                      {/* Payment Method */}
                      <div className="rounded-2xl border border-white/10 bg-brand-black/40 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center">
                            <Icon icon={getPaymentMethodIcon(deposit.payment_method)} className="text-brand-gold w-4 h-4" />
                          </div>
                          <p className="text-xs uppercase tracking-[0.35em] text-white/45">Metode</p>
                        </div>
                        <p className="text-white font-bold text-sm">
                          {getPaymentMethodLabel(deposit.payment_method, deposit.payment_channel)}
                        </p>
                      </div>

                      {/* Status Info */}
                      <div className="rounded-2xl border border-white/10 bg-brand-black/40 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
                            ['Success', 'Completed'].includes(deposit.status)
                              ? 'bg-brand-emerald/20 border-brand-emerald/30'
                              : deposit.status === 'Pending'
                              ? 'bg-brand-gold/20 border-brand-gold/30'
                              : deposit.status === 'Expired'
                              ? 'bg-gray-500/20 border-gray-400/30'
                              : 'bg-red-500/20 border-red-500/30'
                          }`}>
                            <Icon icon={getStatusConfig(deposit.status).icon} className={`w-4 h-4 ${getStatusConfig(deposit.status).color}`} />
                          </div>
                          <p className="text-xs uppercase tracking-[0.35em] text-white/45">Status</p>
                        </div>
                        <p className={`font-bold text-sm ${getStatusConfig(deposit.status).color}`}>
                          {getStatusConfig(deposit.status).text}
                        </p>
                      </div>

                      {/* Expired Date Info */}
                      <div className="rounded-2xl border border-white/10 bg-brand-black/40 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center">
                            <Icon icon="mdi:calendar-clock" className="text-brand-gold w-4 h-4" />
                          </div>
                          <p className="text-xs uppercase tracking-[0.35em] text-white/45">
                            {deposit.status === 'Pending' || deposit.status === 'Expired' ? 'Batas Waktu' : 'Tanggal'}
                          </p>
                        </div>
                        <p className="text-white font-bold text-sm">
                          {deposit.expired_at 
                            ? formatDate(deposit.expired_at)
                            : deposit.created_at
                            ? formatDate(deposit.created_at).split(',')[0]
                            : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Payment Button for Pending Status */}
                    {showPayButton && (
                      <div className="pt-4 border-t border-white/10">
                        <button
                          onClick={() => router.push(`/payment?order_id=${deposit.order_id}`)}
                          className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-deep hover:from-brand-gold-deep hover:to-brand-gold text-brand-black font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/30 hover:shadow-brand-gold/50 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Icon icon="mdi:credit-card-check" className="w-5 h-5" />
                          <span>Bayar Sekarang</span>
                        </button>
                        {deposit.expired_at && (
                          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-brand-gold/80">
                            <Icon icon="mdi:timer-outline" className="w-4 h-4" />
                            <span>
                              Batas waktu: {formatDate(deposit.expired_at)}
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
        {deposits.length > 0 && (
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
                Menampilkan {((page - 1) * limit) + 1} - {Math.min(page * limit, totalCount || deposits.length)} dari {totalCount || deposits.length} deposit
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
                {[...Array(Math.min(5, Math.ceil((totalCount || deposits.length) / limit) || 1))].map((_, idx) => {
                  const totalPages = Math.ceil((totalCount || deposits.length) / limit) || 1;
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
                  const totalPages = Math.ceil((totalCount || deposits.length) / limit) || 1;
                  if (page < totalPages) {
                    handlePageChange(page + 1);
                  }
                }}
                disabled={(() => {
                  // Disable if we're on the last page
                  const totalPages = Math.ceil((totalCount || deposits.length) / limit) || 1;
                  const isLastPage = page >= totalPages;
                  
                  // Also disable if we got less than limit items (meaning no more pages)
                  const hasLessThanLimit = deposits.length < limit;
                  
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

