import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import BottomNavbar from '../components/BottomNavbar';
import { createDeposit, getInfo } from '../utils/api';
import { BANKS } from '../constants/products';
import Copyright from '../components/copyright';

const getDepositMethods = (minDeposit = 1) => [
  {
    code: 'QRIS',
    title: 'QRIS',
    description: 'Instan, cocok untuk nominal cepat hingga Rp 10.000.000',
    icon: 'mdi:qrcode-scan',
    limit: { min: minDeposit, max: 10000000 },
  },
  {
    code: 'BANK',
    title: 'Transfer Bank',
    description: 'Gunakan untuk nominal besar hingga Rp 100.000.000',
    icon: 'mdi:bank-transfer',
    limit: { min: minDeposit, max: 100000000 },
  },
];

const QUICK_AMOUNTS = {
  QRIS: [100000, 250000, 500000, 1000000, 2000000, 5000000, 10000000],
  BANK: [1000000, 5000000, 10000000, 25000000, 50000000, 75000000, 100000000],
};

const defaultUserSnapshot = {
  name: '',
  balance: 0,
  income: 0,
  level: 0,
};

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

const mapUserSnapshot = (parsed = {}) => {
  const balance =
    parsed.balance ??
    parsed.balance_main ??
    parsed.balance_deposit ??
    0;
  const income =
    parsed.income ??
    parsed.profit ??
    parsed.balance_income ??
    parsed.withdrawable_balance ??
    parsed.total_profit ??
    0;

  return {
    ...defaultUserSnapshot,
    name: parsed.name || parsed.full_name || '',
    balance,
    income,
    level: parsed.level || parsed.vip_level || 0,
  };
};

const getUserSnapshotFromStorage = () => {
  if (typeof window === 'undefined') return defaultUserSnapshot;
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return defaultUserSnapshot;
  try {
    return mapUserSnapshot(JSON.parse(storedUser));
  } catch (error) {
    return defaultUserSnapshot;
  }
};

const getApplicationSnapshot = () => {
  if (typeof window === 'undefined') return { name: 'Money Rich' };
  const storedApp = localStorage.getItem('application');
  if (!storedApp) return { name: 'Money Rich' };
  try {
    const parsed = JSON.parse(storedApp);
    return {
      name: parsed.name || 'Money Rich',
      link_cs: parsed.link_cs || '',
      link_group: parsed.link_group || '',
      min_deposit: parsed.min_deposit || 10000,
    };
  } catch (error) {
    return { name: 'Money Rich' };
  }
};

export default function Deposit() {
  const router = useRouter();
  const [userSnapshot, setUserSnapshot] = useState(defaultUserSnapshot);
  const [applicationData, setApplicationData] = useState({ name: 'Money Rich' });
  const [selectedMethod, setSelectedMethod] = useState('QRIS');
  const [selectedBank, setSelectedBank] = useState(BANKS[0]?.code || '');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    const accessExpire = sessionStorage.getItem('access_expire');
    if (!token || !accessExpire) {
      router.push('/login');
      return;
    }

    setUserSnapshot(getUserSnapshotFromStorage());
    setApplicationData(getApplicationSnapshot());

    // Refresh application settings (including min_deposit) from API so changes in admin take effect.
    (async () => {
      try {
        const data = await getInfo();
        if (data && data.success && data.data) {
          const app = data.data;
          const stored = JSON.parse(sessionStorage.getItem('application') || '{}');
          const merged = { ...(stored || {}), ...app };
          sessionStorage.setItem('application', JSON.stringify(merged));
          setApplicationData((prev) => ({ ...(prev || {}), ...app }));
        }
      } catch (err) {
        // ignore
      }
    })();
  }, [router]);

  useEffect(() => {
    if (selectedMethod === 'BANK' && !selectedBank && BANKS.length > 0) {
      setSelectedBank(BANKS[0].code);
    }
  }, [selectedMethod, selectedBank]);

  const depositMethods = getDepositMethods(applicationData?.min_deposit || 1);
  const methodMeta =
    depositMethods.find((method) => method.code === selectedMethod) ||
    depositMethods[0];
  const limits = methodMeta.limit;
  const quickAmounts = QUICK_AMOUNTS[selectedMethod] || QUICK_AMOUNTS.QRIS;
  const amountNumber = Number(amount);
  const isAmountValid =
    Number.isFinite(amountNumber) &&
    amountNumber >= limits.min &&
    amountNumber <= limits.max;
  const canSubmit =
    !loading &&
    isAmountValid &&
    (selectedMethod !== 'BANK' || !!selectedBank);

  const handleSelectAmount = (value) => {
    setAmount(String(value));
    setNotification({ type: '', message: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setNotification({ type: '', message: '' });

    if (!isAmountValid) {
      setNotification({
        type: 'error',
        message: `Nominal harus antara ${formatCurrency(
          limits.min
        )} dan ${formatCurrency(limits.max)} untuk metode ${
          methodMeta.title
        }.`,
      });
      return;
    }

    if (selectedMethod === 'BANK' && !selectedBank) {
      setNotification({
        type: 'error',
        message: 'Pilih salah satu bank tujuan transfer.',
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        amount: amountNumber,
        payment_method: selectedMethod,
        payment_channel: selectedMethod === 'BANK' ? selectedBank : undefined,
      };
      const response = await createDeposit(payload);
      setLoading(false);
      const orderId = response?.data?.order_id;

      if (orderId) {
        setNotification({
          type: 'success',
          message: 'Permintaan deposit berhasil dibuat. Mengalihkan ke halaman pembayaran...',
        });
        setTimeout(() => {
          router.push(`/payment?order_id=${encodeURIComponent(orderId)}`);
        }, 600);
      } else {
        setNotification({
          type: 'success',
          message:
            'Permintaan deposit berhasil dibuat. Silakan cek riwayat transaksi Anda.',
        });
        setAmount('');
        setUserSnapshot(getUserSnapshotFromStorage());
      }
    } catch (error) {
      setLoading(false);
      setNotification({
        type: 'error',
        message: error?.message || 'Gagal membuat permintaan deposit.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-white relative overflow-hidden pb-32">
      <Head>
        <title>{applicationData?.name || 'Money Rich'} | Deposit</title>
        <meta
          name="description"
          content={`${applicationData?.name || 'Money Rich'} Deposit`}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.18),rgba(5,6,8,0.95))]"></div>
        <div className="absolute -top-32 -left-24 w-[360px] h-[360px] bg-brand-gold/18 blur-[160px] rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-[460px] h-[460px] bg-brand-gold-deep/12 blur-[220px] rounded-full"></div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-brand-emerald/12 blur-[200px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-12 pb-24">
        <div className="mb-10 flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-brand-gold">
            <Icon icon="mdi:wallet" className="w-4 h-4" />
            Deposit Center
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">
                Tambah Saldo Balance Anda
              </h1>
              <p className="text-sm text-white/60 max-w-2xl mt-2">
                Pilih metode pembayaran favorit Anda untuk menambah saldo
                balance. Saldo balance dapat digunakan langsung untuk membeli
                produk investasi Money Rich.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Icon icon="mdi:shield-check" className="w-4 h-4 text-brand-emerald" />
              Transaksi terenkripsi & diawasi otomatis 24/7.
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface-soft/90 p-6 sm:p-8 shadow-[0_20px_60px_rgba(5,6,8,0.6)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.18),transparent)]"></div>
              <div className="relative z-10 flex flex-col gap-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-gold/15 border border-brand-gold/30 text-brand-gold flex items-center justify-center shadow-brand-glow">
                      <Icon icon="mdi:wallet-outline" className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-white/45">
                        Saldo Balance
                      </p>
                      <p className="text-2xl font-semibold text-white mt-1">
                        {formatCurrency(userSnapshot.balance)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/45">
                      Saldo Income
                    </p>
                    <p className="text-xl font-semibold text-brand-emerald mt-1">
                      {formatCurrency(userSnapshot.income)}
                    </p>
                    <p className="text-[11px] text-white/50 mt-1">
                      Dapat dicairkan via menu withdraw.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between text-sm text-white/60">
                  <span>Total dompet (balance + income)</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(userSnapshot.balance + userSnapshot.income)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2">
                      <Icon icon="mdi:lightning-bolt" className="w-4 h-4 text-brand-gold" />
                      <p className="text-sm font-semibold text-white">
                        Otomatis & Real-time
                      </p>
                    </div>
                    <p className="text-xs text-white/55 mt-2">
                      Saldo balance Anda bertambah segera setelah pembayaran
                      terkonfirmasi.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2">
                      <Icon icon="mdi:shield-lock" className="w-4 h-4 text-brand-emerald" />
                      <p className="text-sm font-semibold text-white">
                        Rekonsiliasi Aman
                      </p>
                    </div>
                    <p className="text-xs text-white/55 mt-2">
                      Sistem otomatis memverifikasi setiap transaksi untuk
                      menghindari duplikasi pembayaran.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-brand-surface/80 p-6 sm:p-7 space-y-5">
              <div className="flex items-center gap-2">
                <Icon icon="mdi:format-list-checks" className="w-5 h-5 text-brand-gold" />
                <h2 className="text-lg font-semibold">Langkah Deposit</h2>
              </div>
              <div className="space-y-4 text-sm text-white/65">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-gold/15 border border-brand-gold/30 text-brand-gold font-semibold">
                    1
                  </span>
                  <p>
                    Pilih metode pembayaran (QRIS atau transfer bank) sesuai
                    kebutuhan nominal Anda.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-gold/15 border border-brand-gold/30 text-brand-gold font-semibold">
                    2
                  </span>
                  <p>
                    Masukkan nominal deposit. Sistem otomatis memastikan batas
                    minimum dan maksimum sesuai metode.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-gold/15 border border-brand-gold/30 text-brand-gold font-semibold">
                    3
                  </span>
                  <p>
                    Lakukan pembayaran sesuai instruksi. Saldo bertambah setelah
                    kami menerima konfirmasi sukses.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-brand-emerald/25 bg-brand-emerald/10 p-5 flex flex-col gap-3 text-sm text-white/70">
              <div className="flex items-center gap-2 text-brand-emerald">
                <Icon icon="mdi:headset" className="w-5 h-5" />
                Bantuan Concierge
              </div>
              <p>
                Bila Anda mengalami kendala konfirmasi pembayaran, hubungi tim
                concierge Money Rich untuk bantuan prioritas.
              </p>
              {applicationData?.link_cs && (
                <button
                  onClick={() => window.open(applicationData.link_cs, '_blank')}
                  className="inline-flex w-fit items-center gap-2 rounded-xl border border-brand-emerald/40 bg-brand-emerald/20 px-3 py-2 text-xs font-semibold text-brand-emerald transition-colors hover:bg-brand-emerald/30"
                >
                  <Icon icon="mdi:chat-processing" className="w-4 h-4" />
                  Hubungi Concierge
                </button>
              )}
            </div>
          </section>

          <section className="relative">
            <div className="absolute -inset-1 rounded-[30px] bg-gradient-to-br from-brand-gold/35 via-transparent to-brand-emerald/25 blur-3xl opacity-70"></div>
            <div className="relative rounded-[28px] border border-white/10 bg-brand-surface/95 backdrop-blur-xl p-6 sm:p-8 shadow-brand-glow">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-white/45">
                      Formulir Deposit
                    </p>
                    <h2 className="text-2xl font-semibold text-white mt-1">
                      Pilih Metode Pembayaran
                    </h2>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-brand-gold/15 border border-brand-gold/30 text-brand-gold flex items-center justify-center shadow-brand-glow">
                    <Icon icon={methodMeta.icon} className="w-6 h-6" />
                  </div>
                </div>

                {notification.message && (
                  <div
                    className={`rounded-2xl border px-5 py-4 text-sm font-semibold flex items-start gap-3 ${
                      notification.type === 'success'
                        ? 'bg-brand-emerald/10 border-brand-emerald/30 text-brand-emerald'
                        : 'bg-red-500/10 border-red-500/30 text-red-200'
                    }`}
                  >
                    <Icon
                      icon={
                        notification.type === 'success'
                          ? 'mdi:check-decagram'
                          : 'mdi:alert-decagram'
                      }
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                    />
                    <span className="leading-relaxed">{notification.message}</span>
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <p className="text-xs font-semibold text-white/60 mb-3 uppercase tracking-[0.25em]">
                      Metode Pembayaran
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {depositMethods.map((method) => {
                        const isActive = selectedMethod === method.code;
                        return (
                          <button
                            key={method.code}
                            type="button"
                            onClick={() => {
                              setSelectedMethod(method.code);
                              setNotification({ type: '', message: '' });
                              if (method.code === 'QRIS') {
                                setSelectedBank('');
                              }
                            }}
                            className={`rounded-2xl border px-4 py-4 text-left transition-all duration-300 ${
                              isActive
                                ? 'border-brand-gold/50 bg-brand-gold/15 shadow-brand-glow'
                                : 'border-white/10 bg-white/5 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                  isActive
                                    ? 'bg-brand-gold text-brand-black'
                                    : 'bg-brand-surface text-white/70'
                                }`}
                              >
                                <Icon icon={method.icon} className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white">
                                  {method.title}
                                </p>
                                <p className="text-[11px] text-white/55">
                                  {method.description}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedMethod === 'BANK' && (
                    <div>
                      <p className="text-xs font-semibold text-white/60 mb-3 uppercase tracking-[0.25em]">
                        Pilih Bank
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {BANKS.map((bank) => {
                          const isActive = selectedBank === bank.code;
                          return (
                            <button
                              key={bank.code}
                              type="button"
                              onClick={() => {
                                setSelectedBank(bank.code);
                                setNotification({ type: '', message: '' });
                              }}
                              className={`rounded-2xl border px-4 py-3 transition-all duration-300 flex items-center justify-center ${
                                isActive
                                  ? 'border-brand-gold/50 bg-brand-gold/15 shadow-brand-glow'
                                  : 'border-white/10 bg-white/5 hover:border-white/20'
                              }`}
                            >
                              {bank.icon ? (
                                <Image
                                  src={bank.icon}
                                  alt={bank.name}
                                  width={80}
                                  height={32}
                                  className="object-contain h-6"
                                />
                              ) : (
                                <span className="text-sm font-semibold text-white">
                                  {bank.name}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label
                      htmlFor="amount"
                      className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/60"
                    >
                      <Icon icon="mdi:cash" className="w-4 h-4 text-brand-gold" />
                      Nominal Deposit
                    </label>
                    <div className="relative rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 flex items-center px-4 text-white/60 text-sm font-semibold">
                        Rp
                      </div>
                      <input
                        id="amount"
                        type="number"
                        min={limits.min}
                        max={limits.max}
                        step="1000"
                        className="w-full bg-transparent pl-14 pr-4 py-4 text-lg font-semibold text-white outline-none"
                        placeholder="0"
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {quickAmounts.map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleSelectAmount(value)}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 hover:border-brand-gold/40 hover:text-white transition-colors"
                        >
                          {formatCurrency(value)}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-white/45">
                      Batas metode {methodMeta.title}: minimal{' '}
                      {formatCurrency(limits.min)} & maksimal{' '}
                      {formatCurrency(limits.max)}.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`w-full inline-flex items-center justify-center gap-3 rounded-xl py-3.5 text-sm font-semibold transition-all duration-300 shadow-brand-glow ${
                      canSubmit
                        ? 'bg-gradient-to-r from-brand-gold to-brand-gold-deep text-brand-black hover:-translate-y-0.5'
                        : 'bg-brand-surface text-white/30 cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin rounded-full h-5 w-5 border-2 border-brand-black/30 border-t-brand-black"></span>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Icon
                          icon={
                            selectedMethod === 'QRIS'
                              ? 'mdi:qrcode'
                              : 'mdi:bank-transfer'
                          }
                          className="w-5 h-5"
                        />
                        {selectedMethod === 'QRIS'
                          ? 'Buat Kode QRIS'
                          : 'Buat Instruksi Transfer'}
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
}

