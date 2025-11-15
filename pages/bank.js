import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { getBankAccounts, deleteBankAccount } from '../utils/api';
import BottomNavbar from '../components/BottomNavbar';
import Copyright from '../components/copyright';

export default function BankAccount() {
  const router = useRouter();
  const [bankAccounts, setBankAccounts] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [loading, setLoading] = useState(true);
  const [applicationData, setApplicationData] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, account: null });

  useEffect(() => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    const accessExpire = typeof window !== 'undefined' ? sessionStorage.getItem('access_expire') : null;

    if (!token || !accessExpire || new Date() > new Date(accessExpire)) {
        if (typeof window !== 'undefined') router.push('/login');
        return;
    }

    fetchData();

    const appConfigStr = typeof window !== 'undefined' ? localStorage.getItem('application') : null;
    if (appConfigStr) {
        try {
            const appConfig = JSON.parse(appConfigStr);
            setApplicationData({
                name: appConfig.name || 'Money Rich',
                healthy: appConfig.healthy || false,
                company: appConfig.company || 'Money Rich Holdings',
            });
        } catch (e) {
            setApplicationData({ name: 'Money Rich', healthy: false, company: 'Money Rich Holdings' });
        }
    }
  }, [router]);

  async function fetchData() {
    setLoading(true);
    try {
      const bankRes = await getBankAccounts();
      setBankAccounts(bankRes.data.bank_account || []);
    } catch (err) {
      setMessage(err.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteClick = (account) => {
    setDeleteModal({ show: true, account });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.account) return;
    
    setMessage('');
    try {
      const res = await deleteBankAccount(deleteModal.account.id);
      setMessage(res.message);
      setMessageType('success');
      fetchData();
    } catch (err) {
      setMessage(err.message);
      setMessageType('error');
    }
    
    setDeleteModal({ show: false, account: null });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, account: null });
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="min-h-screen bg-brand-black text-white relative overflow-hidden pb-32">
      <Head>
        <title>{applicationData?.name || 'Money Rich'} | Akun Bank</title>
        <meta name="description" content={`${applicationData?.name || 'Money Rich'} Bank Accounts`} />
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
            <Icon icon="mdi:bank" className="w-4 h-4" />
            Bank Management
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">
                Kelola Rekening Bank
              </h1>
              <p className="text-sm text-white/60 max-w-2xl mt-2">
                Tambahkan dan kelola rekening bank untuk penarikan dana. Pastikan data rekening sesuai dengan identitas Anda.
              </p>
            </div>
            <Link href="/bank/add" passHref>
              <button className="inline-flex items-center gap-2 rounded-xl border border-brand-gold/40 bg-gradient-to-r from-brand-gold to-brand-gold-deep px-5 py-3 text-sm font-semibold text-brand-black shadow-brand-glow transition-transform duration-300 hover:-translate-y-0.5">
                <Icon icon="mdi:plus" className="w-5 h-5" />
                Tambah Rekening
              </button>
            </Link>
          </div>
        </div>

        {/* Floating Message */}
        {message && (
          <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all duration-500 max-w-sm w-full mx-auto ${
            messageType === 'success' 
              ? 'bg-brand-emerald/20 border-brand-emerald/30 text-brand-emerald' 
              : messageType === 'error'
              ? 'bg-red-500/20 border-red-400/30 text-red-300'
              : 'bg-brand-gold/20 border-brand-gold/30 text-brand-gold'
          }`}>
            <div className="flex items-center gap-3">
              <Icon 
                icon={messageType === 'success' ? 'mdi:check-circle' : messageType === 'error' ? 'mdi:alert-circle' : 'mdi:information'} 
                className="w-5 h-5 flex-shrink-0" 
              />
              <span className="font-medium text-sm">{message}</span>
            </div>
          </div>
        )}

        {/* Bank Accounts Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center my-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-3 border-brand-gold/20 border-t-brand-gold"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-brand-gold/40"></div>
            </div>
            <p className="text-white/70 text-center mt-4 text-sm">Memuat data...</p>
          </div>
        ) : bankAccounts.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface-soft/90 p-12 text-center shadow-[0_20px_60px_rgba(5,6,8,0.6)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,193,82,0.1),transparent)]"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-brand-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-brand-gold/20">
                <Icon icon="mdi:bank-off" className="text-brand-gold w-10 h-10" />
              </div>
              <h3 className="text-white font-black text-xl mb-3">Belum Ada Rekening</h3>
              <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
                Tambahkan rekening bank untuk memulai penarikan dana. Rekening akan digunakan untuk menerima hasil investasi.
              </p>
              <Link href="/bank/add" passHref>
                <button className="bg-gradient-to-r from-brand-gold to-brand-gold-deep hover:from-brand-gold-deep hover:to-brand-gold text-brand-black font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-brand-gold/30 hover:shadow-brand-gold/50 hover:scale-[1.02] active:scale-[0.98] mx-auto">
                  <Icon icon="mdi:bank-plus" className="w-5 h-5" />
                  Tambah Rekening Pertama
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bankAccounts.map(account => (
              <div key={account.id} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface-soft/90 p-6 shadow-[0_20px_60px_rgba(5,6,8,0.6)] hover:shadow-[0_25px_70px_rgba(232,193,82,0.2)] transition-all duration-300 hover:scale-[1.02] hover:border-brand-gold/30">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.1),transparent)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-gold to-brand-gold-deep flex items-center justify-center shadow-lg">
                      <Icon icon="mdi:bank" className="text-brand-black text-2xl" />
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/bank/edit?id=${account.id}`} passHref>
                        <button className="p-2 rounded-lg bg-brand-emerald/10 text-brand-emerald hover:bg-brand-emerald/20 border border-brand-emerald/20 transition-all duration-300 active:scale-95">
                          <Icon icon="mdi:pencil" className="w-4 h-4" />
                        </button>
                      </Link>
                      <button 
                        onClick={() => handleDeleteClick(account)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all duration-300 active:scale-95"
                      >
                        <Icon icon="mdi:trash-can" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-white font-black text-lg mb-2 truncate">{account.bank_name}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <Icon icon="mdi:credit-card-outline" className="w-4 h-4 text-brand-gold" />
                      <span className="font-semibold">{account.account_number}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Icon icon="mdi:account-outline" className="w-4 h-4 text-brand-gold/70" />
                      <span className="truncate">{account.account_name}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <Icon icon="mdi:check-circle" className="w-3.5 h-3.5 text-brand-emerald" />
                      <span>Rekening terverifikasi</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tips Section */}
        {bankAccounts.length > 0 && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-brand-surface/80 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:lightbulb-on-outline" className="w-5 h-5 text-brand-gold" />
              <h3 className="text-lg font-semibold text-white">Tips Keamanan</h3>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <Icon icon="mdi:check-circle" className="text-brand-emerald mt-1 flex-shrink-0" />
                <p className="text-sm text-white/80">Pastikan nama pemilik rekening sesuai dengan identitas Anda</p>
              </div>
              <div className="flex items-start gap-3">
                <Icon icon="mdi:shield-check" className="text-brand-gold mt-1 flex-shrink-0" />
                <p className="text-sm text-white/80">Gunakan nomor rekening yang valid dan aktif</p>
              </div>
              <div className="flex items-start gap-3">
                <Icon icon="mdi:close-circle" className="text-red-400 mt-1 flex-shrink-0" />
                <p className="text-sm text-white/80">Rekening yang telah digunakan untuk penarikan tidak dapat dihapus</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-brand-surface via-brand-surface-soft to-brand-charcoal rounded-3xl p-6 border border-brand-gold/20 shadow-2xl max-w-sm w-full mx-4 animate-slideUp">
            <div className="text-center">
              <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                <Icon icon="mdi:alert-circle" className="text-red-400 w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Hapus Rekening?</h3>
              <p className="text-white/70 mb-1 text-sm">Anda yakin ingin menghapus rekening:</p>
              <p className="text-white font-bold mb-4 text-sm">{deleteModal.account?.bank_name} - {deleteModal.account?.account_number}</p>
              <p className="text-red-300 text-xs mb-6">Tindakan ini tidak dapat dibatalkan.</p>
              
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  className="flex-1 bg-brand-surface hover:bg-brand-surface-soft text-white font-bold py-3 rounded-xl border border-white/10 transition-all duration-300"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-red-500/30"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
        
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        .animate-slideUp { animation: slideUp 0.5s ease-out; }
      `}</style>
    </div>
  );
}
