import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { getTeamInvitedByLevel, getTeamDataByLevel } from '../../utils/api';
import BottomNavbar from '../../components/BottomNavbar';
import Copyright from '../../components/copyright';

export default function Team() {
  const router = useRouter();
  const { level } = router.query;
  const [applicationData, setApplicationData] = useState(null);
  const [teamData, setTeamData] = useState({
    totalInvestment: 0,
    activeMembers: 0,
    members: [],
    totalMembers: 0,
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showLimitDropdown, setShowLimitDropdown] = useState(false);

  const prevLevelRef = useRef();

  const fetchData = async (cancelToken) => {
    setLoading(true);
    try {
      const statsRes = await getTeamInvitedByLevel(level);
      const stats = statsRes?.data?.[level] || { active: 0, count: 0, total_invest: 0 };

      const membersRes = await getTeamDataByLevel(level, { limit, page });
      const membersArr = membersRes?.data?.members || [];
      // Use API total if available, otherwise use stats.count, or estimate from current page
      let totalMembers = membersRes?.data?.total ?? membersRes?.data?.total_count ?? stats.count ?? 0;
      
      // If we got a full page of results and no total, assume there might be more
      // But if we got less than limit, we know we're on the last page
      if (totalMembers === 0 && membersArr.length === limit) {
        // Can't determine total, but we know there's at least this page
        totalMembers = page * limit;
      } else if (totalMembers === 0 && membersArr.length < limit) {
        // Last page, total is current page items
        totalMembers = (page - 1) * limit + membersArr.length;
      }

      const members = membersArr.map((m, idx) => {
        let phone = (m.number || '').toString();
        if (phone.startsWith('0')) phone = `62${phone.slice(1)}`;
        else if (phone.startsWith('+62')) phone = phone.slice(1);
        else if (!phone.startsWith('62') && phone.length > 0) phone = `62${phone}`;
        return {
          id: (page - 1) * limit + idx + 1,
          phone,
          name: m.name || 'Tanpa Nama',
          investment: m.total_invest || 0,
          status: m.active ? 'active' : 'inactive',
        };
      });

      if (!cancelToken?.current) {
        setTeamData({
          totalInvestment: stats.total_invest || 0,
          activeMembers: stats.active || 0,
          members,
          totalMembers,
        });
      }
    } catch (e) {
      if (!cancelToken?.current) {
        setTeamData({ totalInvestment: 0, activeMembers: 0, members: [], totalMembers: 0 });
      }
    } finally {
      if (!cancelToken?.current) setLoading(false);
    }
  };

  useEffect(() => {
    const storedApplication = localStorage.getItem('application');
    if (storedApplication) {
      try {
        const parsed = JSON.parse(storedApplication);
        setApplicationData({
          name: parsed.name || 'Money Rich',
          healthy: parsed.healthy || false,
          company: parsed.company || parsed.name || 'Money Rich Holdings',
        });
      } catch (e) {
        setApplicationData({ name: 'Money Rich', healthy: false, company: 'Money Rich Holdings' });
      }
    } else {
      setApplicationData({ name: 'Money Rich', healthy: false, company: 'Money Rich Holdings' });
    }

    if (!level) return;
    const cancelToken = { current: false };

    const levelChanged = prevLevelRef.current !== level;
    if (levelChanged) {
      prevLevelRef.current = level;
      if (page !== 1) {
        setPage(1);
        return () => {
          cancelToken.current = true;
        };
      }
    }

    fetchData(cancelToken);
    return () => {
      cancelToken.current = true;
    };
  }, [level, page, limit]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage !== page) {
      setPage(newPage);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const getLevelGradient = (lvl) => {
    switch (lvl) {
      case '1':
        return { from: 'from-brand-gold', to: 'to-brand-gold-deep', color: '#E8C152' };
      case '2':
        return { from: 'from-brand-emerald', to: 'to-teal-500', color: '#4CD6C4' };
      case '3':
        return { from: 'from-white/20', to: 'to-white/5', color: '#FFFFFF' };
      default:
        return { from: 'from-brand-gold', to: 'to-brand-gold-deep', color: '#E8C152' };
    }
  };

  const levelGradient = getLevelGradient(level);
  const companyName = applicationData?.company || 'Money Rich Holdings';
  const levelLabel = level || '...';

  const filteredMembers = teamData.members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) || member.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCopyPhone = (phone) => {
    if (typeof navigator !== 'undefined' && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(`+${phone}`);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-white relative overflow-hidden pb-32">
      <Head>
        <title>{applicationData?.name || 'Money Rich'} | Tim Level {levelLabel}</title>
        <meta name="description" content={`${applicationData?.name || 'Money Rich'} Team`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.18),rgba(5,6,8,0.95))]"></div>
        <div className="absolute -top-40 -left-32 w-[360px] h-[360px] rounded-full bg-brand-gold/18 blur-[160px] opacity-60"></div>
        <div className="absolute bottom-16 right-[-120px] w-[420px] h-[420px] rounded-full bg-brand-gold-deep/12 blur-[200px] opacity-70"></div>
        <div className="absolute bottom-[-140px] left-1/2 -translate-x-1/2 w-[440px] h-[440px] rounded-full bg-brand-emerald/12 blur-[220px] opacity-70"></div>
      </div>

      <div className="sticky top-0 z-40 bg-brand-black/85 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white hover:border-white/20 transition-all"
          >
            <Icon icon="mdi:arrow-left" className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/45">My Team</p>
            <h1 className="text-lg font-semibold text-white">Tim Level {levelLabel}</h1>
          </div>
          <button
            onClick={() => router.push('/referral')}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/75 hover:text-white"
          >
            <Icon icon="mdi:share-variant" className="w-4 h-4" />
            Bagikan Referral
          </button>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-10 pb-24 space-y-10">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface/95 backdrop-blur-xl p-8 md:p-10 shadow-[0_25px_70px_rgba(5,6,8,0.55)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.18),transparent)]"></div>
          <div className="relative z-10 flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <span className="inline-flex items-center gap-2 w-fit rounded-full border border-brand-gold/30 bg-brand-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-brand-gold">
                <Icon icon="mdi:account-group" className="w-4 h-4" />
                Level {levelLabel}
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-white">Monitor performa tim Money Rich Anda.</h2>
              <p className="text-sm md:text-base text-white/60 max-w-3xl">
                Perkuat komunikasi dengan anggota, awasi status aktivasi, dan motivasi mereka untuk terus berinvestasi. Semua data diperbarui secara real-time.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Total Member</p>
                <p className="text-3xl font-bold text-white mt-2">{teamData.totalMembers || teamData.members.length}</p>
                <p className="text-[11px] text-white/55 mt-2">Jumlah keseluruhan tim level {levelLabel}.</p>
              </div>
              <div className="rounded-2xl border border-brand-emerald/30 bg-brand-emerald/10 p-5">
                <p className="text-[11px] uppercase tracking-[0.3em] text-brand-emerald/80">Aktif</p>
                <p className="text-3xl font-bold text-white mt-2">{teamData.activeMembers}</p>
                <p className="text-[11px] text-white/55 mt-2">Member yang telah bertransaksi dan menghasilkan komisi.</p>
              </div>
              <div className="rounded-2xl border border-brand-gold/30 bg-brand-gold/10 p-5">
                <p className="text-[11px] uppercase tracking-[0.3em] text-brand-gold/80">Total Investasi</p>
                <p className="text-3xl font-bold text-white mt-2">{formatCurrency(teamData.totalInvestment)}</p>
                <p className="text-[11px] text-white/55 mt-2">Akumulasi nilai investasi dari tim level {levelLabel}.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-brand-surface-soft/90 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(5,6,8,0.55)]">
            <div className="flex items-center gap-3 mb-4">
              <Icon icon="mdi:magnify" className="w-5 h-5 text-brand-gold" />
              <h3 className="text-lg font-semibold text-white">Cari member</h3>
            </div>
            <div className="relative mb-4">
              <Icon icon="mdi:magnify" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Cari nama atau nomor telepon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-brand-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'all', label: 'Semua' },
                { key: 'active', label: 'Aktif' },
                { key: 'inactive', label: 'Tidak Aktif' },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setFilterStatus(option.key)}
                  className={`rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
                    filterStatus === option.key
                      ? 'border-brand-gold/40 bg-brand-gold/20 text-brand-gold shadow-brand-glow'
                      : 'border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-white/20'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-brand-surface-soft/90 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(5,6,8,0.55)] space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-gold/15 border border-brand-gold/30 text-brand-gold flex items-center justify-center">
                <Icon icon="mdi:lightbulb-on" className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Strategi aktivasi cepat</h3>
                <ul className="space-y-1.5 text-sm text-white/60">
                  <li>Utamakan onboarding 24 jam dengan panduan produk Money Rich.</li>
                  <li>Bagikan materi promosi dan jadwalkan sesi konsultasi singkat.</li>
                  <li>Pantau progres di halaman ini dan dorong upgrade VIP.</li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => router.push('/referral')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-gold to-brand-gold-deep text-brand-black font-semibold py-3 shadow-brand-glow transition-transform duration-300 hover:-translate-y-0.5"
            >
              <Icon icon="mdi:rocket-launch" className="w-4 h-4" />
              Arahkan ke Halaman Referral
            </button>
          </div>
        </section>

        <section className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-3 border-brand-gold/20 border-t-brand-gold"></div>
                <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-brand-gold/30"></div>
              </div>
              <p className="text-white/60 text-sm mt-4">Memuat data tim...</p>
            </div>
          ) : filteredMembers.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface/90 backdrop-blur-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-[0_18px_45px_rgba(5,6,8,0.55)]"
                >
                  <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${levelGradient.from} ${levelGradient.to} flex items-center justify-center flex-shrink-0 shadow-brand-glow`}>
                    <Icon icon="mdi:account" className="w-6 h-6 text-white" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand-black/80 border border-white/10 flex items-center justify-center text-[10px] font-semibold text-white">
                      #{member.id}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-white font-semibold text-base truncate">{member.name}</h4>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${
                          member.status === 'active'
                            ? 'bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/30'
                            : 'bg-red-500/15 text-red-300 border border-red-500/30'
                        }`}
                      >
                        <Icon icon={member.status === 'active' ? 'mdi:check-circle' : 'mdi:clock-outline'} className="w-3.5 h-3.5" />
                        {member.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-white/60">
                      <span className="inline-flex items-center gap-2">
                        <Icon icon="mdi:phone" className="w-4 h-4 text-white/45" />
                        +{member.phone}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Icon icon="mdi:wallet" className="w-4 h-4 text-brand-gold" />
                        {formatCurrency(member.investment)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopyPhone(member.phone)}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 hover:text-white hover:border-white/20 transition-colors"
                  >
                    <Icon icon="mdi:content-copy" className="w-4 h-4" />
                    Salin Kontak
                  </button>
                </div>
              ))}
            </div>
          ) : teamData.members.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-brand-surface/90 backdrop-blur-xl p-10 text-center space-y-4">
              <Icon icon="mdi:account-group-outline" className="w-16 h-16 text-white/30 mx-auto" />
              <h3 className="text-white font-semibold text-lg">Belum Ada Member</h3>
              <p className="text-white/60 text-sm">Tim level {levelLabel} Anda masih kosong. Mulai bagikan referral sekarang.</p>
              <button
                onClick={() => router.push('/referral')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-gold to-brand-gold-deep text-brand-black font-semibold px-5 py-3 shadow-brand-glow hover:-translate-y-0.5 transition-transform duration-300"
              >
                <Icon icon="mdi:rocket-launch" className="w-4 h-4" />
                Mulai Referral
              </button>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-brand-surface/90 backdrop-blur-xl p-10 text-center space-y-3">
              <Icon icon="mdi:magnify-close" className="w-12 h-12 text-white/30 mx-auto" />
              <h3 className="text-white font-semibold text-base">Tidak Ada Hasil</h3>
              <p className="text-white/60 text-sm">Tidak ditemukan member yang sesuai dengan filter Anda.</p>
            </div>
          )}
        </section>

        {teamData.members.length > 0 && (
          <div className="space-y-4">
            {/* Pagination Controls */}
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
                Menampilkan {((page - 1) * limit) + 1} - {Math.min(page * limit, teamData.totalMembers || teamData.members.length)} dari {teamData.totalMembers || teamData.members.length} member
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
                {[...Array(Math.min(5, Math.ceil((teamData.totalMembers || teamData.members.length) / limit) || 1))].map((_, idx) => {
                  const totalPages = Math.ceil((teamData.totalMembers || teamData.members.length) / limit) || 1;
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
                  const totalPages = Math.ceil(teamData.totalMembers / limit) || 1;
                  if (page < totalPages) {
                    handlePageChange(page + 1);
                  }
                }}
                disabled={(() => {
                  // Disable if we're on the last page
                  const totalPages = Math.ceil(teamData.totalMembers / limit) || 1;
                  const isLastPage = page >= totalPages;
                  
                  // Also disable if we got less than limit items (meaning no more pages)
                  const hasLessThanLimit = teamData.members.length < limit;
                  
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

        <Copyright />
      </div>

      {/* Bottom Navigation - Floating */}
      <BottomNavbar />
    </div>
  );
}
