// pages/panel-admin/deposits.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import AdminLayout from '../../components/admin/Layout';
import useAdminAuth from '../../lib/auth/useAdminAuth';
import { adminRequest } from '../../utils/admin/api';

export default function DepositManagement() {
  const { loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    page: 1,
    limit: 25
  });
  const [searchInput, setSearchInput] = useState('');
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    success: 0,
    rejected: 0,
    failed: 0,
    expired: 0
  });

  useEffect(() => {
    if (authLoading) return;
    loadDeposits();
  }, [authLoading, filters]);

  const loadDeposits = async () => {
    setLoading(true);
    try {
      const params = [];
      if (filters.page) params.push(`page=${filters.page}`);
      if (filters.limit) params.push(`limit=${filters.limit}`);
      if (filters.status && filters.status !== 'all') params.push(`status=${filters.status}`);
      if (filters.search) params.push(`search=${encodeURIComponent(filters.search)}`);
      
      const query = params.length ? `?${params.join('&')}` : '';
      const res = await adminRequest(`/deposits${query}`, { method: 'GET' });
      
      if (res && res.success && res.data) {
        const depositsData = res.data.deposits || [];
        const pagination = res.data.pagination || {};
        
        setDeposits(depositsData);
        setTotalDeposits(pagination.total || depositsData.length);
        setTotalPages(Math.ceil((pagination.total || depositsData.length) / filters.limit));
        
        // Calculate stats
        const statsData = depositsData.reduce((acc, deposit) => {
          acc.total++;
          const status = deposit.status.toLowerCase();
          if (acc[status] !== undefined) acc[status]++;
          return acc;
        }, { total: 0, pending: 0, success: 0, rejected: 0, failed: 0, expired: 0 });
        setStats(statsData);
      } else {
        setDeposits([]);
        setTotalDeposits(0);
        setTotalPages(1);
        setStats({ total: 0, pending: 0, success: 0, rejected: 0, failed: 0, expired: 0 });
      }
    } catch (error) {
      console.error('Failed to load deposits:', error);
      setDeposits([]);
      setTotalDeposits(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value, page: field === 'page' ? value : 1 }));
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleAction = (deposit, type) => {
    setSelectedDeposit(deposit);
    setActionType(type);
    setShowActionModal(true);
  };

  const confirmAction = async () => {
    if (!selectedDeposit) return;
    
    try {
      const endpoint = `/deposits/${selectedDeposit.id}/${actionType}`;
      const res = await adminRequest(endpoint, {
        method: 'PUT'
      });
      
      if (res && res.success) {
        loadDeposits(); // Reload data
        setShowActionModal(false);
      }
    } catch (error) {
      console.error('Failed to process deposit action:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Menunggu' },
      success: { class: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Berhasil' },
      rejected: { class: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Ditolak' },
      failed: { class: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Ditolak' },
      expired: { class: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: 'Kedaluwarsa' }
    };
    
    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const getAvailableActions = (deposit) => {
    const actionMap = {
      pending: [
        { type: 'approve', label: 'Setujui', icon: 'mdi:check', color: 'text-green-400' },
        { type: 'reject', label: 'Tolak', icon: 'mdi:close', color: 'text-red-400' }
      ],
      success: [],
      rejected: [],
      failed: [],
      expired: []
    };
    
    return actionMap[deposit.status.toLowerCase()] || [];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodLabel = (method, channel) => {
    if (method === 'QRIS') return 'QRIS';
    if (method === 'BANK' && channel) return `BANK - ${channel}`;
    return method || 'N/A';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-400 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-white font-medium text-lg">Memuat Data Deposit...</p>
            <p className="text-gray-400 text-sm mt-1">Harap tunggu sebentar</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="Kelola Deposit">
      <Head>
        <title>Vla Devs | Kelola Deposit</title>
        <link rel="icon" type="image/x-icon" href="/vla-logo.png" />
      </Head>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Total Deposit" value={stats.total} icon="mdi:wallet" color="blue" />
        <StatCard title="Menunggu" value={stats.pending} icon="mdi:clock-alert" color="yellow" />
        <StatCard title="Berhasil" value={stats.success} icon="mdi:check-circle" color="green" />
        <StatCard title="Ditolak" value={stats.rejected} icon="mdi:close-circle" color="red" />
        <StatCard title="Ditolak" value={stats.failed} icon="mdi:close-circle" color="red" />
        <StatCard title="Kedaluwarsa" value={stats.expired} icon="mdi:timer-off" color="gray" />
      </div>

      {/* Filter Section */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <Icon icon="mdi:filter-variant" className="text-white w-5 h-5" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">Filter & Pencarian</h2>
            <p className="text-gray-400 text-sm">Cari dan filter deposit berdasarkan kriteria</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm text-gray-400 mb-2">Pencarian</label>
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Cari berdasarkan Order ID..."
                className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all dark-select"
              />
              <Icon icon="mdi:magnify" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Status</label>
            <select 
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all dark-select"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="success">Berhasil</option>
              <option value="rejected">Ditolak</option>
              <option value="failed">Ditolak</option>
              <option value="expired">Kedaluwarsa</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <button
            onClick={handleSearch}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <Icon icon="mdi:magnify" className="w-5 h-5" />
            Cari Deposit
          </button>
          <button
            onClick={() => {
              setFilters({ search: '', status: 'all', page: 1, limit: 25 });
              setSearchInput('');
            }}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all"
          >
            <Icon icon="mdi:refresh" className="w-5 h-5" />
            Reset Filter
          </button>
        </div>
      </div>

      {/* Deposits Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:wallet" className="text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Daftar Deposit</h2>
                <p className="text-gray-400 text-sm">{totalDeposits} deposit ditemukan</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Tampilkan:</span>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
                className="bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark-select"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={75}>75</option>
                <option value={100}>100</option>
              </select>
              <span className="text-gray-400 text-sm">per halaman</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Pengguna</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Order ID</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Jumlah</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Metode Pembayaran</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Status</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Tanggal</th>
                <th className="py-4 px-6 text-center text-gray-300 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((deposit, index) => (
                <tr key={deposit.id} className={`border-b border-white/5 hover:bg-white/5 transition-all duration-300 ${index % 2 === 0 ? 'bg-white/2' : ''}`}>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                        <Icon icon="mdi:account" className="text-white w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{deposit.user_name || `User ${deposit.user_id}`}</p>
                        <p className="text-gray-400 text-sm">{deposit.phone ? `+62${deposit.phone}` : 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-white font-medium font-mono text-sm">{deposit.order_id}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-white font-medium">{formatCurrency(deposit.amount)}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-white text-sm">{getPaymentMethodLabel(deposit.payment_method, deposit.payment_channel)}</div>
                    {deposit.payment_code && (
                      <div className="text-gray-400 text-xs font-mono mt-1">{deposit.payment_code.substring(0, 20)}...</div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(deposit.status)}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-white text-sm">{formatDate(deposit.created_at)}</div>
                    {deposit.expired_at && deposit.status === 'Pending' && (
                      <div className="text-gray-400 text-xs mt-1">
                        Expired: {formatDate(deposit.expired_at)}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      {getAvailableActions(deposit).map((action) => (
                        <button
                          key={action.type}
                          onClick={() => handleAction(deposit, action.type)}
                          className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${action.color} bg-current bg-opacity-20 hover:bg-opacity-30`}
                          title={action.label}
                        >
                          <Icon icon={action.icon} className="w-4 h-4 text-white" />
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-white/10 bg-white/2">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              Menampilkan {deposits.length ? ((filters.page - 1) * filters.limit + 1) : 0} sampai{' '}
              {deposits.length ? ((filters.page - 1) * filters.limit + deposits.length) : 0} dari{' '}
              {totalDeposits} deposit
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                disabled={filters.page === 1}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-gray-600 text-white rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
              >
                <Icon icon="mdi:chevron-left" className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1">
                <button
                  className={`w-10 h-10 rounded-xl transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 text-white`}
                  disabled
                >
                  {filters.page}
                </button>
              </div>
              
              <button
                onClick={() => handleFilterChange('page', filters.page + 1)}
                disabled={deposits.length < filters.limit}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-gray-600 text-white rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
              >
                <Icon icon="mdi:chevron-right" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Confirmation Modal */}
      {showActionModal && selectedDeposit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl w-full max-w-md border border-white/20 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  actionType === 'approve'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                    : 'bg-gradient-to-r from-red-600 to-pink-600'
                }`}>
                  <Icon 
                    icon={actionType === 'approve' ? 'mdi:check' : 'mdi:close'}
                    className="text-white w-5 h-5" 
                  />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    Konfirmasi {actionType === 'approve' ? 'Persetujuan' : 'Penolakan'}
                  </h3>
                  <p className="text-gray-400 text-sm">Tindakan ini akan mengubah status deposit</p>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pengguna:</span>
                    <span className="text-white font-medium">{selectedDeposit.user_name || `User ${selectedDeposit.user_id}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Jumlah:</span>
                    <span className="text-white font-medium">{formatCurrency(selectedDeposit.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Order ID:</span>
                    <span className="text-white font-medium font-mono">{selectedDeposit.order_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Metode:</span>
                    <span className="text-white font-medium">{getPaymentMethodLabel(selectedDeposit.payment_method, selectedDeposit.payment_channel)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
                >
                  <Icon icon="mdi:close" className="w-4 h-4" />
                  Batal
                </button>
                <button
                  onClick={confirmAction}
                  className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                    actionType === 'approve'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                      : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'
                  } text-white`}
                >
                  <Icon 
                    icon={actionType === 'approve' ? 'mdi:check' : 'mdi:close'}
                    className="w-4 h-4" 
                  />
                  Konfirmasi {actionType === 'approve' ? 'Setuju' : 'Tolak'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// Stats Card Component
function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: { bg: 'from-blue-600 to-cyan-600', text: 'text-blue-400' },
    green: { bg: 'from-green-600 to-emerald-600', text: 'text-green-400' },
    yellow: { bg: 'from-yellow-600 to-orange-600', text: 'text-yellow-400' },
    red: { bg: 'from-red-600 to-pink-600', text: 'text-red-400' },
    gray: { bg: 'from-gray-600 to-slate-600', text: 'text-gray-400' }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[color].bg} rounded-xl flex items-center justify-center`}>
          <Icon icon={icon} className="w-6 h-6 text-white" />
        </div>
      </div>
      <div>
        <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>
        <div className="text-2xl font-bold text-white">{value.toLocaleString('id-ID')}</div>
      </div>
    </div>
  );
}

