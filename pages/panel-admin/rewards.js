// pages/panel-admin/rewards.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Icon } from '@iconify/react';
import AdminLayout from '../../components/admin/Layout';
import useAdminAuth from '../../lib/auth/useAdminAuth';
import { adminRequest } from '../../utils/admin/api';

export default function RewardsManagement() {
  const { loading: authLoading } = useAdminAuth();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    omset_target: '',
    reward_desc: '',
    duration: '',
    is_accumulative: false,
    status: 'Active',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  useEffect(() => {
    if (authLoading) return;
    loadRewards();
  }, [authLoading]);

  const loadRewards = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminRequest('/rewards', { method: 'GET' });
      if (data && data.success) {
        const rewardsList = data.data?.rewards || [];
        setRewards(rewardsList);
        setStats({
          total: rewardsList.length,
          active: rewardsList.filter(r => r.status === 'Active').length,
          inactive: rewardsList.filter(r => r.status === 'Inactive').length,
        });
      } else {
        setError(data?.message || 'Gagal memuat data rewards');
        setRewards([]);
        setStats({ total: 0, active: 0, inactive: 0 });
      }
    } catch (err) {
      console.error('Error loading rewards:', err);
      setError('Gagal memuat data rewards');
      setRewards([]);
      setStats({ total: 0, active: 0, inactive: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (reward) => {
    setSelectedReward(reward);
    setForm({
      name: reward.name || '',
      omset_target: reward.omset_target || '',
      reward_desc: reward.reward_desc || '',
      duration: reward.duration || '',
      is_accumulative: reward.is_accumulative || false,
      status: reward.status || 'Active',
    });
    setShowModal(true);
    setError(null);
  };

  const handleAdd = () => {
    setSelectedReward(null);
    setForm({
      name: '',
      omset_target: '',
      reward_desc: '',
      duration: '',
      is_accumulative: false,
      status: 'Active',
    });
    setShowModal(true);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus reward ini?')) return;

    try {
      const data = await adminRequest(`/rewards/${id}`, { method: 'DELETE' });
      if (data && data.success) {
        alert('Reward berhasil dihapus');
        loadRewards();
      } else {
        alert(data?.message || 'Gagal menghapus reward');
      }
    } catch (err) {
      console.error('Error deleting reward:', err);
      alert('Gagal menghapus reward');
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.omset_target || !form.reward_desc || !form.duration) {
      setError('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        omset_target: parseInt(form.omset_target),
        reward_desc: form.reward_desc,
        duration: parseInt(form.duration),
        is_accumulative: form.is_accumulative,
        status: form.status,
      };

      let data;
      if (selectedReward) {
        // Update
        data = await adminRequest('/rewards', {
          method: 'PUT',
          body: JSON.stringify({
            id: selectedReward.id,
            ...payload,
          }),
        });
      } else {
        // Create
        data = await adminRequest('/rewards', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      if (data && data.success) {
        alert(selectedReward ? 'Reward berhasil di-update' : 'Reward berhasil dibuat');
        setShowModal(false);
        setSelectedReward(null);
        loadRewards();
      } else {
        setError(data?.message || 'Gagal menyimpan reward');
      }
    } catch (err) {
      console.error('Error saving reward:', err);
      setError('Gagal menyimpan reward');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
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

  const getStatusBadge = (status) => {
    if (status === 'Active') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-green-500/20 text-green-400 border-green-500/30">
          Aktif
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium border bg-gray-500/20 text-gray-400 border-gray-500/30">
        Tidak Aktif
      </span>
    );
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
            <p className="text-white font-medium text-lg">Memuat Data Rewards...</p>
            <p className="text-gray-400 text-sm mt-1">Harap tunggu sebentar</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="Kelola Rewards">
      <Head>
        <title>Vla Devs | Kelola Rewards</title>
        <link rel="icon" type="image/x-icon" href="/vla-logo.png" />
      </Head>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="Total Rewards" value={stats.total} icon="mdi:trophy" color="orange" />
        <StatCard title="Aktif" value={stats.active} icon="mdi:check-circle" color="green" />
        <StatCard title="Tidak Aktif" value={stats.inactive} icon="mdi:close-circle" color="gray" />
      </div>

      {/* Header & Add Button */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-xl flex items-center justify-center">
              <Icon icon="mdi:trophy" className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">Kelola Rewards</h2>
              <p className="text-gray-400 text-sm">Kelola reward binary tree</p>
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <Icon icon="mdi:plus" className="w-5 h-5" />
            Tambah Reward
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && !showModal && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl mb-6">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:alert-circle" className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Rewards Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-xl flex items-center justify-center">
              <Icon icon="mdi:trophy" className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">Daftar Rewards</h2>
              <p className="text-gray-400 text-sm">{stats.total} reward ditemukan</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="py-4 px-6 text-left text-gray-300 font-medium">ID</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Nama</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Deskripsi</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Target Omset</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Durasi</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Accumulative</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Status</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Created At</th>
                <th className="py-4 px-6 text-center text-gray-300 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rewards.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 px-6 text-center text-gray-400">
                    Tidak ada data rewards
                  </td>
                </tr>
              ) : (
                rewards.map((reward, index) => (
                  <tr key={reward.id} className={`border-b border-white/5 hover:bg-white/5 transition-all duration-300 ${index % 2 === 0 ? 'bg-white/2' : ''}`}>
                    <td className="py-4 px-6">
                      <div className="text-white font-medium">{reward.id}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-white font-medium">{reward.name}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-white text-sm max-w-xs truncate">{reward.reward_desc}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-white font-medium">{formatCurrency(reward.omset_target)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-white text-sm">{reward.duration} hari</div>
                    </td>
                    <td className="py-4 px-6">
                      {reward.is_accumulative ? (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">Ya</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium">Tidak</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(reward.status)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-white text-sm">{formatDate(reward.created_at)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(reward)}
                          className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl transition-all duration-300 hover:scale-110"
                          title="Edit"
                        >
                          <Icon icon="mdi:pencil" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(reward.id)}
                          className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl transition-all duration-300 hover:scale-110"
                          title="Hapus"
                        >
                          <Icon icon="mdi:delete" className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl w-full max-w-2xl border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-xl flex items-center justify-center">
                  <Icon icon={selectedReward ? 'mdi:pencil' : 'mdi:plus'} className="text-white w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {selectedReward ? 'Edit Reward' : 'Tambah Reward'}
                  </h3>
                  <p className="text-gray-400 text-sm">Kelola informasi reward</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Nama Reward *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Nama Reward"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Deskripsi Reward *
                  </label>
                  <input
                    type="text"
                    value={form.reward_desc}
                    onChange={(e) => setForm({ ...form, reward_desc: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Deskripsi Reward"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Target Omset *
                  </label>
                  <input
                    type="number"
                    value={form.omset_target}
                    onChange={(e) => setForm({ ...form, omset_target: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Target Omset"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Durasi (hari) *
                  </label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Durasi dalam hari"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all dark-select"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="bg-white/5 rounded-2xl p-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_accumulative}
                      onChange={(e) => setForm({ ...form, is_accumulative: e.target.checked })}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-white text-sm font-medium">Accumulative</span>
                  </label>
                  <p className="text-gray-400 text-xs mt-2 ml-6">
                    Jika aktif, omset akan terakumulasi dari periode sebelumnya
                  </p>
                </div>
              </div>

              {error && (
                <div className="mt-4 bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl text-sm">
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:alert-circle" className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedReward(null);
                    setError(null);
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
                  disabled={saving}
                >
                  <Icon icon="mdi:close" className="w-4 h-4" />
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon icon={saving ? 'mdi:loading' : 'mdi:check'} className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
                  {saving ? 'Menyimpan...' : 'Simpan'}
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
    orange: { bg: 'from-orange-600 to-yellow-600', text: 'text-orange-400' },
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
