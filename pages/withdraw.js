import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { getBankAccounts, withdrawUser } from '../utils/api';
import BottomNavbar from '../components/BottomNavbar';  
import Copyright from '../components/copyright';

const Withdraw = () => {
  const router = useRouter();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [userData, setUserData] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [minWithdraw, setMinWithdraw] = useState(50000);
  const [maxWithdraw, setMaxWithdraw] = useState(5000000);
  const [fee, setFee] = useState(10);
  const [applicationData, setApplicationData] = useState(null);
  const [isWithdrawalAvailable, setIsWithdrawalAvailable] = useState(false);
  const [withdrawalMessage, setWithdrawalMessage] = useState('');

  const checkWithdrawalAvailability = () => {
    const now = new Date();
    const wibTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const day = wibTime.getDay();
    const hours = wibTime.getHours();

    if (day === 0) {
      setIsWithdrawalAvailable(false);
      setWithdrawalMessage('Penarikan hanya dapat dilakukan pada hari kerja');
      return false;
    }

    if (hours < 12 || hours >= 17) {
      setIsWithdrawalAvailable(false);
      setWithdrawalMessage('Penarikan hanya dapat dilakukan pada jam kerja');
      return false;
    }

    setIsWithdrawalAvailable(true);
    setWithdrawalMessage('');
    return true;
  };

  useEffect(() => {
    checkWithdrawalAvailability();
    const interval = setInterval(checkWithdrawalAvailability, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    const accessExpire = typeof window !== 'undefined' ? sessionStorage.getItem('access_expire') : null;

    if (!token || !accessExpire || new Date() > new Date(accessExpire)) {
        if (typeof window !== 'undefined') router.push('/login');
        return;
    }

    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            setUserData({
              name: user.name || "Tester",
              number: user.number || "882646678601",
              income: user.income || 0,
            });
        } catch (e) {
            console.error("Failed to parse user data from localStorage", e);
        }
    }

    const appConfigStr = typeof window !== 'undefined' ? localStorage.getItem('application') : null;
    if (appConfigStr) {
        try {
            const appConfig = JSON.parse(appConfigStr);
            if (appConfig.min_withdraw) setMinWithdraw(Number(appConfig.min_withdraw));
            if (appConfig.max_withdraw) setMaxWithdraw(Number(appConfig.max_withdraw));
            if (appConfig.withdraw_charge) setFee(Number(appConfig.withdraw_charge));
            setApplicationData({
                name: appConfig.name || 'Money Rich',
                healthy: appConfig.healthy || false,
                company: appConfig.company || 'Money Rich Holdings',
            });
        } catch (e) {
            console.error("Failed to parse application data from localStorage", e);
            setApplicationData({ name: 'Money Rich', healthy: false, company: 'Money Rich Holdings' });
        }
    }

    setPageLoading(false);
  }, [router]);

  useEffect(() => {
    if (!pageLoading) {
      const fetchBank = async () => {
        setFetching(true);
        try {
          const res = await getBankAccounts();
          const accounts = res.data?.bank_account || [];
          setBankAccounts(accounts);
          if (accounts.length > 0) {
            setSelectedBankId(accounts[0].id);
          }
        } catch (err) {
          setErrorMsg('Gagal mengambil data rekening bank');
        } finally {
          setFetching(false);
        }
      };
      fetchBank();
    }
  }, [pageLoading]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!selectedBankId) {
      setErrorMsg('Silakan pilih rekening bank terlebih dahulu');
      return;
    }
    const amountNum = Number(withdrawAmount);
    if (isNaN(amountNum) || amountNum < minWithdraw || amountNum > maxWithdraw) {
      setErrorMsg(`Jumlah penarikan minimal IDR ${formatCurrency(minWithdraw)} dan maksimal IDR ${formatCurrency(maxWithdraw)}`);
      return;
    }
    if (amountNum > userData?.income) {
      setErrorMsg('Saldo income tidak mencukupi untuk penarikan ini');
      return;
    }
    setLoading(true);
    try {
      const data = await withdrawUser({ amount: amountNum, bank_account_id: selectedBankId });
      if (data.success) {
        setSuccessMsg(data.message);
        setWithdrawAmount('');
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            user.income = (user.income || 0) - amountNum;
            localStorage.setItem('user', JSON.stringify(user));
            setUserData({ ...userData, income: user.income });
          } catch (e) {
            console.error("Failed to update user data", e);
          }
        }
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan saat memproses penarikan');
    }
    setLoading(false);
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.18),rgba(5,6,8,0.95))]"></div>
        </div>
        <div className="flex flex-col items-center relative z-10">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-3 border-brand-gold/20 border-t-brand-gold"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-brand-gold/40"></div>
          </div>
          <p className="text-white/70 text-sm mt-4">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black text-white relative overflow-hidden pb-32">
      <Head>
        <title>{applicationData?.name || 'Money Rich'} | Penarikan Dana</title>
        <meta name="description" content={`${applicationData?.name || 'Money Rich'} Withdraw Funds`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.18),rgba(5,6,8,0.95))]"></div>
        <div className="absolute -top-32 -left-24 w-[360px] h-[360px] bg-brand-emerald/18 blur-[160px] rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-[460px] h-[460px] bg-brand-emerald/12 blur-[220px] rounded-full"></div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-brand-gold/12 blur-[200px] rounded-full"></div>
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
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-emerald/30 bg-brand-emerald/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-brand-emerald w-fit">
            <Icon icon="mdi:cash-refund" className="w-4 h-4" />
            Withdraw Center
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">
                Tarik Saldo Income Anda
              </h1>
              <p className="text-sm text-white/60 max-w-2xl mt-2">
                Cairkan hasil investasi langsung ke rekening bank terverifikasi. Proses otomatis setiap hari kerja pukul 12:00 - 17:00 WIB.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Icon icon="mdi:clock-time-four-outline" className="w-4 h-4 text-brand-emerald" />
              {isWithdrawalAvailable ? 'Layanan tersedia' : 'Layanan tutup sementara'}
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left Column - Info & Bank Selection */}
          <section className="space-y-6">
            {/* Income Balance Card */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface-soft/90 p-6 sm:p-8 shadow-[0_20px_60px_rgba(5,6,8,0.6)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.15),transparent)]"></div>
              <div className="relative z-10 flex flex-col gap-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-emerald/15 border border-brand-emerald/30 text-brand-emerald flex items-center justify-center shadow-brand-glow">
                      <Icon icon="mdi:trending-up" className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-white/45">
                        Saldo Income
                      </p>
                      <p className="text-3xl font-black text-brand-emerald mt-1">
                        {formatCurrency(userData?.income || 0)}
                      </p>
                      <p className="text-[11px] text-white/55 mt-2">
                        Hasil investasi yang dapat ditarik kapan saja
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/45">
                      Min. Penarikan
                    </p>
                    <p className="text-xl font-semibold text-white mt-1">
                      {formatCurrency(minWithdraw)}
                    </p>
                    <p className="text-[11px] text-white/50 mt-1">
                      Biaya admin {fee}%
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between text-sm text-white/60">
                  <span>Maksimal penarikan per transaksi</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(maxWithdraw)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2">
                      <Icon icon="mdi:lightning-bolt" className="w-4 h-4 text-brand-emerald" />
                      <p className="text-sm font-semibold text-white">
                        Proses Otomatis
                      </p>
                    </div>
                    <p className="text-xs text-white/55 mt-2">
                      Penarikan diproses batch setiap pukul 17:00 - 19:00 WIB
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2">
                      <Icon icon="mdi:shield-lock" className="w-4 h-4 text-brand-gold" />
                      <p className="text-sm font-semibold text-white">
                        Rekening Terverifikasi
                      </p>
                    </div>
                    <p className="text-xs text-white/55 mt-2">
                      Transfer langsung ke rekening bank yang telah diverifikasi
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Selection Section */}
            <div className="rounded-3xl border border-white/10 bg-brand-surface/80 p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:bank-outline" className="w-5 h-5 text-brand-gold" />
                  <h2 className="text-lg font-semibold">Pilih Rekening Tujuan</h2>
                </div>
                {bankAccounts.length > 0 && (
                  <button
                    onClick={() => router.push('/bank')}
                    className="text-xs text-brand-gold hover:text-brand-gold-deep font-semibold flex items-center gap-1"
                  >
                    Kelola
                    <Icon icon="mdi:chevron-right" className="w-4 h-4" />
                  </button>
                )}
              </div>

              {fetching ? (
                <div className="flex flex-col items-center justify-center my-12">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-10 w-10 border-3 border-brand-gold/20 border-t-brand-gold"></div>
                    <div className="absolute inset-0 animate-ping rounded-full h-10 w-10 border-2 border-brand-gold/40"></div>
                  </div>
                  <p className="text-white/70 text-center mt-4 text-sm">Memuat data rekening...</p>
                </div>
              ) : bankAccounts.length === 0 ? (
                <div className="text-center py-10 bg-brand-black/40 rounded-2xl border border-brand-gold/20">
                  <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-gold/20">
                    <Icon icon="mdi:bank-off-outline" className="text-brand-gold w-8 h-8" />
                  </div>
                  <h4 className="text-white font-bold text-lg mb-2">Belum Ada Rekening Bank</h4>
                  <p className="text-white/60 text-sm mb-4 px-4">Tambahkan rekening bank untuk melakukan penarikan dana.</p>
                  <button
                    onClick={() => router.push('/bank/add')}
                    className="bg-gradient-to-r from-brand-gold to-brand-gold-deep hover:from-brand-gold-deep hover:to-brand-gold text-brand-black font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-brand-gold/30 hover:shadow-brand-gold/50 hover:scale-[1.02] active:scale-[0.98] mx-auto"
                  >
                    <Icon icon="mdi:bank-plus" className="w-5 h-5" />
                    Tambah Rekening Bank
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {bankAccounts.map((bank) => (
                    <button
                      key={bank.id}
                      onClick={() => setSelectedBankId(bank.id)}
                      className={`w-full text-left relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                        selectedBankId === bank.id
                          ? 'border-brand-gold bg-brand-gold/10 shadow-lg shadow-brand-gold/20'
                          : 'border-white/10 bg-brand-black/40 hover:border-brand-gold/30 hover:bg-brand-black/60'
                      }`}
                    >
                      {selectedBankId === bank.id && (
                        <div className="absolute top-0 right-0 w-20 h-20 bg-brand-gold/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                      )}
                      <div className="relative p-4 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                          selectedBankId === bank.id
                            ? 'bg-gradient-to-br from-brand-gold to-brand-gold-deep'
                            : 'bg-brand-surface/50'
                        }`}>
                          <Icon icon="mdi:bank" className="text-xl text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold text-sm mb-1 ${
                            selectedBankId === bank.id ? 'text-white' : 'text-white/80'
                          }`}>
                            {bank.bank_name}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-white/60">
                            <span className="flex items-center gap-1">
                              <Icon icon="mdi:credit-card-outline" className="w-3 h-3" />
                              {bank.account_number}
                            </span>
                            <span>•</span>
                            <span className="truncate">{bank.account_name}</span>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedBankId === bank.id
                            ? 'border-brand-gold bg-brand-gold'
                            : 'border-white/30'
                        }`}>
                          {selectedBankId === bank.id && (
                            <Icon icon="mdi:check" className="text-brand-black w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info Card */}
            <div className="rounded-3xl border border-brand-emerald/25 bg-brand-emerald/10 p-5 flex flex-col gap-3 text-sm text-white/70">
              <div className="flex items-center gap-2 text-brand-emerald">
                <Icon icon="mdi:information-variant" className="w-5 h-5" />
                Informasi Penarikan
              </div>
              <div className="space-y-2 text-xs">
                <p>• Penarikan dana minimal {formatCurrency(minWithdraw)}</p>
                <p>• Biaya admin {fee}% dipotong dari jumlah penarikan</p>
                <p>• Penarikan hanya dapat dilakukan 1x per hari</p>
                <p>• Jam operasional: Senin-Sabtu, 12:00 - 17:00 WIB</p>
                <p>• Proses batch: 17:00 - 19:00 WIB</p>
              </div>
            </div>
          </section>

          {/* Right Column - Withdrawal Form */}
          <section className="relative">
            <div className="absolute -inset-1 rounded-[30px] bg-gradient-to-br from-brand-emerald/35 via-transparent to-brand-gold/25 blur-3xl opacity-70"></div>
            <div className="relative rounded-[28px] border border-white/10 bg-brand-surface/95 backdrop-blur-xl p-6 sm:p-8 shadow-brand-glow">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-white/45">
                      Formulir Penarikan
                    </p>
                    <h2 className="text-2xl font-semibold text-white mt-1">
                      Masukkan Jumlah
                    </h2>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-brand-emerald/15 border border-brand-emerald/30 text-brand-emerald flex items-center justify-center shadow-brand-glow">
                    <Icon icon="mdi:cash-refund" className="w-6 h-6" />
                  </div>
                </div>

                {errorMsg && (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm font-semibold flex items-start gap-3">
                    <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-red-200">{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="rounded-2xl border border-brand-emerald/30 bg-brand-emerald/10 px-5 py-4 text-sm font-semibold flex items-start gap-3">
                    <Icon icon="mdi:check-circle" className="w-5 h-5 text-brand-emerald flex-shrink-0 mt-0.5" />
                    <span className="text-brand-emerald">{successMsg}</span>
                  </div>
                )}

                {!isWithdrawalAvailable && withdrawalMessage && (
                  <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-4 text-sm font-semibold flex items-start gap-3">
                    <Icon icon="mdi:clock-alert-outline" className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-yellow-200 font-bold mb-1">{withdrawalMessage}</p>
                      <p className="text-yellow-200/80 text-xs">Penarikan dana tersedia Senin-Sabtu pukul 12:00 - 17:00 WIB</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleWithdraw} className="space-y-6">
                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-3">
                      Jumlah Penarikan
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-emerald/20 to-brand-gold/20 rounded-2xl blur-sm opacity-50 group-focus-within:opacity-70 transition-opacity"></div>
                      <div className="relative flex items-center bg-brand-black/40 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 focus-within:border-brand-emerald focus-within:shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        <div className="flex items-center justify-center w-16 bg-gradient-to-br from-brand-emerald/20 to-teal-500/20 h-full border-r border-white/10">
                          <span className="text-white/90 text-sm font-bold">IDR</span>
                        </div>
                        <input
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="flex-1 bg-transparent outline-none py-5 px-4 text-white placeholder-white/40 text-xl font-black"
                          placeholder={minWithdraw.toLocaleString('id-ID')}
                          min={minWithdraw}
                          max={maxWithdraw}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs text-white/60">
                      <span>Min: {formatCurrency(minWithdraw)}</span>
                      <span>Maks: {formatCurrency(maxWithdraw)}</span>
                    </div>
                  </div>

                  {/* Calculation Preview */}
                  {withdrawAmount && !isNaN(Number(withdrawAmount)) && Number(withdrawAmount) > 0 && (
                    <div className="rounded-2xl border border-white/10 bg-brand-black/40 p-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">Jumlah Penarikan</span>
                        <span className="text-white font-semibold">{formatCurrency(Number(withdrawAmount))}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">Biaya Admin ({fee}%)</span>
                        <span className="text-red-400 font-semibold">-{formatCurrency(Math.round(Number(withdrawAmount) * fee / 100))}</span>
                      </div>
                      <div className="border-t border-white/10 pt-2 flex items-center justify-between">
                        <span className="text-white font-semibold">Jumlah Diterima</span>
                        <span className="text-brand-emerald font-black text-lg">{formatCurrency(Number(withdrawAmount) - Math.round(Number(withdrawAmount) * fee / 100))}</span>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !isWithdrawalAvailable || bankAccounts.length === 0 || !selectedBankId}
                    className="w-full bg-gradient-to-r from-brand-emerald to-teal-500 hover:from-teal-500 hover:to-brand-emerald disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-brand-emerald/30 hover:shadow-brand-emerald/50 hover:scale-[1.02] flex items-center justify-center gap-3 active:scale-[0.98] disabled:hover:scale-100"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                        Memproses...
                      </>
                    ) : !isWithdrawalAvailable ? (
                      <>
                        <Icon icon="mdi:lock-clock" className="w-5 h-5" />
                        Penarikan Tidak Tersedia
                      </>
                    ) : (
                      <>
                        <Icon icon="mdi:send-check" className="w-5 h-5" />
                        Konfirmasi Penarikan
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Copyright />

      {/* Bottom Navigation - Floating */}
      <BottomNavbar />
    </div>
  );
};

export default Withdraw;
