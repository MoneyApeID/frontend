import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { getBankList, addBankAccount } from '../../utils/api';
import BottomNavbar from '../../components/BottomNavbar';
import Copyright from '../../components/copyright';

export default function BankAdd() {
  const router = useRouter();
  const [bankId, setBankId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [banks, setBanks] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [applicationData, setApplicationData] = useState(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    const accessExpire = typeof window !== 'undefined' ? sessionStorage.getItem('access_expire') : null;

    if (!token || !accessExpire || new Date() > new Date(accessExpire)) {
        if (typeof window !== 'undefined') router.push('/login');
        return;
    }

    fetchBanks();

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

  const fetchBanks = async () => {
    try {
      const banksRes = await getBankList();
      setBanks(banksRes.data.banks || []);
    } catch (err) {
      setMessage(err.message);
      setMessageType('error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    try {
      const res = await addBankAccount({
        bank_id: parseInt(bankId, 10),
        account_number: String(bankAccount),
        account_name: String(fullName)
      });
      setMessage(res.message);
      setMessageType('success');
      setTimeout(() => router.push('/bank'), 1500);
    } catch (err) {
      setMessage(err.message);
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
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
        <title>{applicationData?.name || 'Money Rich'} | Tambah Rekening Bank</title>
        <meta name="description" content={`${applicationData?.name || 'Money Rich'} Add Bank Account`} />
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

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-8 pb-24">
        {/* Hero Header Section */}
        <div className="mb-10 flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-brand-gold w-fit">
            <Icon icon="mdi:bank-plus" className="w-4 h-4" />
            Tambah Rekening
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Tambah Rekening Bank Baru
            </h1>
            <p className="text-sm text-white/60 max-w-2xl mt-2">
              Tambahkan rekening bank untuk penarikan dana. Pastikan data rekening sesuai dengan identitas Anda dan rekening aktif.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Form Section */}
          <section className="relative">
            <div className="absolute -inset-1 rounded-[30px] bg-gradient-to-br from-brand-gold/35 via-transparent to-brand-emerald/25 blur-3xl opacity-70"></div>
            <div className="relative rounded-[28px] border border-white/10 bg-brand-surface/95 backdrop-blur-xl p-6 sm:p-8 shadow-brand-glow">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-white/45">
                      Formulir Rekening
                    </p>
                    <h2 className="text-2xl font-semibold text-white mt-1">
                      Data Rekening Bank
                    </h2>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-brand-gold/15 border border-brand-gold/30 text-brand-gold flex items-center justify-center shadow-brand-glow">
                    <Icon icon="mdi:bank" className="w-6 h-6" />
                  </div>
                </div>

                {message && (
                  <div className={`rounded-2xl border px-5 py-4 text-sm font-semibold flex items-start gap-3 ${
                    messageType === 'success'
                      ? 'bg-brand-emerald/10 border-brand-emerald/30 text-brand-emerald'
                      : 'bg-red-500/10 border-red-500/30 text-red-200'
                  }`}>
                    <Icon
                      icon={messageType === 'success' ? 'mdi:check-circle' : 'mdi:alert-circle'}
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                    />
                    <span>{message}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Bank Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-3">
                      Pilih Bank
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/20 to-brand-emerald/20 rounded-2xl blur-sm opacity-50 group-focus-within:opacity-70 transition-opacity"></div>
                      <select
                        value={bankId}
                        onChange={e => setBankId(e.target.value)}
                        className="relative w-full bg-brand-black/40 backdrop-blur-sm border border-white/10 text-white rounded-2xl px-4 py-4 pr-12 focus:outline-none focus:border-brand-gold focus:shadow-[0_0_20px_rgba(232,193,82,0.2)] appearance-none font-medium transition-all duration-300"
                        required
                      >
                        <option value="" className="bg-brand-black text-white/70">Pilih Bank Anda</option>
                        {banks.map(bank => (
                          <option key={bank.id} value={bank.id} className="bg-brand-black text-white">{bank.name}</option>
                        ))}
                      </select>
                      <Icon icon="mdi:chevron-down" className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 pointer-events-none" />
                    </div>
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-3">
                      Nomor Rekening
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/20 to-brand-emerald/20 rounded-2xl blur-sm opacity-50 group-focus-within:opacity-70 transition-opacity"></div>
                      <input
                        type="text"
                        placeholder="Masukkan nomor rekening"
                        value={bankAccount}
                        onChange={e => setBankAccount(e.target.value.replace(/[^0-9]/g, ''))}
                        className="relative w-full bg-brand-black/40 backdrop-blur-sm border border-white/10 text-white rounded-2xl px-4 py-4 focus:outline-none focus:border-brand-gold focus:shadow-[0_0_20px_rgba(232,193,82,0.2)] font-medium placeholder-white/40 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  {/* Account Name */}
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-3">
                      Nama Pemilik Rekening
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/20 to-brand-emerald/20 rounded-2xl blur-sm opacity-50 group-focus-within:opacity-70 transition-opacity"></div>
                      <input
                        type="text"
                        placeholder="Sesuai dengan nama di rekening bank"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="relative w-full bg-brand-black/40 backdrop-blur-sm border border-white/10 text-white rounded-2xl px-4 py-4 focus:outline-none focus:border-brand-gold focus:shadow-[0_0_20px_rgba(232,193,82,0.2)] font-medium placeholder-white/40 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !bankId || !bankAccount || !fullName}
                    className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-deep hover:from-brand-gold-deep hover:to-brand-gold disabled:opacity-50 disabled:cursor-not-allowed text-brand-black font-bold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/30 hover:shadow-brand-gold/50 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Icon icon="mdi:plus" className="w-5 h-5" />
                        Tambah Rekening
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </section>

          {/* Info Section */}
          <section className="space-y-6">
            {/* Info Card */}
            <div className="rounded-3xl border border-white/10 bg-brand-surface-soft/90 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Icon icon="mdi:information-variant" className="w-5 h-5 text-brand-gold" />
                <h3 className="text-lg font-semibold text-white">Informasi Penting</h3>
              </div>
              <div className="space-y-3 text-sm text-white/70">
                <div className="flex items-start gap-3">
                  <Icon icon="mdi:check-circle" className="text-brand-emerald mt-1 flex-shrink-0" />
                  <p>Pastikan nama pemilik rekening sesuai dengan identitas Anda.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Icon icon="mdi:shield-check" className="text-brand-gold mt-1 flex-shrink-0" />
                  <p>Rekening harus aktif dan dapat menerima transfer.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Icon icon="mdi:refresh" className="text-brand-emerald mt-1 flex-shrink-0" />
                  <p>Periksa kembali data sebelum menambahkan untuk menghindari kesalahan.</p>
                </div>
              </div>
            </div>

            {/* Security Tips */}
            <div className="rounded-3xl border border-brand-emerald/25 bg-brand-emerald/10 p-6 space-y-3">
              <div className="flex items-center gap-2 text-brand-emerald">
                <Icon icon="mdi:shield-lock" className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Keamanan</h3>
              </div>
              <div className="space-y-2 text-sm text-white/70">
                <p>• Data rekening dienkripsi dan dilindungi</p>
                <p>• Hanya digunakan untuk penarikan dana</p>
                <p>• Tidak dibagikan ke pihak ketiga</p>
              </div>
            </div>

            {/* Help Card */}
            <div className="rounded-3xl border border-brand-gold/25 bg-brand-gold/10 p-6 space-y-3">
              <div className="flex items-center gap-2 text-brand-gold">
                <Icon icon="mdi:help-circle" className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Butuh Bantuan?</h3>
              </div>
              <p className="text-sm text-white/70">
                Jika Anda mengalami kendala, hubungi tim support Money Rich untuk bantuan lebih lanjut.
              </p>
              {applicationData?.link_cs && (
                <button
                  onClick={() => window.open(applicationData.link_cs, '_blank')}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-brand-gold/40 bg-brand-gold/20 px-4 py-3 text-sm font-semibold text-brand-gold transition-colors hover:bg-brand-gold/30"
                >
                  <Icon icon="mdi:chat-processing" className="w-4 h-4" />
                  Hubungi Support
                </button>
              )}
            </div>
          </section>
        </div>
      </div>

      <Copyright />

      {/* Bottom Navigation - Floating */}
      <BottomNavbar />

      <style>{`
        select { -webkit-appearance: none; -moz-appearance: none; appearance: none; }
        select::-ms-expand { display: none; }
      `}</style>
    </div>
  );
}
