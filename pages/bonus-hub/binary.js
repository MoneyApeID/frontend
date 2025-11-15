// pages/binary.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { getBinaryStructure, getBinaryOmset, getRewards } from '../../utils/api';
import BottomNavbar from '../../components/BottomNavbar';
import Copyright from '../../components/copyright';

export default function BinaryTree() {
  const router = useRouter();
  const [applicationData, setApplicationData] = useState(null);
  const [binaryData, setBinaryData] = useState(null);
  const [omsetData, setOmsetData] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tree'); // 'tree' or 'rewards'
  const [error, setError] = useState(null);

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
          company: parsed.company || 'Money Rich Holdings',
          link_cs: parsed.link_cs || '',
        });
      } catch (e) {
        setApplicationData({ name: 'Money Rich', company: 'Money Rich Holdings', link_cs: '' });
      }
    } else {
      setApplicationData({ name: 'Money Rich', company: 'Money Rich Holdings', link_cs: '' });
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [structureRes, omsetRes, rewardsRes] = await Promise.all([
        getBinaryStructure(),
        getBinaryOmset(),
        getRewards(),
      ]);

      if (structureRes?.success) {
        setBinaryData(structureRes.data);
      }
      if (omsetRes?.success) {
        setOmsetData(omsetRes.data);
      }
      if (rewardsRes?.success) {
        setRewards(rewardsRes.data?.rewards || []);
      }
    } catch (err) {
      console.error('Error loading binary data:', err);
      setError('Gagal memuat data binary');
    } finally {
      setLoading(false);
    }
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
    });
  };

  const handleClaimReward = (reward) => {
    if (reward.is_completed && !reward.is_claimed && applicationData?.link_cs) {
      window.open(applicationData.link_cs, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black text-white relative overflow-hidden pb-32 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-3 border-brand-gold/20 border-t-brand-gold"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-brand-gold/40"></div>
          </div>
          <p className="text-white/70 text-sm mt-4">Memuat data binary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black text-white relative overflow-hidden pb-32">
      <Head>
        <title>{applicationData?.name || 'Money Rich'} | Binary Tree</title>
        <meta name="description" content={`${applicationData?.name || 'Money Rich'} Binary Tree`} />
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
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center bg-brand-surface hover:bg-brand-surface-soft rounded-xl transition-all duration-300 border border-white/10"
          >
            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-black text-xl">Binary Tree</h1>
            <p className="text-white/60 text-xs">Struktur Binary Kiri Kanan</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-8 pb-24">
        {/* Tabs */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-2 border border-white/10 mb-8">
          <div className="flex">
            <button
              onClick={() => setActiveTab('tree')}
              className={`flex-1 px-6 py-4 font-medium text-sm rounded-2xl transition-all duration-300 ${
                activeTab === 'tree'
                  ? 'bg-gradient-to-r from-brand-gold to-brand-gold-deep text-brand-black shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon icon="mdi:sitemap" className="inline mr-2 w-5 h-5" />
              Struktur Binary
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex-1 px-6 py-4 font-medium text-sm rounded-2xl transition-all duration-300 ${
                activeTab === 'rewards'
                  ? 'bg-gradient-to-r from-brand-gold to-brand-gold-deep text-brand-black shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon icon="mdi:trophy" className="inline mr-2 w-5 h-5" />
              Rewards
            </button>
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

        {/* Binary Tree Tab */}
        {activeTab === 'tree' && (
          <div className="space-y-8">
            {/* Omset Overview */}
            {omsetData && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
                      <Icon icon="mdi:arrow-left-bold" className="text-white w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Omset Kiri</p>
                      <p className="text-white font-black text-lg">{formatCurrency(omsetData.omset_left || 0)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">
                      <Icon icon="mdi:arrow-right-bold" className="text-white w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Omset Kanan</p>
                      <p className="text-white font-black text-lg">{formatCurrency(omsetData.omset_right || 0)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-brand-gold to-brand-gold-deep flex items-center justify-center">
                      <Icon icon="mdi:chart-line" className="text-white w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Total Omset</p>
                      <p className="text-white font-black text-lg">{formatCurrency(omsetData.total_omset || 0)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                      <Icon icon="mdi:account-group" className="text-white w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Total Member</p>
                      <p className="text-white font-black text-lg">
                        {(omsetData.level1_count || 0) + (omsetData.level2_count || 0) + (omsetData.level3_count || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Binary Tree Visualization */}
            {binaryData && (
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 overflow-x-auto">
                <div className="min-w-[1200px] pb-8">
                  {/* Root Node */}
                  <div className="flex justify-center mb-16 relative">
                    <div className="relative z-10">
                      <BinaryNode
                        user={binaryData.root}
                        isRoot={true}
                        position=""
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

                  {/* Level 1 - Always show 2 nodes */}
                  <div className="mb-16 relative">
                    <div className="flex justify-center mb-6">
                      <span className="text-brand-gold text-sm font-bold uppercase tracking-wider bg-brand-black/70 px-5 py-2 rounded-full border border-brand-gold/30">Level 1</span>
                    </div>
                    <div className="flex justify-center gap-32 relative">
                      {/* Left node */}
                      <div className="relative z-10">
                        <BinaryNode
                          user={(binaryData.level1 || []).find(u => u.position === 'left') || null}
                          isRoot={false}
                          position="left"
                        />
                        {/* Connection lines to Level 2 (left side) */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-40 h-16 flex items-start justify-center" style={{ marginTop: '24px' }}>
                          <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
                            <line x1="50%" y1="0" x2="25%" y2="100%" stroke="rgba(59,130,246,0.4)" strokeWidth="2" />
                            <line x1="50%" y1="0" x2="75%" y2="100%" stroke="rgba(59,130,246,0.4)" strokeWidth="2" />
                          </svg>
                        </div>
                      </div>
                      {/* Right node */}
                      <div className="relative z-10">
                        <BinaryNode
                          user={(binaryData.level1 || []).find(u => u.position === 'right') || null}
                          isRoot={false}
                          position="right"
                        />
                        {/* Connection lines to Level 2 (right side) */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-40 h-16 flex items-start justify-center" style={{ marginTop: '24px' }}>
                          <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
                            <line x1="50%" y1="0" x2="25%" y2="100%" stroke="rgba(34,197,94,0.4)" strokeWidth="2" />
                            <line x1="50%" y1="0" x2="75%" y2="100%" stroke="rgba(34,197,94,0.4)" strokeWidth="2" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Level 2 - Always show 4 nodes */}
                  <div className="mb-16 relative">
                    <div className="flex justify-center mb-6">
                      <span className="text-brand-gold text-sm font-bold uppercase tracking-wider bg-brand-black/70 px-5 py-2 rounded-full border border-brand-gold/30">Level 2</span>
                    </div>
                    <div className="flex justify-center gap-10">
                      {/* Level 2: 2 left nodes, 2 right nodes */}
                      {Array.from({ length: 4 }, (_, idx) => {
                        const level2Users = binaryData.level2 || [];
                        let user = null;
                        let position = '';
                        
                        if (idx < 2) {
                          // First 2 are left side (under left level1)
                          position = 'left';
                          const leftUsers = level2Users.filter(u => u.position === 'left');
                          user = leftUsers[idx] || null;
                        } else {
                          // Last 2 are right side (under right level1)
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
                            />
                            {/* Connection lines to Level 3 */}
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

                  {/* Level 3 - Always show 8 nodes */}
                  <div>
                    <div className="flex justify-center mb-6">
                      <span className="text-brand-gold text-sm font-bold uppercase tracking-wider bg-brand-black/70 px-5 py-2 rounded-full border border-brand-gold/30">Level 3</span>
                    </div>
                    <div className="flex justify-center gap-3">
                      {Array.from({ length: 8 }, (_, idx) => {
                        const level3Users = binaryData.level3 || [];
                        let user = null;
                        let position = '';
                        
                        if (idx < 4) {
                          // First 4 are left side
                          position = 'left';
                          const leftUsers = level3Users.filter(u => u.position === 'left');
                          user = leftUsers[idx] || null;
                        } else {
                          // Last 4 are right side
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
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div className="space-y-6">
            {rewards.length === 0 ? (
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface-soft/90 p-12 text-center shadow-[0_20px_60px_rgba(5,6,8,0.6)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,193,82,0.1),transparent)]"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-brand-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-brand-gold/20">
                    <Icon icon="mdi:trophy-outline" className="text-brand-gold w-10 h-10" />
                  </div>
                  <h3 className="text-white font-black text-xl mb-3">Belum Ada Rewards</h3>
                  <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
                    Rewards akan muncul di sini setelah tersedia.
                  </p>
                </div>
              </div>
            ) : (
              rewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  onClaim={() => handleClaimReward(reward)}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              ))
            )}
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
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}

// Binary Node Component
function BinaryNode({ user, isRoot, position }) {
  const isEmpty = !user && !isRoot;
  
  const positionColor = isRoot
    ? 'from-brand-gold to-brand-gold-deep'
    : position === 'left' 
    ? 'from-blue-600 to-cyan-600' 
    : position === 'right'
    ? 'from-green-600 to-emerald-600'
    : 'from-gray-600 to-gray-700';

  if (isEmpty) {
    return (
      <div className="w-36 h-32 bg-gray-800/30 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center relative">
        {position && (
          <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-lg z-20 ${
            position === 'left' ? 'bg-blue-600' : 'bg-green-600'
          }`}>
            {position === 'left' ? 'L' : 'R'}
          </div>
        )}
        <Icon icon="mdi:account-off" className="text-gray-600 w-10 h-10 mb-2" />
        <p className="text-gray-400 text-xs text-center px-2 font-medium">Kosong</p>
      </div>
    );
  }

  // Format omset untuk display
  const formatOmset = (omset) => {
    const amount = omset === undefined || omset === null ? 0 : omset;
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className={`relative ${isRoot ? 'w-40' : 'w-36'} ${isRoot ? 'h-40' : 'h-32'} bg-gradient-to-br ${positionColor} rounded-xl border-2 ${isRoot ? 'border-brand-gold' : 'border-white/40'} flex flex-col items-center p-3 shadow-lg hover:scale-105 transition-transform duration-300`}>
      {/* Badge position - top-right corner, smaller size */}
      {isRoot && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-brand-gold rounded-full flex items-center justify-center border-2 border-white shadow-lg z-20">
          <Icon icon="mdi:crown" className="text-brand-black w-3.5 h-3.5" />
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
        <div className={`w-12 h-12 ${isRoot ? 'w-14 h-14' : ''} bg-white/20 rounded-full flex items-center justify-center mb-2 border-2 border-white/30 flex-shrink-0`}>
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
          <p className="text-white/80 text-[9px] text-center mb-2 leading-tight">
            +62{user.number}
          </p>
        )}
        
        {/* Omset - at bottom */}
        <div className="mt-auto w-full px-2">
          <p className={`text-white/95 text-[10px] font-semibold text-center px-2 py-1.5 rounded-full ${(user?.omset || 0) > 0 ? 'bg-white/25 text-white' : 'bg-white/10 text-white/70'}`}>
            {formatOmset(user?.omset)}
          </p>
        </div>
      </div>
    </div>
  );
}

// Reward Card Component
function RewardCard({ reward, onClaim, formatCurrency, formatDate }) {
  const progress = Math.min(100, Math.max(0, reward.progress || 0));
  const isCompleted = reward.is_completed === true;
  const isClaimed = reward.is_claimed === true;
  const canClaim = isCompleted && !isClaimed;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface-soft/90 p-6 shadow-[0_20px_60px_rgba(5,6,8,0.6)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.1),transparent)]"></div>
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${isCompleted ? 'from-brand-gold to-brand-gold-deep' : 'from-gray-600 to-gray-700'} flex items-center justify-center`}>
                <Icon icon="mdi:trophy" className={`text-white w-5 h-5 ${isCompleted ? 'animate-pulse' : ''}`} />
              </div>
              <div>
                <h3 className="text-white font-black text-lg">{reward.name}</h3>
                <p className="text-brand-gold text-sm">{reward.reward_desc}</p>
              </div>
            </div>
          </div>
          {isClaimed && (
            <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
              <span className="text-green-400 text-xs font-bold">CLAIMED</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/70 text-xs">Progress</span>
            <span className="text-brand-gold text-xs font-bold">{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-gold to-brand-gold-deep transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Omset Info */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-gray-400 text-xs mb-1">Omset Kiri</p>
            <p className="text-white font-bold text-sm">{formatCurrency(reward.omset_left || 0)}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-gray-400 text-xs mb-1">Omset Kanan</p>
            <p className="text-white font-bold text-sm">{formatCurrency(reward.omset_right || 0)}</p>
          </div>
        </div>

        {/* Total Omset and Target */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-brand-gold/20 to-brand-gold-deep/20 rounded-xl p-3 border border-brand-gold/30">
            <p className="text-brand-gold text-xs mb-1 font-semibold">Total Omset</p>
            <p className="text-brand-gold font-black text-base">{formatCurrency(reward.total_omset || 0)}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-gray-400 text-xs mb-1">Target</p>
            <p className="text-white font-bold text-sm">{formatCurrency(reward.omset_target || 0)}</p>
          </div>
        </div>

        {/* Details */}
        <div className="flex items-center justify-between text-xs text-white/60 mb-4">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:calendar" className="w-4 h-4" />
            <span>Durasi: {reward.duration} hari</span>
          </div>
          {reward.expires_at && (
            <div className="flex items-center gap-2">
              <Icon icon="mdi:clock-outline" className="w-4 h-4" />
              <span>Expires: {formatDate(reward.expires_at)}</span>
            </div>
          )}
        </div>

        {/* Claim Button */}
        <button
          onClick={onClaim}
          disabled={!canClaim}
          className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
            canClaim
              ? 'bg-gradient-to-r from-brand-gold to-brand-gold-deep text-brand-black hover:scale-105 active:scale-95 shadow-brand-glow'
              : 'bg-white/5 text-white/50 cursor-not-allowed'
          }`}
        >
          {isClaimed ? (
            <>
              <Icon icon="mdi:check-circle" className="w-5 h-5" />
              Sudah Diambil
            </>
          ) : isCompleted ? (
            <>
              <Icon icon="mdi:gift" className="w-5 h-5" />
              Klaim Hadiah
            </>
          ) : (
            <>
              <Icon icon="mdi:lock" className="w-5 h-5" />
              Belum Selesai
            </>
          )}
        </button>
      </div>
    </div>
  );
}

