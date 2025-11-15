// pages/task.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { getBonusTasks, submitBonusTask } from '../../utils/api';
import BottomNavbar from '../../components/BottomNavbar';
import Copyright from '../../components/copyright';

export default function Task() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState({});
  const [message, setMessage] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [applicationData, setApplicationData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    const accessExpire = sessionStorage.getItem('access_expire');
    if (!token || !accessExpire) {
      router.push('/login');
      return;
    }
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.reff_code) setReferralCode(user.reff_code);
      }
    } catch {}
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setMessage('');
    getBonusTasks()
      .then(res => {
        if (!ignore) setTasks(res.data || []);
      })
      .catch(e => { if (!ignore) setMessage(e.message || 'Gagal memuat tugas'); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, []);

  const handleClaim = async (taskId) => {
    setClaiming(prev => ({ ...prev, [taskId]: true }));
    setMessage('');
    try {
      await submitBonusTask(taskId);
      setMessage('Selamat! Hadiah berhasil diklaim.');
      setLoading(true);
      const res = await getBonusTasks();
      setTasks(res.data || []);
    } catch (e) {
      setMessage(e.message || 'Gagal mengambil hadiah');
    } finally {
      setClaiming(prev => ({ ...prev, [taskId]: false }));
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  return (
    <div className="min-h-screen bg-brand-black text-white relative overflow-hidden pb-32">
      <Head>
        <title>{applicationData?.name || 'Money Rich'} | Bonus Tasks</title>
        <meta name="description" content={`${applicationData?.name || 'Money Rich'} Bonus Tasks`} />
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
            <Icon icon="mdi:gift" className="w-4 h-4" />
            Bonus Tasks
            </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">Tugas Bonus</h1>
            <p className="text-sm text-white/60 max-w-2xl mt-2">
              Undang anggota aktif dan klaim hadiah spesial. Raih bonus eksklusif dengan menyelesaikan tugas.
            </p>
          </div>
        </div>

        {/* Referral Code Card */}
        <div className="relative overflow-hidden rounded-3xl border border-brand-gold/25 bg-gradient-to-br from-brand-gold/12 via-brand-surface to-brand-surface-soft p-6 mb-8 shadow-[0_18px_45px_rgba(5,6,8,0.45)]">
          <div className="absolute -top-16 -right-12 w-40 h-40 rounded-full bg-brand-gold/35 blur-3xl opacity-70"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center">
                  <Icon icon="mdi:key" className="text-brand-gold w-6 h-6" />
                </div>
                <div>
                  <p className="text-white font-black text-base">Kode Referral</p>
                  <p className="text-white/60 text-xs">Bagikan kode ini untuk mengundang teman</p>
                </div>
            </div>
            <button
              onClick={copyToClipboard}
                className={`p-3 rounded-xl transition-all border ${
                copied 
                    ? 'bg-brand-emerald/20 text-brand-emerald border-brand-emerald/30' 
                    : 'bg-brand-surface text-white/70 hover:text-white hover:bg-brand-surface-soft border-white/10'
              }`}
            >
              <Icon icon={copied ? "mdi:check" : "mdi:content-copy"} className="w-5 h-5" />
            </button>
          </div>
            <div className="bg-brand-black/40 rounded-2xl p-4 border border-white/10">
              <p className="text-white font-mono font-black text-center text-xl tracking-widest">
              {referralCode || '---'}
            </p>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-3 border-brand-gold/20 border-t-brand-gold"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-brand-gold/40"></div>
            </div>
            <p className="text-white/70 text-sm mt-4">Memuat tugas bonus...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface-soft/90 p-12 text-center shadow-[0_20px_60px_rgba(5,6,8,0.6)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,193,82,0.1),transparent)]"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-brand-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-brand-gold/20">
                <Icon icon="mdi:gift-off" className="text-brand-gold w-10 h-10" />
              </div>
              <h3 className="text-white font-black text-xl mb-3">Tidak Ada Tugas</h3>
              <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
                Tugas bonus belum tersedia saat ini. Nantikan info dari tim Money Rich.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const percent = task.percent || 0;
              const isLocked = task.lock;
              const isTaken = task.taken;
              const canClaim = !isLocked && !isTaken;
              
              return (
                <div
                  key={task.id} 
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface-soft/90 p-6 shadow-[0_20px_60px_rgba(5,6,8,0.6)] hover:shadow-[0_25px_70px_rgba(232,193,82,0.2)] transition-all duration-300 hover:scale-[1.01] hover:border-brand-gold/30"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.08),transparent)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    {/* Header */}
                    <div className={`flex items-start justify-between mb-5 pb-5 border-b ${canClaim ? 'border-brand-gold/30' : 'border-white/10'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                          canClaim 
                            ? 'bg-gradient-to-br from-brand-gold to-brand-gold-deep text-brand-black' 
                            : isTaken 
                              ? 'bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/30' 
                              : 'bg-brand-surface text-white/60 border border-white/10'
                        }`}>
                          <Icon 
                            icon={isTaken ? 'mdi:check-decagram' : isLocked ? 'mdi:lock' : 'mdi:gift'} 
                            className="w-7 h-7" 
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-black text-base">{task.name}</h3>
                      {canClaim && (
                              <span className="inline-flex items-center gap-1 rounded-lg border border-brand-gold/40 bg-brand-gold/15 px-2 py-0.5 text-[10px] font-bold text-brand-gold">
                                <Icon icon="mdi:lightning-bolt" className="w-3 h-3" />
                                Aktif
                              </span>
                            )}
                          </div>
                          <p className="text-white/60 text-xs">Level {task.required_level} • Hadiah {formatCurrency(task.reward)}</p>
                        </div>
                    </div>
                  </div>

                    {/* Stats Grid */}
                    <div className="grid sm:grid-cols-3 gap-4 mb-5">
                      <div className="rounded-2xl border border-white/10 bg-brand-black/40 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-brand-emerald/20 border border-brand-emerald/30 flex items-center justify-center">
                            <Icon icon="mdi:account-group" className="text-brand-emerald w-4 h-4" />
                          </div>
                          <p className="text-xs uppercase tracking-[0.35em] text-white/45">Aktif</p>
                        </div>
                        <p className="text-lg font-black text-white">
                          {task.active_subordinate_count}/{task.required_active_members}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-brand-black/40 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center">
                            <Icon icon="mdi:currency-usd" className="text-brand-gold w-4 h-4" />
                          </div>
                          <p className="text-xs uppercase tracking-[0.35em] text-white/45">Bonus</p>
                        </div>
                        <p className="text-lg font-black text-brand-gold">
                          {formatCurrency(task.reward)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-brand-black/40 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                            <Icon icon="mdi:chart-line" className="text-blue-400 w-4 h-4" />
                          </div>
                          <p className="text-xs uppercase tracking-[0.35em] text-white/45">Progress</p>
                        </div>
                        <p className="text-lg font-black text-brand-emerald">{percent}%</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                        <span>Perkembangan Jaringan</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            canClaim ? 'bg-gradient-to-r from-brand-gold to-brand-gold-deep' : 'bg-white/20'
                          }`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-300 ${
                        canClaim
                          ? 'bg-gradient-to-r from-brand-gold to-brand-gold-deep text-brand-black shadow-brand-glow hover:-translate-y-0.5'
                          : isTaken
                            ? 'bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/30 cursor-not-allowed'
                            : 'bg-brand-surface text-white/35 border border-white/10 cursor-not-allowed'
                      }`}
                      disabled={!canClaim || claiming[task.id]}
                      onClick={() => handleClaim(task.id)}
                    >
                      {claiming[task.id] ? (
                        <>
                          <span className="h-5 w-5 rounded-full border-2 border-brand-black/30 border-t-brand-black animate-spin"></span>
                          Memproses...
                        </>
                      ) : isTaken ? (
                        <>
                          <Icon icon="mdi:check-circle" className="w-5 h-5" />
                          Terklaim
                        </>
                      ) : isLocked ? (
                        <>
                          <Icon icon="mdi:lock" className="w-5 h-5" />
                          Terkunci
                        </>
                      ) : (
                        <>
                          <Icon icon="mdi:gift" className="w-5 h-5" />
                          Klaim Hadiah
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="relative animate-fadeIn mt-6">
            <div className="absolute -inset-0.5 bg-brand-emerald/40 rounded-2xl blur opacity-60"></div>
            <div className="relative rounded-2xl border border-brand-emerald/30 bg-brand-emerald/10 px-5 py-4 flex items-center gap-3">
              <Icon icon="mdi:check-decagram" className="w-5 h-5 text-brand-emerald" />
              <p className="text-sm font-semibold text-brand-emerald">{message}</p>
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
          
          .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
      `}</style>
    </div>
  );
}
