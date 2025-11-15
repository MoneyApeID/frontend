// pages/payment.js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { getPaymentByOrderId } from '../utils/api';
import BottomNavbar from '../components/BottomNavbar';
import Image from 'next/image';
import Copyright from '../components/copyright';

export default function Payment() {
  const router = useRouter();
  const [payment, setPayment] = useState(null);
  const [expired, setExpired] = useState(false);
  const [timer, setTimer] = useState('');
  const [copied, setCopied] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [applicationData, setApplicationData] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    const accessExpire = sessionStorage.getItem('access_expire');
    if (!token || !accessExpire) {
      router.push('/login');
      return;
    }
    const fetchPayment = async () => {
      if (router.query.order_id) {
        setLoading(true);
        setErrorMsg('');
        try {
          const res = await getPaymentByOrderId(router.query.order_id);
          if (res && res.data) {
            setPayment(res.data);
            setErrorMsg('');
          } else if (res && res.message) {
            setErrorMsg(res.message);
            setPayment(null);
          } else {
            setErrorMsg('Data pembayaran deposit tidak ditemukan.');
            setPayment(null);
          }
        } catch (e) {
          if (e?.response?.status === 404 && e?.response?.data?.message) {
            setErrorMsg(e.response.data.message);
          } else {
            setErrorMsg('Data pembayaran deposit tidak ditemukan.');
          }
          setPayment(null);
        }
        setLoading(false);
      }
    };
    fetchPayment();
    
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.order_id]);

  useEffect(() => {
    if (!payment?.expired_at) return;
    
    const end = new Date(payment.expired_at).getTime();
    const updateTimer = () => {
      const now = Date.now();
      const diff = end - now;
      if (diff <= 0) {
        setTimer('00:00:00');
        setExpired(true);
        return;
      }
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setTimer(`${h}:${m}:${s}`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [payment?.expired_at]);

  const formatCurrency = (amt) => new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    maximumFractionDigits: 0 
  }).format(amt || 0);

  const handleCopy = (key, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopied((prev) => ({ ...prev, [key]: false }));
    }, 1800);
  };

  const handleDownloadQR = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'qris-deposit.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center p-4 relative overflow-hidden pb-32">
        <Head>
          <title>{applicationData?.name || 'Money Rich'} | Pembayaran Deposit</title>
          <meta name="description" content={`${applicationData?.name || 'Money Rich'} Pembayaran Deposit`} />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        
        {/* Background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.18),rgba(5,6,8,0.95))]"></div>
          <div className="absolute -top-32 -left-24 w-[360px] h-[360px] bg-brand-gold/18 blur-[160px] rounded-full"></div>
          <div className="absolute bottom-0 right-0 w-[460px] h-[460px] bg-brand-gold-deep/12 blur-[220px] rounded-full"></div>
        </div>
        
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-gold to-brand-gold-deep rounded-3xl blur-xl opacity-30"></div>
          <div className="relative bg-brand-surface-soft/90 rounded-3xl p-8 border border-white/10 shadow-2xl max-w-md w-full text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-3 border-brand-gold/20 border-t-brand-gold"></div>
                <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-brand-gold/40"></div>
              </div>
              <p className="text-white/80 text-sm animate-pulse">Memuat data pembayaran deposit...</p>
            </div>
          </div>
        </div>

        {/* Bottom Navigation - Floating */}
        <BottomNavbar />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center p-4 relative overflow-hidden pb-32">
        <Head>
          <title>{applicationData?.name || 'Money Rich'} | Pembayaran Deposit</title>
          <meta name="description" content={`${applicationData?.name || 'Money Rich'} Pembayaran Deposit`} />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        
        {/* Background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.18),rgba(5,6,8,0.95))]"></div>
          <div className="absolute -top-32 -left-24 w-[360px] h-[360px] bg-brand-gold/18 blur-[160px] rounded-full"></div>
          <div className="absolute bottom-0 right-0 w-[460px] h-[460px] bg-brand-gold-deep/12 blur-[220px] rounded-full"></div>
        </div>
        
        <div className="relative max-w-md w-full">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-red-700 rounded-3xl blur-xl opacity-30"></div>
          <div className="relative bg-brand-surface-soft/90 rounded-3xl p-8 border border-red-500/20 shadow-2xl">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <Icon icon="mdi:alert-circle" className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-black text-lg mb-2">Data Tidak Ditemukan</h3>
                <p className="text-white/70 text-sm">{errorMsg || 'Data pembayaran deposit tidak ditemukan.'}</p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gradient-to-r from-brand-gold to-brand-gold-deep hover:from-brand-gold-deep hover:to-brand-gold text-brand-black font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-brand-gold/30"
              >
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        </div>
        <Copyright />

        {/* Bottom Navigation - Floating */}
        <BottomNavbar />
      </div>
    );
  }

  const amount = payment.amount || 0;
  const paymentMethod = payment.payment_method || '';
  const paymentChannel = payment.payment_channel || '';
  const paymentCode = payment.payment_code || '';
  const paymentUrl = payment.payment_url || '';
  const orderId = payment.order_id || '';
  const qrUrl = paymentUrl || (paymentCode ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentCode)}` : '');

  return (
    <div className="min-h-screen bg-brand-black text-white relative overflow-hidden pb-32">
      <Head>
        <title>{applicationData?.name || 'Money Rich'} | Pembayaran Deposit</title>
        <meta name="description" content={`${applicationData?.name || 'Money Rich'} Pembayaran Deposit`} />
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
            <Icon icon="mdi:cash-check" className="w-4 h-4" />
            Payment
            </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Pembayaran Deposit
            </h1>
            <p className="text-sm text-white/60 max-w-2xl mt-2">
              Selesaikan pembayaran deposit Anda. Saldo balance akan ditambahkan setelah pembayaran terkonfirmasi.
            </p>
          </div>
        </div>

        {/* Main Payment Card */}
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-gold/30 to-brand-gold-deep/30 rounded-3xl blur-xl opacity-30"></div>
          
          <div className="relative bg-brand-surface-soft/90 rounded-3xl border border-white/10 shadow-[0_20px_60px_rgba(5,6,8,0.6)] overflow-hidden">
            {/* Timer Bar */}
            <div className={`px-6 py-4 border-b border-white/10 ${
              expired 
                ? 'bg-gradient-to-r from-red-500/20 to-red-600/20' 
                : 'bg-gradient-to-r from-brand-gold/10 to-brand-gold-deep/10'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon icon={expired ? "mdi:clock-alert" : "mdi:clock-outline"} 
                    className={`w-5 h-5 ${expired ? 'text-red-400' : 'text-brand-gold'}`} 
                  />
                  <span className="text-white/80 text-sm font-semibold">
                    {expired ? 'Waktu Habis' : 'Batas Waktu Pembayaran'}
                  </span>
                </div>
                <div className={`px-4 py-2 rounded-xl font-mono font-black text-sm border ${
                  expired 
                    ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                    : 'bg-brand-gold/20 text-brand-gold border-brand-gold/30'
                }`}>
                  {timer || '00:00:00'}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Deposit Info */}
              <div className="rounded-2xl border border-white/10 bg-brand-black/40 p-5">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Tipe Transaksi</span>
                    <span className="text-white font-semibold text-sm">Deposit</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Nominal Deposit</span>
                    <span className="text-brand-gold font-black text-xl">{formatCurrency(amount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Metode Pembayaran</span>
                    <span className="text-white font-semibold text-sm">
                      {paymentMethod === 'QRIS' ? 'QRIS' : `Bank ${paymentChannel}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order ID */}
              <div>
                <label className="block text-white/70 text-xs font-semibold mb-2 flex items-center gap-2">
                  <Icon icon="mdi:identifier" className="w-4 h-4 text-brand-gold" />
                  Order ID
                </label>
                <div className="flex items-center gap-2 bg-brand-black/40 rounded-xl p-3 border border-white/10">
                  <span className="flex-1 text-white font-mono text-sm break-all">{orderId}</span>
                  <button
                    onClick={() => handleCopy('orderId', orderId)}
                    className={`flex-shrink-0 p-2 rounded-lg transition-all border ${
                      copied.orderId 
                        ? 'bg-brand-emerald/20 text-brand-emerald border-brand-emerald/30' 
                        : 'bg-brand-surface text-white/70 hover:text-white hover:bg-brand-surface-soft border-white/10'
                    }`}
                  >
                    <Icon icon={copied.orderId ? "mdi:check" : "mdi:content-copy"} className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Payment Details - QRIS */}
              {paymentMethod === 'QRIS' && qrUrl && (
                <div className="rounded-2xl border border-brand-gold/30 bg-gradient-to-br from-brand-gold/10 to-brand-gold-deep/5 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center">
                      <Icon icon="mdi:qrcode-scan" className="w-5 h-5 text-brand-gold" />
                    </div>
                    <h3 className="text-white font-black text-base">Scan QR Code</h3>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-4 mb-4 flex items-center justify-center">
                    <div className="relative w-64 h-64">
                      <Image
                      src={qrUrl} 
                        alt="QRIS Deposit"
                        fill
                        className="object-contain rounded-lg"
                        unoptimized
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDownloadQR(qrUrl)}
                    className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-deep hover:from-brand-gold-deep hover:to-brand-gold text-brand-black font-black py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/30"
                  >
                    <Icon icon="mdi:download" className="w-5 h-5" />
                    Download QR Code
                  </button>
                  
                  <p className="text-white/60 text-xs text-center mt-4">
                    Scan menggunakan aplikasi e-wallet atau mobile banking untuk menyelesaikan pembayaran deposit.
                  </p>
                </div>
              )}

              {/* Payment Details - Bank Transfer */}
              {paymentMethod === 'BANK' && paymentCode && (
                <div className="rounded-2xl border border-brand-emerald/30 bg-gradient-to-br from-brand-emerald/10 to-brand-emerald/5 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-emerald/20 border border-brand-emerald/30 flex items-center justify-center">
                      <Icon icon="mdi:bank-transfer" className="w-5 h-5 text-brand-emerald" />
                    </div>
                    <h3 className="text-white font-black text-base">Transfer Bank</h3>
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-xs font-semibold mb-2">
                      Virtual Account {paymentChannel}
                    </label>
                    <div className="flex items-center gap-2 bg-brand-black/40 rounded-xl p-4 border border-white/10">
                      <span className="flex-1 text-white font-mono text-lg font-black break-all tracking-wider">
                        {paymentCode}
                      </span>
                      <button
                        onClick={() => handleCopy('va', paymentCode)}
                        className={`flex-shrink-0 p-2 rounded-lg transition-all border ${
                          copied.va 
                            ? 'bg-brand-emerald/20 text-brand-emerald border-brand-emerald/30' 
                            : 'bg-brand-surface text-white/70 hover:text-white hover:bg-brand-surface-soft border-white/10'
                        }`}
                      >
                        <Icon icon={copied.va ? "mdi:check" : "mdi:content-copy"} className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-white/60 text-xs text-center mt-4">
                    Transfer melalui ATM, mobile banking, atau internet banking. Saldo balance akan ditambahkan setelah pembayaran terkonfirmasi.
                  </p>
                </div>
              )}

              {/* Payment URL (if available) */}
              {paymentUrl && paymentMethod !== 'QRIS' && (
                <div className="rounded-2xl border border-brand-gold/30 bg-brand-gold/10 p-4">
                  <div className="flex items-center gap-3">
                    <Icon icon="mdi:link" className="w-5 h-5 text-brand-gold flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-brand-gold font-semibold text-sm mb-1">Link Pembayaran</p>
                      <p className="text-white/80 text-xs">Klik link di bawah untuk melakukan pembayaran</p>
                    </div>
                    <a
                      href={paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-brand-gold text-brand-black font-bold text-xs hover:bg-brand-gold-deep transition-all duration-300"
                    >
                      Bayar
                    </a>
                  </div>
                </div>
              )}

              {/* Info Section */}
              <div className="rounded-2xl border border-white/10 bg-brand-black/40 p-4">
                <div className="flex items-start gap-3">
                  <Icon icon="mdi:information" className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">Informasi Penting</p>
                    <p className="text-white/60 text-xs leading-relaxed">
                      Setelah pembayaran berhasil, saldo balance Anda akan langsung ditambahkan. Jika saldo belum bertambah setelah 5 menit, silakan hubungi customer service.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push('/deposit')}
                  className="flex-1 bg-brand-surface hover:bg-brand-surface-soft text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 border border-white/10 flex items-center justify-center gap-2"
                >
                  <Icon icon="mdi:arrow-left" className="w-5 h-5" />
                  Kembali ke Deposit
                </button>
              <button
                  onClick={() => router.push('/transactions?type=deposit')}
                  className="flex-1 bg-gradient-to-r from-brand-gold to-brand-gold-deep hover:from-brand-gold-deep hover:to-brand-gold text-brand-black font-black py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-brand-gold/30 flex items-center justify-center gap-2"
              >
                  <Icon icon="mdi:history" className="w-5 h-5" />
                  Lihat Riwayat
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Bottom Navigation - Floating */}
      <BottomNavbar />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn { 
          animation: fadeIn 0.5s ease-out; 
        }
      `}</style>
    </div>
  );
}





