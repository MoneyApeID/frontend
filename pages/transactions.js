// pages/transactions.js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react'; 
import BottomNavbar from '../components/BottomNavbar';
import { getUserTransactions } from '../utils/api';
import Copyright from '../components/copyright';

export default function Transactions() {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showLimitDropdown, setShowLimitDropdown] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [applicationData, setApplicationData] = useState(null);

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'Semua', icon: 'mdi:view-list' },
    { value: 'deposit', label: 'Isi Ulang', icon: 'mdi:bank-transfer-in' },
    { value: 'withdrawal', label: 'Penarikan', icon: 'mdi:bank-transfer-out' },
    { value: 'investment', label: 'Investasi', icon: 'mdi:trending-up' },
    { value: 'return', label: 'Return', icon: 'mdi:cash-refund' },
    { value: 'team', label: 'Tim', icon: 'mdi:account-group' },
    { value: 'bonus', label: 'Bonus', icon: 'mdi:gift' }
  ];

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {
        limit,
        page,
        ...(selectedFilter !== 'all' && { type: selectedFilter })
      };
      
      const res = await getUserTransactions(queryParams);
      
      if (res.success && res.data) {
        const fetchedTransactions = Array.isArray(res.data.transactions) ? res.data.transactions : [];
        setTransactions(fetchedTransactions);
        
        if (res.data.meta) {
          const meta = res.data.meta;
          setTotalTransactions(meta.total || 0);
          setTotalPages(meta.total_pages || Math.max(1, Math.ceil((meta.total || 0) / limit)));
          setHasNextPage(meta.has_next_page || false);
        } else {
          // Use total from API response if available, otherwise use length of current page
          const total = res.data?.total || res.data?.total_count || res.total || fetchedTransactions.length;
          setTotalTransactions(typeof total === 'number' ? total : Number(total) || fetchedTransactions.length);
          setTotalPages(Math.max(1, Math.ceil((typeof total === 'number' ? total : Number(total) || fetchedTransactions.length) / limit)));
          setHasNextPage(fetchedTransactions.length === limit);
        }

        // Since filtering is done server-side via type parameter, filteredTransactions should be same as transactions
        filterTransactions(fetchedTransactions);
      } else {
        setTransactions([]);
        setFilteredTransactions([]);
        setTotalTransactions(0);
        setTotalPages(1);
        setHasNextPage(false);
        if (!res.success) {
          setError(res.message || 'Gagal memuat riwayat transaksi');
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      console.error('Error fetching transactions:', err);
      setTransactions([]);
      setFilteredTransactions([]);
      setTotalTransactions(0);
      setTotalPages(1);
      setHasNextPage(false);
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
    fetchTransactions();
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
    setPage(1);
  }, [selectedFilter]);

  useEffect(() => {
    fetchTransactions();
    try { 
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
    } catch (e) {
      console.log('Scroll failed:', e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, selectedFilter]);

  const filterTransactions = (transactionList = transactions) => {
    if (selectedFilter === 'all') {
      setFilteredTransactions(transactionList);
    } else {
      const filtered = transactionList.filter(tx => 
        tx.transaction_type === selectedFilter
      );
      setFilteredTransactions(filtered);
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

  const getStatusConfig = (status) => {
    const statusConfig = {
      'Success': { 
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

  const getTxIcon = (type) => {
    switch (type) {
      case 'deposit':
      case 'withdrawal':
        return 'mdi:bank-transfer-out';
      case 'bonus':
        return 'mdi:gift';
      case 'team':
        return 'mdi:account-group';
      case 'return':
        return 'mdi:cash-refund';
      case 'investment':
        return 'mdi:trending-up';
      default:
        return 'mdi:currency-usd';
    }
  };

  const getTxTypeConfig = (type) => {
    switch (type) {
      case 'deposit':
        return { 
          gradient: 'from-green-500 to-green-600', 
          iconBg: 'bg-green-500/20',
          iconColor: 'text-green-400',
          label: 'Isi Ulang'
        };
      case 'withdrawal':
        return { 
          gradient: 'from-red-500 to-red-600', 
          iconBg: 'bg-red-500/20',
          iconColor: 'text-red-400',
          label: 'Penarikan'
        };
      case 'bonus':
        return { 
          gradient: 'from-brand-emerald to-teal-500', 
          iconBg: 'bg-brand-emerald/20',
          iconColor: 'text-brand-emerald',
          label: 'Bonus'
        };
      case 'team':
        return { 
          gradient: 'from-blue-500 to-indigo-600', 
          iconBg: 'bg-blue-500/20',
          iconColor: 'text-blue-400',
          label: 'Tim'
        };
      case 'return':
        return { 
          gradient: 'from-brand-gold to-brand-gold-deep', 
          iconBg: 'bg-brand-gold/20',
          iconColor: 'text-brand-gold',
          label: 'Return'
        };
      case 'investment':
        return { 
          gradient: 'from-brand-gold to-brand-gold-deep', 
          iconBg: 'bg-brand-gold/20',
          iconColor: 'text-brand-gold',
          label: 'Investasi'
        };
      default:
        return { 
          gradient: 'from-gray-500 to-slate-600', 
          iconBg: 'bg-gray-500/20',
          iconColor: 'text-gray-400',
          label: 'Transaksi'
        };
    }
  };

  const calculateStatistics = () => {
    const totalCount = filteredTransactions.length;
    const successfulTransactions = filteredTransactions.filter(tx => tx.status === 'Success');
    
    const totalCredit = successfulTransactions
      .filter(tx => tx.transaction_flow === 'credit')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
      
    const totalDebit = successfulTransactions
      .filter(tx => tx.transaction_flow === 'debit')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    return {
      totalTransactions: totalCount,
      totalCredit,
      totalDebit,
      netBalance: totalCredit - totalDebit
    };
  };

  const handleFilterChange = (filterValue) => {
    setSelectedFilter(filterValue);
    setPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage !== page) {
      setPage(newPage);
    }
  };

  const getPaginationPages = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const stats = calculateStatistics();

  return (
    <div className="min-h-screen bg-brand-black text-white relative overflow-hidden pb-32">
      <Head>
        <title>{applicationData?.name || 'Money Rich'} | Riwayat Transaksi</title>
        <meta name="description" content={`${applicationData?.name || 'Money Rich'} Transaction History`} />
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
            <Icon icon="mdi:swap-horizontal-bold" className="w-4 h-4" />
            Transaction History
            </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">
                Riwayat Transaksi
              </h1>
              <p className="text-sm text-white/60 max-w-2xl mt-2">
                Lacak semua aktivitas keuangan Anda. Pantau setiap transaksi dengan detail lengkap dan real-time.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Icon icon="mdi:shield-check" className="w-4 h-4 text-brand-emerald" />
              Data terlindungi & terenkripsi
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid gap-4 sm:grid-cols-4 mb-8">
          <div className="relative overflow-hidden rounded-3xl border border-brand-gold/25 bg-gradient-to-br from-brand-gold/12 via-brand-surface to-brand-surface-soft p-5 shadow-[0_18px_45px_rgba(5,6,8,0.45)]">
            <div className="absolute -top-16 -right-12 w-40 h-40 rounded-full bg-brand-gold/35 blur-3xl opacity-70"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center">
                  <Icon icon="mdi:counter" className="text-brand-gold w-5 h-5" />
                </div>
                <p className="text-xs uppercase tracking-[0.35em] text-brand-gold/80 font-semibold">Total</p>
              </div>
              <p className="text-3xl font-black text-white">{stats.totalTransactions}</p>
              <p className="text-[11px] text-white/55 mt-2">Transaksi</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-brand-emerald/25 bg-gradient-to-br from-brand-surface via-brand-charcoal to-brand-surface-soft p-5 shadow-[0_18px_45px_rgba(5,6,8,0.45)]">
            <div className="absolute -bottom-16 -left-20 w-44 h-44 rounded-full bg-brand-emerald/30 blur-3xl opacity-60"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-emerald/20 border border-brand-emerald/30 flex items-center justify-center">
                  <Icon icon="mdi:arrow-down-circle" className="text-brand-emerald w-5 h-5" />
                </div>
                <p className="text-xs uppercase tracking-[0.35em] text-brand-emerald/80 font-semibold">Pemasukan</p>
              </div>
              <p className="text-3xl font-black text-brand-emerald">{formatCurrency(stats.totalDebit)}</p>
              <p className="text-[11px] text-white/55 mt-2">Total debit</p>
            </div>
        </div>

          <div className="relative overflow-hidden rounded-3xl border border-red-500/25 bg-gradient-to-br from-brand-surface via-brand-charcoal to-brand-surface-soft p-5 shadow-[0_18px_45px_rgba(5,6,8,0.45)]">
            <div className="absolute -top-16 -right-12 w-40 h-40 rounded-full bg-red-500/20 blur-3xl opacity-60"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                  <Icon icon="mdi:arrow-up-circle" className="text-red-400 w-5 h-5" />
                </div>
                <p className="text-xs uppercase tracking-[0.35em] text-red-400/80 font-semibold">Pengeluaran</p>
              </div>
              <p className="text-3xl font-black text-red-400">{formatCurrency(stats.totalCredit)}</p>
              <p className="text-[11px] text-white/55 mt-2">Total kredit</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-white/4 to-white/[0.02] p-5 shadow-[0_18px_45px_rgba(5,6,8,0.45)]">
            <div className="absolute top-0 right-0 w-28 h-28 bg-brand-gold/10 blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-white/10 flex items-center justify-center">
                  <Icon icon="mdi:scale-balance" className="text-brand-gold w-5 h-5" />
              </div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/45 font-semibold">Saldo Bersih</p>
            </div>
              <p className={`text-3xl font-black ${stats.netBalance >= 0 ? 'text-brand-emerald' : 'text-red-400'}`}>
              {formatCurrency(Math.abs(stats.netBalance))}
            </p>
              <p className="text-[11px] text-white/55 mt-2">{stats.netBalance >= 0 ? 'Surplus' : 'Defisit'}</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange(option.value)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap border ${
                  selectedFilter === option.value
                    ? 'bg-gradient-to-r from-brand-gold to-brand-gold-deep text-brand-black border-transparent shadow-lg shadow-brand-gold/30 scale-105'
                    : 'bg-brand-surface text-white/70 hover:text-white hover:bg-brand-surface-soft border-white/10 hover:scale-102'
                }`}
              >
                <Icon icon={option.icon} className="w-4 h-4" />
                {option.label}
              </button>
            ))}
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

        {/* Transaction List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-3 border-brand-gold/20 border-t-brand-gold"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-brand-gold/40"></div>
            </div>
            <p className="text-white/70 text-sm mt-4">Memuat riwayat transaksi...</p>
          </div>
        ) : filteredTransactions.length === 0 && !error ? (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface-soft/90 p-12 text-center shadow-[0_20px_60px_rgba(5,6,8,0.6)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,193,82,0.1),transparent)]"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-brand-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-brand-gold/20">
                <Icon icon="mdi:database-off" className="text-brand-gold w-10 h-10" />
              </div>
              <h3 className="text-white font-black text-xl mb-3">Belum Ada Transaksi</h3>
              <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
                Tidak ada transaksi untuk filter &quot;{filterOptions.find(f => f.value === selectedFilter)?.label}&quot;. Coba pilih filter lain atau tunggu transaksi baru.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((tx) => {
              const txConfig = getTxTypeConfig(tx.transaction_type);
              return (
                <div key={tx.id} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface-soft/90 p-6 shadow-[0_20px_60px_rgba(5,6,8,0.6)] hover:shadow-[0_25px_70px_rgba(232,193,82,0.2)] transition-all duration-300 hover:scale-[1.01] hover:border-brand-gold/30">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.08),transparent)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${txConfig.gradient} flex items-center justify-center shadow-lg`}>
                          <Icon icon={getTxIcon(tx.transaction_type)} className="text-white w-7 h-7" />
                    </div>
                    <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-white font-black text-base">{txConfig.label}</p>
                            {getStatusBadge(tx.status)}
                          </div>
                      <p className="text-white/60 text-xs font-mono">#{tx.order_id}</p>
                          <p className="text-white/50 text-xs mt-1">
                            {tx.created_at ? formatDate(tx.created_at) : 'Tanggal tidak tersedia'}
                          </p>
                    </div>
                  </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.35em] text-white/45 mb-1">Jumlah</p>
                        <p className={`text-2xl font-black ${tx.transaction_flow === 'debit' ? 'text-brand-emerald' : 'text-red-400'}`}>
                          {tx.transaction_flow === 'debit' ? '+' : '-'}{formatCurrency(tx.amount || 0)}
                        </p>
                      </div>
                </div>

                    {/* Transaction Message */}
                    {tx.message && (
                      <div className="rounded-2xl border border-white/10 bg-brand-black/40 p-4 mb-4">
                  <p className="text-white/80 text-sm leading-relaxed">
                    {tx.message}
                  </p>
                </div>
                    )}

                    {/* Details Grid */}
                    <div className="grid sm:grid-cols-3 gap-4">
                      {/* Transaction Flow */}
                      <div className="rounded-2xl border border-white/10 bg-brand-black/40 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 rounded-lg ${tx.transaction_flow === 'debit' ? 'bg-brand-emerald/20 border border-brand-emerald/30' : 'bg-red-500/20 border border-red-500/30'} flex items-center justify-center`}>
                            <Icon icon={tx.transaction_flow === 'debit' ? 'mdi:arrow-down-circle' : 'mdi:arrow-up-circle'} className={`w-4 h-4 ${tx.transaction_flow === 'debit' ? 'text-brand-emerald' : 'text-red-400'}`} />
                          </div>
                          <p className="text-xs uppercase tracking-[0.35em] text-white/45">Flow</p>
                        </div>
                        <p className={`font-bold text-sm capitalize ${tx.transaction_flow === 'debit' ? 'text-brand-emerald' : 'text-red-400'}`}>
                          {tx.transaction_flow === 'debit' ? 'Pemasukan' : 'Pengeluaran'}
                        </p>
                  </div>
                  
                      {/* Charge */}
                  {(tx.charge || 0) > 0 && (
                        <div className="rounded-2xl border border-white/10 bg-brand-black/40 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                              <Icon icon="mdi:minus-circle" className="text-orange-400 w-4 h-4" />
                            </div>
                            <p className="text-xs uppercase tracking-[0.35em] text-white/45">Biaya</p>
                          </div>
                          <p className="text-orange-400 font-bold text-sm">{formatCurrency(tx.charge || 0)}</p>
                    </div>
                  )}

                      {/* Transaction Type */}
                      <div className="rounded-2xl border border-white/10 bg-brand-black/40 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-8 h-8 rounded-lg ${txConfig.iconBg} border border-white/10 flex items-center justify-center`}>
                            <Icon icon={getTxIcon(tx.transaction_type)} className={`w-4 h-4 ${txConfig.iconColor}`} />
                          </div>
                          <p className="text-xs uppercase tracking-[0.35em] text-white/45">Tipe</p>
                        </div>
                        <p className="text-white font-bold text-sm capitalize">{txConfig.label}</p>
                      </div>
                </div>
                </div>
              </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {filteredTransactions.length > 0 && (
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
                Menampilkan {((page - 1) * limit) + 1} - {Math.min(page * limit, totalTransactions || transactions.length)} dari {totalTransactions || transactions.length} transaksi
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
                {[...Array(Math.min(5, Math.ceil((totalTransactions || transactions.length) / limit) || 1))].map((_, idx) => {
                  const totalPages = Math.ceil((totalTransactions || transactions.length) / limit) || 1;
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
                  const totalPages = Math.ceil((totalTransactions || transactions.length) / limit) || 1;
                  if (page < totalPages) {
                    handlePageChange(page + 1);
                  }
                }}
                disabled={(() => {
                  // Disable if we're on the last page
                  const totalPages = Math.ceil((totalTransactions || transactions.length) / limit) || 1;
                  const isLastPage = page >= totalPages;
                  
                  // Also disable if we got less than limit items (meaning no more pages)
                  const hasLessThanLimit = transactions.length < limit;
                  
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
        
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
