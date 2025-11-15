// pages/panel-admin/binary/details/[id].js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import AdminLayout from '../../../../components/admin/Layout';
import useAdminAuth from '../../../../lib/auth/useAdminAuth';
import { adminRequest } from '../../../../utils/admin/api';

export default function BinaryDetails() {
  const { loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const { id } = router.query;
  const [binaryData, setBinaryData] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [modalError, setModalError] = useState('');
  const [selectedReward, setSelectedReward] = useState(null);
  const [showClaimModal, setShowClaimModal] = useState(false);

  useEffect(() => {
    if (authLoading || !id) return;
    loadData();
  }, [authLoading, id]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [binaryRes, rewardsRes] = await Promise.all([
        adminRequest(`/binary/details/${id}`, { method: 'GET' }),
        adminRequest('/rewards', { method: 'GET' }),
      ]);

      if (binaryRes && binaryRes.success) {
        setBinaryData(binaryRes.data);
      } else {
        setError(binaryRes?.message || 'Gagal memuat data binary');
      }

      if (rewardsRes && rewardsRes.success) {
        setRewards(rewardsRes.data?.rewards || []);
      }
    } catch (err) {
      setError('Gagal memuat data binary');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = (reward) => {
    setSelectedReward(reward);
    setModalError('');
    setShowClaimModal(true);
  };

  const confirmClaimReward = async () => {
    if (!selectedReward || !id) return;
    
    setClaiming(true);
    setModalError('');
    setMessage({ text: '', type: '' });
    try {
      const data = await adminRequest('/binary/claim', {
        method: 'POST',
        body: JSON.stringify({
          user_id: parseInt(id),
          reward_id: selectedReward.id,
        }),
      });

      if (data && data.success) {
        setMessage({ text: 'Reward berhasil di-claim! Omset akan di-reset.', type: 'success' });
        setShowClaimModal(false);
        setSelectedReward(null);
        loadData(); // Reload data
        // Clear message after 5 seconds
        setTimeout(() => {
          setMessage({ text: '', type: '' });
        }, 5000);
      } else {
        setModalError(data?.message || 'Gagal claim reward');
      }
    } catch (err) {
      setModalError('Gagal claim reward. Silakan coba lagi.');
    } finally {
      setClaiming(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
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
    <AdminLayout title={`Detail Binary - User ${id}`}>
      <Head>
        <title>Vla Devs | Detail Binary - User {id}</title>
        <link rel="icon" type="image/x-icon" href="/vla-logo.png" />
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/panel-admin/binary')}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 hover:scale-110"
            >
              <Icon icon="mdi:arrow-left" className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Detail Binary Tree</h1>
              <p className="text-gray-400 mt-1">User ID: {id}</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:alert-circle" className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Success/Error Message */}
        {message.text && (
          <div className={`p-4 rounded-2xl border transition-all duration-300 ${
            message.type === 'error' 
              ? 'bg-red-500/20 border-red-500/50 text-red-400' 
              : 'bg-green-500/20 border-green-500/50 text-green-400'
          }`}>
            <div className="flex items-center gap-2">
              <Icon 
                icon={message.type === 'error' ? 'mdi:alert-circle' : 'mdi:check-circle'} 
                className="w-5 h-5" 
              />
              <p className="font-medium">{message.text}</p>
              <button
                onClick={() => setMessage({ text: '', type: '' })}
                className="ml-auto p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Icon icon="mdi:close" className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Omset Overview */}
        {binaryData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Icon icon="mdi:arrow-left-bold" className="text-white w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Omset Kiri</p>
                  <p className="text-white font-bold text-lg">{formatCurrency(binaryData.omset_left || 0)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Icon icon="mdi:arrow-right-bold" className="text-white w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Omset Kanan</p>
                  <p className="text-white font-bold text-lg">{formatCurrency(binaryData.omset_right || 0)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Icon icon="mdi:chart-line" className="text-white w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Omset</p>
                  <p className="text-white font-bold text-lg">{formatCurrency(binaryData.total_omset || 0)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Binary Tree Visualization */}
        {binaryData && (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 overflow-x-auto">
            <div className="min-w-[1200px] pb-8">
              {/* Root Node */}
              <div className="flex justify-center mb-16 relative">
                <div className="relative z-10">
                  <BinaryNode
                    user={binaryData.root}
                    isRoot={true}
                    position=""
                    formatCurrency={formatCurrency}
                  />
                </div>
                {/* Connection lines from root to level 1 */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-[600px] h-16 flex items-start justify-center" style={{ marginTop: '32px' }}>
                  <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
                    <line x1="50%" y1="0" x2="20%" y2="100%" stroke="rgba(232,193,82,0.4)" strokeWidth="2" />
                    <line x1="50%" y1="0" x2="80%" y2="100%" stroke="rgba(232,193,82,0.4)" strokeWidth="2" />
                  </svg>
                </div>
              </div>

              {/* Level 1 */}
              <div className="mb-16 relative">
                <div className="flex justify-center mb-6">
                  <span className="text-purple-400 text-sm font-bold uppercase tracking-wider bg-purple-500/20 px-5 py-2 rounded-full border border-purple-500/30">Level 1</span>
                </div>
                <div className="flex justify-center gap-32 relative">
                  <div className="relative z-10">
                    <BinaryNode
                      user={(binaryData.level1 || []).find(u => u.position === 'left') || null}
                      isRoot={false}
                      position="left"
                      formatCurrency={formatCurrency}
                    />
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-40 h-16 flex items-start justify-center" style={{ marginTop: '24px' }}>
                      <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
                        <line x1="50%" y1="0" x2="25%" y2="100%" stroke="rgba(59,130,246,0.4)" strokeWidth="2" />
                        <line x1="50%" y1="0" x2="75%" y2="100%" stroke="rgba(59,130,246,0.4)" strokeWidth="2" />
                      </svg>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <BinaryNode
                      user={(binaryData.level1 || []).find(u => u.position === 'right') || null}
                      isRoot={false}
                      position="right"
                      formatCurrency={formatCurrency}
                    />
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-40 h-16 flex items-start justify-center" style={{ marginTop: '24px' }}>
                      <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
                        <line x1="50%" y1="0" x2="25%" y2="100%" stroke="rgba(34,197,94,0.4)" strokeWidth="2" />
                        <line x1="50%" y1="0" x2="75%" y2="100%" stroke="rgba(34,197,94,0.4)" strokeWidth="2" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Level 2 */}
              <div className="mb-16 relative">
                <div className="flex justify-center mb-6">
                  <span className="text-purple-400 text-sm font-bold uppercase tracking-wider bg-purple-500/20 px-5 py-2 rounded-full border border-purple-500/30">Level 2</span>
                </div>
                <div className="flex justify-center gap-10">
                  {Array.from({ length: 4 }, (_, idx) => {
                    const level2Users = binaryData.level2 || [];
                    let user = null;
                    let position = '';
                    
                    if (idx < 2) {
                      position = 'left';
                      const leftUsers = level2Users.filter(u => u.position === 'left');
                      user = leftUsers[idx] || null;
                    } else {
                      position = 'right';
                      const rightUsers = level2Users.filter(u => u.position === 'right');
                      user = rightUsers[idx - 2] || null;
                    }
                    
                    return (
                      <div key={idx} className="relative z-10">
                        <BinaryNode
                          user={user}
                          isRoot={false}
                          position={position}
                          formatCurrency={formatCurrency}
                        />
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-24 h-16 flex items-start justify-center" style={{ marginTop: '32px' }}>
                          <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
                            <line x1="50%" y1="0" x2="25%" y2="100%" stroke={idx < 2 ? "rgba(59,130,246,0.4)" : "rgba(34,197,94,0.4)"} strokeWidth="2" />
                            <line x1="50%" y1="0" x2="75%" y2="100%" stroke={idx < 2 ? "rgba(59,130,246,0.4)" : "rgba(34,197,94,0.4)"} strokeWidth="2" />
                          </svg>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Level 3 */}
              <div>
                <div className="flex justify-center mb-6">
                  <span className="text-purple-400 text-sm font-bold uppercase tracking-wider bg-purple-500/20 px-5 py-2 rounded-full border border-purple-500/30">Level 3</span>
                </div>
                <div className="flex justify-center gap-3">
                  {Array.from({ length: 8 }, (_, idx) => {
                    const level3Users = binaryData.level3 || [];
                    let user = null;
                    let position = '';
                    
                    if (idx < 4) {
                      position = 'left';
                      const leftUsers = level3Users.filter(u => u.position === 'left');
                      user = leftUsers[idx] || null;
                    } else {
                      position = 'right';
                      const rightUsers = level3Users.filter(u => u.position === 'right');
                      user = rightUsers[idx - 4] || null;
                    }
                    
                    return (
                      <div key={idx} className="flex-1 flex justify-center" style={{ minWidth: '144px', maxWidth: '160px' }}>
                        <BinaryNode
                          user={user}
                          isRoot={false}
                          position={position}
                          formatCurrency={formatCurrency}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rewards Section */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-xl flex items-center justify-center">
              <Icon icon="mdi:trophy" className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Rewards</h2>
              <p className="text-gray-400 text-sm">Kelola reward untuk user ini</p>
            </div>
          </div>
          <div className="space-y-4">
            {rewards.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Tidak ada rewards</p>
              </div>
            ) : (
              rewards.map((reward) => {
                const canClaim = (binaryData?.total_omset || 0) >= (reward.omset_target || 0);
                return (
                  <div key={reward.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-all duration-300">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-2">{reward.name}</h3>
                      <p className="text-sm text-gray-400 mb-2">{reward.reward_desc}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Target: </span>
                          <span className="text-white font-medium">{formatCurrency(reward.omset_target)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Durasi: </span>
                          <span className="text-white font-medium">{reward.duration} hari</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Status: </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            reward.status === 'Active' 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}>
                            {reward.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-gray-400 text-sm">Total Omset User: </span>
                        <span className="text-white font-medium">{formatCurrency(binaryData?.total_omset || 0)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleClaimReward(reward)}
                      disabled={!canClaim || reward.status !== 'Active'}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ml-4 ${
                        canClaim && reward.status === 'Active'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-105'
                          : 'bg-white/10 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon icon="mdi:trophy" className="w-4 h-4" />
                        Claim Reward
                      </div>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      {showClaimModal && selectedReward && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl w-full max-w-md border border-white/20 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-xl flex items-center justify-center">
                  <Icon icon="mdi:trophy" className="text-white w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Konfirmasi Claim Reward</h3>
                  <p className="text-gray-400 text-sm">Tindakan ini akan mereset omset user</p>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reward:</span>
                    <span className="text-white font-medium">{selectedReward.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Target Omset:</span>
                    <span className="text-white font-medium">{formatCurrency(selectedReward.omset_target)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Omset User:</span>
                    <span className="text-white font-medium">{formatCurrency(binaryData?.total_omset || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">User ID:</span>
                    <span className="text-white font-medium font-mono">{id}</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-4 mb-6">
                <div className="flex items-start gap-2">
                  <Icon icon="mdi:alert" className="text-yellow-400 w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p className="text-yellow-400 text-sm">
                    Setelah di-claim, omset user akan di-reset secara otomatis. Pastikan reward telah diberikan secara manual.
                  </p>
                </div>
              </div>

              {modalError && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl mb-6">
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:alert-circle" className="w-4 h-4" />
                    <span className="text-sm">{modalError}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowClaimModal(false);
                    setSelectedReward(null);
                    setModalError('');
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
                  disabled={claiming}
                >
                  <Icon icon="mdi:close" className="w-4 h-4" />
                  Batal
                </button>
                <button
                  onClick={confirmClaimReward}
                  disabled={claiming}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon icon={claiming ? 'mdi:loading' : 'mdi:check'} className={`w-4 h-4 ${claiming ? 'animate-spin' : ''}`} />
                  {claiming ? 'Claiming...' : 'Ya, Claim Reward'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// Binary Node Component - Admin Theme
function BinaryNode({ user, isRoot, position, formatCurrency }) {
  const isEmpty = !user && !isRoot;
  
  const positionColor = isRoot
    ? 'from-purple-600 to-pink-600'
    : position === 'left' 
    ? 'from-blue-600 to-cyan-600' 
    : position === 'right'
    ? 'from-green-600 to-emerald-600'
    : 'from-gray-600 to-gray-700';

  if (isEmpty) {
    return (
      <div className="w-36 h-32 bg-white/5 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center relative">
        {position && (
          <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white/50 shadow-lg z-20 ${
            position === 'left' ? 'bg-blue-600/50' : 'bg-green-600/50'
          }`}>
            {position === 'left' ? 'L' : 'R'}
          </div>
        )}
        <Icon icon="mdi:account-off" className="text-gray-400 w-10 h-10 mb-2" />
        <p className="text-gray-400 text-xs text-center px-2 font-medium">Kosong</p>
      </div>
    );
  }

  const formatOmset = (omset) => {
    const amount = omset === undefined || omset === null ? 0 : omset;
    return formatCurrency(amount);
  };

  return (
    <div className={`relative ${isRoot ? 'w-40' : 'w-36'} ${isRoot ? 'h-40' : 'h-32'} bg-gradient-to-br ${positionColor} rounded-xl border-2 ${isRoot ? 'border-purple-500' : 'border-white/30'} flex flex-col items-center p-3 shadow-lg hover:scale-105 transition-transform duration-300`}>
      {/* Badge position - top-right corner */}
      {isRoot && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg z-20">
          <Icon icon="mdi:crown" className="text-white w-3.5 h-3.5" />
        </div>
      )}
      {!isRoot && position && (
        <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-lg z-20 ${
          position === 'left' ? 'bg-blue-600' : 'bg-green-600'
        }`}>
          {position === 'left' ? 'L' : 'R'}
        </div>
      )}
      
      {/* Content area - ensuring name is not covered */}
      <div className="flex flex-col items-center justify-center w-full h-full pt-1 pb-2">
        {/* Avatar Icon */}
        <div className={`w-12 h-12 ${isRoot ? 'w-14 h-14' : ''} bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-2 border-2 border-white border-opacity-30 flex-shrink-0`}>
          <Icon icon="mdi:account" className={`text-white ${isRoot ? 'w-7 h-7' : 'w-6 h-6'}`} />
        </div>
        
        {/* Name - centered, with padding to avoid badge */}
        <div className="w-full mb-1.5 flex items-center justify-center min-h-[36px] max-h-[44px] px-3" style={{ paddingRight: '36px', paddingLeft: '12px' }}>
          <p className={`text-white ${isRoot ? 'text-sm' : 'text-xs'} font-bold text-center leading-snug w-full`} style={{ 
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordBreak: 'break-word',
            lineHeight: '1.4',
            maxWidth: '100%'
          }}>
            {user?.name || 'N/A'}
          </p>
        </div>
        
        {/* Phone number */}
        {user?.number && (
          <p className="text-white text-opacity-80 text-[9px] text-center mb-2 leading-tight">
            +62{user.number}
          </p>
        )}
        
        {/* Omset - at bottom */}
        <div className="mt-auto w-full px-2">
          <p className={`text-white text-opacity-95 text-[10px] font-semibold text-center px-2 py-1.5 rounded-full ${
            (user?.omset || 0) > 0 ? 'bg-white bg-opacity-25 text-white' : 'bg-white bg-opacity-10 text-white text-opacity-70'
          }`}>
            {formatOmset(user?.omset)}
          </p>
        </div>
      </div>
    </div>
  );
}
