// pages/panel-admin/binary.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import AdminLayout from '../../components/admin/Layout';
import useAdminAuth from '../../lib/auth/useAdminAuth';
import { adminRequest } from '../../utils/admin/api';

export default function BinaryManagement() {
  const { loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    page: 1,
    limit: 25
  });
  const [searchInput, setSearchInput] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0
  });

  useEffect(() => {
    if (authLoading) return;
    loadUsers();
  }, [authLoading, filters]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = [];
      if (filters.page) params.push(`page=${filters.page}`);
      if (filters.limit) params.push(`limit=${filters.limit}`);
      if (filters.search) params.push(`search=${encodeURIComponent(filters.search)}`);
      
      const query = params.length ? `?${params.join('&')}` : '';
      const res = await adminRequest(`/binary${query}`, { method: 'GET' });
      
      if (res && res.success) {
        const usersData = res.data?.users || [];
        const pagination = res.data?.pagination || {};
        
        setUsers(usersData);
        setTotalUsers(pagination.total || usersData.length);
        setTotalPages(Math.ceil((pagination.total || usersData.length) / filters.limit));
        
        // Calculate stats
        setStats({
          total: pagination.total || usersData.length
        });
      } else {
        setUsers([]);
        setTotalUsers(0);
        setTotalPages(1);
        setStats({ total: 0 });
        setError(res?.message || 'Gagal memuat data binary');
      }
    } catch (err) {
      console.error('Error loading binary users:', err);
      setError('Gagal memuat data binary');
      setUsers([]);
      setTotalUsers(0);
      setTotalPages(1);
      setStats({ total: 0 });
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

  const handleViewDetails = (userId) => {
    router.push(`/panel-admin/binary/details/${userId}`);
  };

  const formatNumber = (number) => {
    if (!number) return 'N/A';
    const numStr = String(number);
    if (numStr.startsWith('+62')) return numStr;
    if (numStr.startsWith('62')) return `+${numStr}`;
    if (numStr.startsWith('0')) return `+62${numStr.substring(1)}`;
    return `+62${numStr}`;
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
            <p className="text-white font-medium text-lg">Memuat Data Binary...</p>
            <p className="text-gray-400 text-sm mt-1">Harap tunggu sebentar</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="Kelola Binary">
      <Head>
        <title>Vla Devs | Kelola Binary</title>
        <link rel="icon" type="image/x-icon" href="/vla-logo.png" />
      </Head>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 mb-8">
        <StatCard title="Total User Binary" value={stats.total} icon="mdi:sitemap" color="purple" />
      </div>

      {/* Filter Section */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <Icon icon="mdi:filter-variant" className="text-white w-5 h-5" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">Filter & Pencarian</h2>
            <p className="text-gray-400 text-sm">Cari user berdasarkan nama, nomor, atau ID</p>
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
                placeholder="Cari berdasarkan nama, nomor, atau ID user..."
                className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all dark-select"
              />
              <Icon icon="mdi:magnify" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <button
            onClick={handleSearch}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <Icon icon="mdi:magnify" className="w-5 h-5" />
            Cari User
          </button>
          <button
            onClick={() => {
              setFilters({ search: '', page: 1, limit: 25 });
              setSearchInput('');
            }}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all"
          >
            <Icon icon="mdi:refresh" className="w-5 h-5" />
            Reset Filter
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl mb-6">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:alert-circle" className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:sitemap" className="text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Daftar User Binary</h2>
                <p className="text-gray-400 text-sm">{totalUsers} user ditemukan</p>
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
                <th className="py-4 px-6 text-left text-gray-300 font-medium">ID</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Nama</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Nomor Telepon</th>
                <th className="py-4 px-6 text-center text-gray-300 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 px-6 text-center text-gray-400">
                    {searchInput ? 'Tidak ada user yang ditemukan' : 'Tidak ada data user'}
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.user_id} className={`border-b border-white/5 hover:bg-white/5 transition-all duration-300 ${index % 2 === 0 ? 'bg-white/2' : ''}`}>
                    <td className="py-4 px-6">
                      <div className="text-white font-medium">{user.user_id}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                          <Icon icon="mdi:account" className="text-white w-5 h-5" />
                        </div>
                        <div className="text-white font-medium">{user.user_name || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-white text-sm">{formatNumber(user.user_number)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleViewDetails(user.user_id)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-xl transition-all duration-300 hover:scale-105"
                        >
                          <Icon icon="mdi:eye" className="w-4 h-4" />
                          Lihat Binary
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-white/10 bg-white/2">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-gray-400 text-sm">
                Menampilkan {users.length ? ((filters.page - 1) * filters.limit + 1) : 0} sampai{' '}
                {users.length ? ((filters.page - 1) * filters.limit + users.length) : 0} dari{' '}
                {totalUsers} user
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
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (filters.page <= 3) {
                      pageNum = i + 1;
                    } else if (filters.page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = filters.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handleFilterChange('page', pageNum)}
                        className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                          filters.page === pageNum
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                  disabled={filters.page === totalPages}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-gray-600 text-white rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                >
                  <Icon icon="mdi:chevron-right" className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
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
    orange: { bg: 'from-orange-600 to-red-600', text: 'text-orange-400' },
    cyan: { bg: 'from-cyan-600 to-blue-600', text: 'text-cyan-400' },
    purple: { bg: 'from-purple-600 to-pink-600', text: 'text-purple-400' },
    gray: { bg: 'from-gray-600 to-gray-700', text: 'text-gray-400' }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[color].bg} rounded-xl flex items-center justify-center`}>
          <Icon icon={icon} className="w-6 h-6 text-white" />
        </div>
      </div>
      <div>
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <p className="text-white font-bold text-2xl">{value.toLocaleString('id-ID')}</p>
      </div>
    </div>
  );
}
