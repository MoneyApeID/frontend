// pages/dashboard.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getProducts } from '../utils/api';
import InvestmentModal from '../components/InvestmentModal';
import Toast from '../components/Toast';
import { Icon } from '@iconify/react';
import BottomNavbar from '../components/BottomNavbar';
import Image from 'next/image';
import Copyright from '../components/copyright';

const defaultUserSnapshot = {
  name: '',
  balance: 0,
  income: 0,
  active: false,
  level: 1, // Default level 1
  total_invest: 0,
  total_invest_vip: 0,
};

const mapUserSnapshot = (parsed = {}) => {
  const balance = parsed.balance ?? parsed.balance_main ?? parsed.balance_deposit ?? 0;
  const income = parsed.income ?? parsed.profit ?? parsed.balance_income ?? parsed.withdrawable_balance ?? parsed.total_profit ?? 0;

  return {
    ...defaultUserSnapshot,
    name: parsed.name || parsed.full_name || '',
    balance,
    income,
    active: parsed.active || false,
    level: parsed.level || parsed.vip_level || 1, // Default level 1 untuk user baru
    total_invest: parsed.total_invest || parsed.totalInvestment || 0,
    total_invest_vip: parsed.total_invest_vip || parsed.totalInvestVip || 0,
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

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [applicationData, setApplicationData] = useState(null);
  const [products, setProducts] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('Monitor');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
  const [showPopup, setShowPopup] = useState(false);
  const [popupImageUrl, setPopupImageUrl] = useState(null);
  const [popupLoading, setPopupLoading] = useState(false);

  const refreshUserData = () => {
    const snapshot = getUserSnapshotFromStorage();
    setUserData(snapshot);
    return snapshot;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    const accessExpire = sessionStorage.getItem('access_expire');
    if (!token || !accessExpire) {
      router.push('/login');
      return;
    }
    const storedApplication = localStorage.getItem('application');
    
    const popupHiddenUntil = localStorage.getItem('popupHiddenUntil');
    const now = new Date().getTime();
    
    setUserData(getUserSnapshotFromStorage());

    if (storedApplication) {
      try {
        const parsed = JSON.parse(storedApplication);
        setApplicationData({
          name: parsed.name || 'Money Rich',
          healthy: parsed.healthy || false,
          link_app: parsed.link_app,
          link_cs: parsed.link_cs,
          link_group: parsed.link_group,
          logo: parsed.logo,
          max_withdraw: parsed.max_withdraw,
          min_withdraw: parsed.min_withdraw,
          withdraw_charge: parsed.withdraw_charge,
          popup: parsed.popup,
          popup_title: parsed.popup_title
        });
      } catch (e) {
        setApplicationData({ name: 'Money Rich', healthy: false });
      }
    } else {
      setApplicationData({ name: 'Money Rich', healthy: false });
    }
    
    fetchProducts();
  }, [router]);

  // Fetch popup image when application data is loaded
  useEffect(() => {
    if (!applicationData?.popup) return;
    
    const popupHiddenUntil = localStorage.getItem('popupHiddenUntil');
    const now = new Date().getTime();
    
    if (!popupHiddenUntil || now > parseInt(popupHiddenUntil)) {
      const popupTimer = setTimeout(() => {
        fetchPopupImage();
      }, 1000);
      return () => clearTimeout(popupTimer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationData?.popup]);

  useEffect(() => {
    // Auto-select first product in selected category
    if (products[selectedCategory] && products[selectedCategory].length > 0 && !selectedProduct) {
      setSelectedProduct(products[selectedCategory][0]);
    }
  }, [products, selectedCategory, selectedProduct]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProducts();
      setProducts((data && data.data) ? data.data : {});
      
      if (data && data.data) {
        const categories = Object.keys(data.data);
        // Order tabs explicitly: Monitor (left), Insight (middle), Autopilot (right)
        const preferred = ['Monitor', 'Insight', 'Autopilot'];
        const orderedCategories = [
          // first include preferred keys in that exact order if they exist
          ...preferred.filter(k => categories.includes(k)),
          // then include any other keys that were present (preserve their original order)
          ...categories.filter(k => !preferred.includes(k))
        ];
        if (orderedCategories.length > 0) {
          setSelectedCategory(orderedCategories[0]);
        }
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat produk');
      setToast({ open: true, message: err.message || 'Gagal memuat produk', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const getCategoryIcon = (categoryName) => {
    if (categoryName.toLowerCase().includes('monitor')) return 'mdi:monitor-dashboard';
    if (categoryName.toLowerCase().includes('insight')) return 'mdi:lightbulb-on';
    if (categoryName.toLowerCase().includes('autopilot')) return 'mdi:rocket-launch';
    return 'mdi:star-outline';
  };

  const getProductIcon = (productName) => {
    if (productName.includes('1')) return 'mdi:numeric-1-box';
    if (productName.includes('2')) return 'mdi:numeric-2-box';
    if (productName.includes('3')) return 'mdi:numeric-3-box';
    if (productName.includes('4')) return 'mdi:numeric-4-box';
    if (productName.includes('5')) return 'mdi:numeric-5-box';
    if (productName.includes('6')) return 'mdi:numeric-6-box';
    if (productName.includes('7')) return 'mdi:numeric-7-box';
    return 'mdi:star-outline';
  };

  const calculateTotalReturn = (product) => {
    if (!product) return 0;
    return (product.daily_profit * product.duration);
  };

  const calculateROI = (product) => {
    if (!product || !product.amount) return 0;
    const totalProfit = calculateTotalReturn(product);
    return (totalProfit / product.amount) * 100;
  };

  const formatPercentage = (value) => new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 1,
    minimumFractionDigits: value > 0 && value < 1 ? 1 : 0,
  }).format(value);

  const getVIPConfig = (level) => {
    const configs = {
      1: { icon: 'mdi:star-circle', gradient: 'from-brand-gold to-brand-gold-deep', emoji: '⭐' },
      2: { icon: 'mdi:crown', gradient: 'from-brand-emerald to-teal-500', emoji: '👑' }
    };
    return configs[level] || configs[1]; // Default level 1
  };

  const getVerificationStatus = () => {
    if (userData?.active) {
      return { text: 'Verified Investor', color: 'text-brand-gold' };
    }
    return { text: 'Unverified Investor', color: 'text-red-400' };
  };

  // Fetch popup image from S3
  const fetchPopupImage = async () => {
    if (!applicationData?.popup) return;
    
    setPopupLoading(true);
    try {
      const res = await fetch(`/api/s3-image-server?key=${encodeURIComponent(applicationData.popup)}`);
      const data = await res.json();
      if (data?.url) {
        setPopupImageUrl(data.url);
        setShowPopup(true);
      }
    } catch (err) {
      console.error('Error fetching popup image:', err);
    } finally {
      setPopupLoading(false);
    }
  };

  // Close popup
  const handleClosePopup = () => {
    setShowPopup(false);
  };

  // Hide popup for 10 minutes
  const handleHidePopup10Minutes = () => {
    const tenMinutesFromNow = new Date().getTime() + 10 * 60 * 1000;
    localStorage.setItem('popupHiddenUntil', tenMinutesFromNow.toString());
    setShowPopup(false);
  };

  const vipConfig = getVIPConfig(userData?.level || 1);
  const totalWallet = (userData?.balance || 0) + (userData?.income || 0);
  const availableBalance = userData?.balance || 0;
  const selectedProductAmount = selectedProduct?.amount || 0;
  const balanceAfterSelected = availableBalance - selectedProductAmount;
  const canPurchaseSelectedProduct = selectedProduct ? balanceAfterSelected >= 0 : false;

  return (
    <div className="min-h-screen bg-brand-black pb-32 relative overflow-hidden text-white">
      <Head>
        <title>{applicationData?.name || 'Money Rich'} | Dashboard</title>
        <meta name="description" content={`${applicationData?.name || 'Money Rich'} Dashboard`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.18),rgba(5,6,8,0.95))]"></div>
        <div className="absolute -top-28 -left-24 w-[360px] h-[360px] bg-brand-gold/18 blur-[160px] rounded-full"></div>
        <div className="absolute top-1/3 right-[-140px] w-[500px] h-[500px] bg-brand-gold-deep/14 blur-[200px] rounded-full"></div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-brand-emerald/10 blur-[180px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-12 pb-32">
        <section className="grid gap-5 lg:grid-cols-[1.6fr_1fr] mb-10">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-surface to-brand-charcoal p-6 sm:p-8 shadow-[0_20px_60px_rgba(5,6,8,0.65)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.18),transparent)]"></div>
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-brand-surface border border-white/10 flex items-center justify-center shadow-brand-glow">
                    <Image 
                      src="/logo.svg"
                      alt="Money Rich Logo"
                      width={56}
                      height={56}
                      priority
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">Money Rich</p>
                    <h1 className="text-2xl font-semibold text-white leading-tight">
                      {userData?.name ? `Halo, ${userData.name}` : 'Halo, Investor Money Rich'}
                    </h1>
                  </div>
                </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => router.push('/vip')}
                    className="inline-flex items-center gap-2 rounded-xl border border-brand-gold/40 bg-gradient-to-r from-brand-gold to-brand-gold-deep px-4 py-2.5 text-sm font-semibold text-brand-black shadow-brand-glow transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    <Icon icon={vipConfig.icon} className="w-4 h-4" />
                    VIP {userData?.level || 1}
            </button>
            <button 
              onClick={() => router.push('/portofolio')}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/80 hover:text-white transition-transform duration-300 hover:-translate-y-0.5"
            >
                    <Icon icon="mdi:chart-line" className="w-4 h-4" />
                    Portofolio
            </button>
          </div>
        </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="relative overflow-hidden rounded-3xl border border-brand-gold/25 bg-gradient-to-br from-brand-gold/12 via-brand-surface to-brand-surface-soft p-5 shadow-[0_18px_45px_rgba(5,6,8,0.45)]">
                  <div className="absolute -top-16 -right-12 w-40 h-40 rounded-full bg-brand-gold/35 blur-3xl opacity-70"></div>
                  <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                <div>
                        <p className="text-[11px] uppercase tracking-[0.35em] text-brand-gold/80">Saldo Balance</p>
                        <p className="text-2xl font-semibold text-white mt-1">{formatCurrency(userData?.balance || 0)}</p>
                        <p className="text-[11px] text-white/55 mt-2">Dana siap pakai untuk membeli produk investasi.</p>
                  </div>
            <button 
                        onClick={() => router.push('/deposit')}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-gold to-brand-gold-deep text-brand-black font-semibold text-xs px-3 py-2 shadow-brand-glow transition-transform duration-300 hover:-translate-y-0.5"
            >
                        <Icon icon="mdi:wallet-plus" className="w-4 h-4" />
                        Top Up
            </button>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-white/50">
                      <Icon icon="mdi:shield-check" className="w-3.5 h-3.5 text-brand-gold" />
                      <span>Total dompet: {formatCurrency(totalWallet)}</span>
                    </div>
                </div>
              </div>
              
                <div className="relative overflow-hidden rounded-3xl border border-brand-emerald/25 bg-gradient-to-br from-brand-surface via-brand-charcoal to-brand-surface-soft p-5 shadow-[0_18px_45px_rgba(5,6,8,0.45)]">
                  <div className="absolute -bottom-16 -left-20 w-44 h-44 rounded-full bg-brand-emerald/30 blur-3xl opacity-60"></div>
                  <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.35em] text-brand-emerald/80">Saldo Income</p>
                        <p className="text-2xl font-semibold text-white mt-1">{formatCurrency(userData?.income || 0)}</p>
                        <p className="text-[11px] text-white/55 mt-2">Hasil investasi yang dapat dicairkan kapan saja.</p>
                </div>
                      <button
                        onClick={() => router.push('/withdraw')}
                        className="inline-flex items-center gap-2 rounded-xl border border-brand-emerald/40 bg-brand-emerald/15 text-brand-emerald font-semibold text-xs px-3 py-2 transition-transform duration-300 hover:-translate-y-0.5"
                      >
                        <Icon icon="mdi:cash-refund" className="w-4 h-4" />
                        Tarik
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-white/50">
                      <Icon icon="mdi:calendar-clock" className="w-3.5 h-3.5 text-brand-emerald" />
                      <span>Pencairan cepat ke rekening terverifikasi.</span>
                    </div>
                  </div>
              </div>
            </div>
            
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-white/65 max-w-xl">
                  {applicationData?.name || 'Money Rich'} memberikan akses ke strategi investasi terkurasi dengan dukungan concierge eksklusif untuk setiap member.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push('/bonus-hub')}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-white/75 hover:text-white transition-colors"
                  >
                    <Icon icon="mdi:gift-open" className="w-4 h-4" />
                    Lihat Bonus
                  </button>
                  <button
                    onClick={() => router.push('/guide')}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-white/75 hover:text-white transition-colors"
                  >
                    <Icon icon="mdi:information-outline" className="w-4 h-4" />
                    Panduan Cepat
                  </button>
                  </div>
              </div>
              </div>
            </div>
            
          <div className="relative overflow-hidden rounded-3xl border border-brand-gold/40 bg-brand-surface-soft/90 p-6 flex flex-col gap-5 shadow-[0_20px_50px_rgba(5,6,8,0.55)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(232,193,82,0.22),transparent)]"></div>
            <div className="relative z-10 flex flex-col gap-4">
                  <div>
                <p className="text-xs uppercase tracking-[0.35em] text-brand-gold/80 mb-1">Snapshot</p>
                <h2 className="text-xl font-semibold text-white">Akun Eksklusif</h2>
                  </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gold/15 border border-brand-gold/30 text-brand-gold">
                  <Icon icon={vipConfig.icon} className="w-5 h-5" />
                </div>
                  <div>
                  <p className="text-xs uppercase text-white/50">Level VIP</p>
                  <p className="text-sm font-semibold text-white">VIP {userData?.level || 0}</p>
              </div>
            </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-emerald/15 border border-brand-emerald/30 text-brand-emerald">
                  <Icon icon="mdi:shield-check" className="w-5 h-5" />
          </div>
                <div>
                  <p className="text-xs uppercase text-white/50">Keamanan</p>
                  <p className="text-sm text-white/80">Akun dilindungi enkripsi multi-layer & approval manual.</p>
        </div>
          </div>
              <button
                onClick={() => router.push('/vip')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-gold to-brand-gold-deep text-brand-black font-semibold py-3"
              >
                <Icon icon="mdi:rocket-launch" className="w-4 h-4" />
                Upgrade VIP
              </button>
              <button
                onClick={() => router.push('/deposit')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 text-white/80 hover:text-white py-3 transition-colors"
              >
                <Icon icon="mdi:wallet-plus" className="w-4 h-4" />
                Deposit Dana
              </button>
        </div>
          </div>
        </section>

        {/* Loading spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center my-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-3 border-brand-gold/20 border-t-brand-gold"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-brand-gold/30"></div>
            </div>
            <p className="text-white/70 text-center mt-4 text-sm">Memuat produk investasi...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Icon icon="mdi:alert-circle" className="text-red-400 w-6 h-6" />
              <h3 className="text-white font-semibold">Terjadi Kesalahan</h3>
            </div>
            <p className="text-red-300 mb-4 text-sm">{error}</p>
            <button 
              onClick={fetchProducts}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all duration-300 shadow-lg flex items-center gap-2 mx-auto text-sm"
            >
              <Icon icon="mdi:refresh" className="w-4 h-4" />
              Coba Lagi
            </button>
          </div>
        )}

        {/* Product Section */}
        {!loading && !error && (
          <>
            {Object.keys(products).length === 0 ? (
              <div className="bg-brand-surface border border-white/10 rounded-2xl p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Icon icon="mdi:information-outline" className="text-white/60 w-6 h-6" />
                  <h3 className="text-white font-semibold">Produk Tidak Tersedia</h3>
                </div>
                <div className="text-white/60 text-sm">Tidak ada produk investasi tersedia saat ini.</div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Icon icon="mdi:rocket-launch" className="text-brand-gold w-5 h-5" />
                  <h2 className="text-lg font-bold text-white">Produk Investasi</h2>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-6 pb-2">
                  {(() => {
                    const categories = Object.keys(products);
                    const preferred = ['Monitor', 'Insight', 'Autopilot'];
                    const orderedCategories = [
                      ...preferred.filter(k => categories.includes(k)),
                      ...categories.filter(k => !preferred.includes(k))
                    ];
                    return orderedCategories;
                  })().map((categoryName, idx) => (
                    <button
                      key={categoryName}
                      onClick={() => {
                        setSelectedCategory(categoryName);
                        setSelectedProduct(products[categoryName][0] || null);
                      }}
                      className={`flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border ${
                        selectedCategory === categoryName
                          ? 'bg-gradient-to-r from-brand-gold to-brand-gold-deep text-brand-black border-transparent shadow-brand-glow'
                          : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border-white/10'
                      }`}
                    >
                      <Icon icon={getCategoryIcon(categoryName)} className="w-5 h-5" />
                      <span className="whitespace-nowrap">{categoryName}</span>
                    </button>
                  ))}
                </div>

                {/* Product Cards in Selected Category */}
                {products[selectedCategory] && products[selectedCategory].length > 0 ? (
                  <>
                    {selectedProduct && (
                      <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-brand-surface-soft/95 backdrop-blur-xl p-6 sm:p-8 mb-8 shadow-[0_25px_60px_rgba(5,6,8,0.55)]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.18),transparent)]"></div>
                        <div className="relative z-10 flex flex-col gap-6">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                            <div className="flex flex-col gap-3">
                              <span className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-brand-gold">
                                {selectedCategory}
                              </span>
                              <h3 className="text-3xl font-black text-white">
                                {selectedProduct.name}
                              </h3>
                              <p className="text-sm text-white/60 max-w-2xl leading-relaxed">
                                {selectedProduct.description || 'Produk premium Money Rich dengan penyeimbangan risiko yang telah dikurasi oleh analis internal kami.'}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 min-w-[220px] text-sm">
                              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-[10px] uppercase tracking-wide text-white/45">Nominal</p>
                                <p className="text-lg font-semibold text-white mt-1">{formatCurrency(selectedProduct.amount)}</p>
                              </div>
                              <div className="rounded-2xl border border-brand-gold/30 bg-brand-gold/10 p-4">
                                <p className="text-[10px] uppercase tracking-wide text-brand-gold/80">Profit Harian</p>
                                <p className="text-lg font-semibold text-brand-gold mt-1">{formatCurrency(selectedProduct.daily_profit)}</p>
                              </div>
                              <div className="rounded-2xl border border-brand-emerald/30 bg-brand-emerald/10 p-4">
                                <p className="text-[10px] uppercase tracking-wide text-brand-emerald/80">Durasi</p>
                                <p className="text-lg font-semibold text-brand-emerald mt-1">{selectedProduct.duration} hari</p>
                              </div>
                              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-[10px] uppercase tracking-wide text-white/50">ROI Siklus</p>
                                <p className="text-lg font-semibold text-white mt-1">{formatPercentage(calculateROI(selectedProduct))}%</p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="rounded-2xl border border-brand-gold/35 bg-brand-gold/10 p-4">
                              <p className="text-[11px] uppercase tracking-wide text-brand-gold/70">Profit Siklus</p>
                              <p className="text-xl font-semibold text-white mt-1">{formatCurrency(calculateTotalReturn(selectedProduct))}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                              <p className="text-[11px] uppercase tracking-wide text-white/55">Proyeksi Pencairan</p>
                              <p className="text-xl font-semibold text-white mt-1">{formatCurrency(calculateTotalReturn(selectedProduct))}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                              <p className="text-[11px] uppercase tracking-wide text-white/55">Status Produk</p>
                              <p className={`text-sm font-semibold mt-1 ${selectedProduct.status === 'Active' ? 'text-brand-emerald' : 'text-red-400'}`}>
                                {selectedProduct.status === 'Active' ? 'Aktif' : 'Tidak Aktif'}
                              </p>
                              {selectedProduct.required_vip > 0 && (
                                <p className="text-[11px] text-white/50 mt-1 flex items-center gap-1">
                                  <Icon icon="mdi:crown" className="w-4 h-4 text-brand-gold" />
                                  VIP {selectedProduct.required_vip} diperlukan
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-2xl border border-white/10 bg-brand-surface/70 p-4">
                            <div className="space-y-1 text-sm">
                              <p className="text-white/65">
                                Saldo balance tersedia: <span className="text-white font-semibold">{formatCurrency(availableBalance)}</span>
                              </p>
                              <p className={`${canPurchaseSelectedProduct ? 'text-brand-emerald' : 'text-red-300'} text-[13px] font-semibold`}>
                                {canPurchaseSelectedProduct
                                  ? `Sisa saldo setelah beli: ${formatCurrency(balanceAfterSelected)}`
                                  : `Saldo kurang ${formatCurrency(Math.abs(balanceAfterSelected))}`}
                              </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <button
                                onClick={() => router.push('/deposit')}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-semibold text-white/70 hover:text-white transition-colors"
                              >
                                <Icon icon="mdi:wallet-plus" className="w-4 h-4" />
                                Deposit
                              </button>
                              <button
                                onClick={() => {
                                  if (!selectedProduct) return;
                                  if (!canPurchaseSelectedProduct) {
                                    router.push('/deposit');
                                    return;
                                  }
                                  if (selectedProduct.status !== 'Active' || (userData?.level || 0) < (selectedProduct.required_vip || 0)) {
                                    return;
                                  }
                                  setShowModal(true);
                                }}
                                disabled={!canPurchaseSelectedProduct || selectedProduct.status !== 'Active' || (userData?.level || 0) < (selectedProduct.required_vip || 0)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-gold to-brand-gold-deep text-brand-black font-semibold px-4 py-3 text-xs shadow-brand-glow transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                              >
                                <Icon icon="mdi:rocket-launch" className="w-4 h-4" />
                                Beli dengan Saldo
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
                      {products[selectedCategory].map((product) => {
                        const isSelected = selectedProduct?.id === product.id;
                        const productProfit = calculateTotalReturn(product);
                        const productRoi = calculateROI(product);
                        const projectedPayout = calculateTotalReturn(product);
                        const meetsVip = (userData?.level || 0) >= (product.required_vip || 0);
                        const canPurchase = availableBalance >= (product.amount || 0);
                        const remaining = availableBalance - (product.amount || 0);
                        const statusActive = product.status === 'Active';
                        const buttonLabel = !statusActive
                          ? 'Tidak Tersedia'
                          : !meetsVip
                            ? `Butuh VIP ${product.required_vip}`
                            : canPurchase
                              ? 'Beli dengan Saldo'
                              : 'Top Up Saldo';

                        return (
                      <div 
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                            className={`relative group cursor-pointer transition-all duration-300 ${isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'}`}
                          >
                            {isSelected && (
                              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-brand-gold to-brand-gold-deep blur-xl opacity-30"></div>
                            )}
                            <div
                              className={`relative h-full rounded-3xl border p-5 flex flex-col gap-4 transition-all duration-300 ${
                                isSelected
                                  ? 'border-brand-gold/45 bg-gradient-to-br from-brand-surface to-brand-charcoal shadow-brand-glow'
                                  : 'border-white/10 bg-gradient-to-br from-brand-surface to-brand-surface-soft hover:border-white/20'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex flex-col gap-2">
                                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/60">
                                    {product.category?.name || selectedCategory}
                                  </span>
                                  <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                                  <p className="text-xs text-white/55">Investasi {formatCurrency(product.amount)}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-gold to-brand-gold-deep flex items-center justify-center shadow-[0_0_25px_rgba(232,193,82,0.25)]">
                                <Icon icon={getProductIcon(product.name)} className="text-white w-5 h-5" />
                              </div>
                                  <span className={`px-3 py-1 rounded-lg text-[10px] font-semibold border ${statusActive ? 'border-brand-emerald/30 text-brand-emerald bg-brand-emerald/10' : 'border-red-400/40 text-red-300 bg-red-500/10'}`}>
                                    {statusActive ? 'Aktif' : 'Nonaktif'}
                                  </span>
                              </div>
                            </div>
                            
                              <div className="grid grid-cols-2 gap-3 text-xs text-white/70">
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                  <p className="text-[10px] uppercase text-white/45">Profit Harian</p>
                                  <p className="text-sm font-semibold text-brand-gold mt-1">{formatCurrency(product.daily_profit)}</p>
                              </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                  <p className="text-[10px] uppercase text-white/45">Durasi</p>
                                  <p className="text-sm font-semibold text-brand-emerald mt-1">{product.duration} hari</p>
                          </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                  <p className="text-[10px] uppercase text-white/45">Profit Siklus</p>
                                  <p className="text-sm font-semibold text-white mt-1">{formatCurrency(productProfit)}</p>
                            </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                  <p className="text-[10px] uppercase text-white/45">ROI Siklus</p>
                                  <p className="text-sm font-semibold text-white mt-1">{formatPercentage(productRoi)}%</p>
                            </div>
                          </div>
                          
                              <div className="rounded-2xl border border-brand-gold/30 bg-brand-gold/10 p-3 flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-white/70">Proyeksi Pencairan</span>
                                <span className="text-sm font-semibold text-white">{formatCurrency(projectedPayout)}</span>
                          </div>
                          
                          {product.purchase_limit > 0 && (
                                <div className="flex items-center gap-1.5 rounded-xl border border-brand-gold/40 bg-brand-gold/10 py-1.5 px-3 text-[10px] font-semibold text-brand-gold">
                                  <Icon icon="mdi:alert-circle" className="w-3.5 h-3.5" />
                                  <span>Limit {product.purchase_limit}x pembelian</span>
                            </div>
                          )}
                          
                              <div className="mt-auto flex flex-col gap-3">
                                <div className="flex items-center justify-between text-[11px] text-white/55">
                                  <span className="flex items-center gap-2">
                                    <Icon icon="mdi:wallet" className="w-4 h-4 text-white/45" />
                                    {canPurchase
                                      ? `Sisa saldo: ${formatCurrency(Math.max(remaining, 0))}`
                                      : `Saldo kurang ${formatCurrency(Math.abs(remaining))}`}
                                  </span>
                                  {selectedProduct?.id === product.id && (
                                    <span className="inline-flex items-center gap-1 text-brand-gold font-semibold">
                                      <Icon icon="mdi:check-decagram" className="w-4 h-4" />
                                      Dipilih
                                    </span>
                                  )}
                                </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProduct(product);
                                    if (!statusActive) return;
                                    if (!meetsVip) {
                                      router.push('/vip');
                                      return;
                                    }
                                    if (canPurchase) {
                              setShowModal(true);
                                    } else {
                                      router.push('/deposit');
                                    }
                                  }}
                                  className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all duration-300 shadow-brand-glow ${
                                    !statusActive
                                      ? 'bg-brand-surface text-white/30 cursor-not-allowed'
                                      : !meetsVip
                                        ? 'bg-brand-surface text-white/60 hover:text-white border border-white/10'
                                        : canPurchase
                                          ? 'bg-gradient-to-r from-brand-gold to-brand-gold-deep text-brand-black hover:-translate-y-0.5'
                                          : 'bg-brand-surface text-brand-gold border border-brand-gold/40 hover:-translate-y-0.5'
                                  }`}
                                >
                                  <Icon
                                    icon={
                                      !statusActive
                                        ? 'mdi:clock-alert'
                                        : !meetsVip
                                          ? 'mdi:crown'
                                          : canPurchase
                                            ? 'mdi:cart'
                                            : 'mdi:wallet-plus'
                                    }
                                    className="w-4 h-4"
                                  />
                                  {buttonLabel}
                          </button>
                        </div>
                      </div>
                  </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="bg-brand-surface border border-white/10 rounded-2xl p-6 text-center">
                    <Icon icon="mdi:package-variant" className="text-white/40 w-12 h-12 mx-auto mb-3" />
                    <p className="text-white/60 text-sm">Tidak ada produk di kategori {selectedCategory}</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
        
        {/* Copyright */}
        <Copyright />
      </div>

      {/* Bottom Navigation - Floating */}
          <BottomNavbar />

      {/* Popup Modal */}
      {showPopup && applicationData?.popup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="relative max-w-sm w-full animate-slideUp">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-gold to-brand-emerald rounded-3xl blur-xl opacity-30"></div>
            
            <div className="relative bg-gradient-to-br from-brand-surface via-brand-charcoal to-brand-surface rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-brand-gold/18 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-brand-emerald/16 to-transparent rounded-full blur-3xl"></div>
              
              <button
                onClick={handleClosePopup}
                className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full w-9 h-9 flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 border border-white/20"
              >
                <Icon icon="mdi:close" className="w-5 h-5" />
              </button>
              
              <div className="relative p-6">
                {/* Popup Image */}
                {popupImageUrl && (
                  <div className="relative w-full aspect-video mb-6 rounded-2xl overflow-hidden border border-white/10">
                    <Image
                      src={popupImageUrl}
                      alt="Popup"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                
                {/* Popup Title/Message */}
                {applicationData?.popup_title && (
                  <div className="text-center mb-6">
                    <p className="text-white text-base leading-relaxed">
                      {applicationData.popup_title}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleHidePopup10Minutes}
                    className="w-full bg-white/5 hover:bg-white/10 text-white/80 font-semibold py-3 rounded-xl transition-all duration-300 border border-white/10"
                  >
                    Jangan tampilkan selama 10 menit
                  </button>
                  
                  <button
                    onClick={handleClosePopup}
                    className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-deep text-brand-black font-bold py-3.5 rounded-xl transition-all duration-300 shadow-brand-glow hover:-translate-y-0.5 active:scale-[0.99]"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Investment Modal & Toast */}
      {showModal && selectedProduct && (
        <InvestmentModal
          open={showModal}
          onClose={() => setShowModal(false)}
          product={selectedProduct}
          user={userData}
          onSuccess={() => {
            setShowModal(false);
            refreshUserData();
            fetchProducts();
            setToast({ open: true, message: 'Investasi berhasil dibeli menggunakan saldo balance.', type: 'success' });
          }}
        />
      )}
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, open: false })}
      />
      
      {/* eslint-disable react/no-unknown-property */}
      <style jsx global>{`
        .stars {
          width: 1px;
          height: 1px;
          border-radius: 50%;
          background: transparent;
          box-shadow: 718px 1689px #FFF , 1405px 2127px #FFF , 1270px 1148px #FFF , 620px 641px #FFF , 1538px 708px #FFF , 2169px 1632px #FFF , 523px 1494px #FFF , 1081px 2018px #FFF , 1372px 585px #FFF , 974px 576px #FFF , 448px 1231px #FFF , 78px 2055px #FFF , 1180px 1274px #FFF , 1752px 2099px #FFF , 1392px 488px #FFF , 1836px 2303px #FFF , 1309px 816px #FFF , 922px 962px #FFF , 1165px 2485px #FFF , 2054px 176px #FFF , 1425px 747px #FFF , 2253px 2056px #FFF , 1602px 114px #FFF , 433px 1332px #FFF , 65px 1726px #FFF , 257px 334px #FFF , 1512px 1855px #FFF , 775px 2422px #FFF , 2512px 2123px #FFF , 76px 2235px #FFF , 1979px 501px #FFF , 352px 1222px #FFF , 554px 1215px #FFF , 1200px 2163px #FFF , 2078px 1983px #FFF , 2461px 557px #FFF , 1960px 2055px #FFF , 1966px 316px #FFF , 1123px 1402px #FFF , 1461px 2288px #FFF , 1625px 2076px #FFF , 822px 609px #FFF , 531px 1358px #FFF , 900px 1938px #FFF , 1867px 1362px #FFF , 1049px 372px #FFF , 319px 980px #FFF , 2321px 2421px #FFF , 1701px 1425px #FFF , 1827px 1324px #FFF , 126px 1121px #FFF , 527px 1735px #FFF;
          animation: animStar 100s linear infinite;
        }
        .stars:after {
          content: " ";
          top: -600px;
          width: 1px;
          height: 1px;
          border-radius: 50%;
          position: absolute;
          background: transparent;
          box-shadow: 1229px 1419px #FFF , 672px 2257px #FFF , 821px 854px #FFF , 731px 1239px #FFF , 1244px 58px #FFF , 687px 2428px #FFF , 173px 1549px #FFF , 1973px 940px #FFF , 2334px 1057px #FFF , 792px 882px #FFF , 1499px 1912px #FFF , 1892px 9px #FFF , 172px 1753px #FFF , 22px 1577px #FFF , 934px 2059px #FFF , 1398px 2309px #FFF , 100px 77px #FFF , 1545px 22px #FFF , 595px 1917px #FFF , 941px 1452px #FFF , 1226px 1022px #FFF , 1254px 990px #FFF , 2507px 352px #FFF , 111px 887px #FFF , 1666px 168px #FFF , 966px 986px #FFF , 121px 2559px #FFF , 1424px 792px #FFF , 1973px 2544px #FFF , 577px 503px #FFF , 1167px 1107px #FFF , 2397px 1653px #FFF , 1054px 810px #FFF , 663px 805px #FFF , 1084px 317px #FFF , 2214px 759px #FFF , 190px 975px #FFF , 2218px 2104px #FFF , 2013px 1227px #FFF , 383px 1778px #FFF , 1287px 1660px #FFF , 2131px 994px #FFF , 1073px 748px #FFF , 1745px 2372px #FFF , 1424px 252px #FFF , 1274px 2457px #FFF , 1976px 2422px #FFF , 1644px 1665px #FFF , 2372px 1772px #FFF , 1593px 580px #FFF , 894px 2361px #FFF , 31px 1802px #FFF , 1552px 1134px #FFF , 1477px 1847px #FFF , 1647px 2464px #FFF , 599px 510px #FFF , 2016px 226px #FFF , 1402px 243px #FFF , 748px 953px #FFF , 387px 1212px #FFF , 453px 1525px #FFF , 1032px 93px #FFF , 1420px 1399px #FFF , 146px 948px #FFF , 2256px 1631px #FFF , 1405px 394px #FFF , 201px 2149px #FFF , 1077px 1765px #FFF , 34px 2213px #FFF , 2388px 246px #FFF , 392px 667px #FFF , 1595px 181px #FFF , 323px 426px #FFF , 2405px 2410px #FFF , 2484px 280px #FFF;
        }

        .stars1 {
          z-index: 0;
          width: 2px;
          height: 2px;
          border-radius: 50%;
          background: transparent;
          box-shadow: 452px 2369px #FFF , 2030px 2013px #FFF , 113px 1775px #FFF , 426px 2228px #FFF , 735px 2395px #FFF , 483px 147px #FFF , 1123px 1666px #FFF , 1944px 113px #FFF , 1096px 372px #FFF , 2005px 118px #FFF , 1948px 2320px #FFF , 2095px 823px #FFF , 742px 1559px #FFF , 1637px 383px #FFF , 877px 992px #FFF , 141px 1522px #FFF , 483px 941px #FFF , 2028px 761px #FFF , 1164px 2482px #FFF , 692px 1202px #FFF , 1008px 62px #FFF , 1820px 2535px #FFF , 1459px 2067px #FFF , 519px 1297px #FFF , 1620px 252px #FFF , 1014px 1855px #FFF , 679px 135px #FFF , 1927px 2544px #FFF , 836px 1433px #FFF , 286px 21px #FFF , 1131px 769px #FFF , 1717px 1031px #FFF , 2121px 517px #FFF , 1865px 1257px #FFF , 1640px 1712px #FFF , 158px 162px #FFF , 2491px 1514px #FFF , 784px 1446px #FFF , 1547px 968px #FFF , 1966px 1461px #FFF , 923px 1883px #FFF , 601px 81px #FFF , 1486px 598px #FFF , 1947px 1462px #FFF , 2161px 1181px #FFF , 773px 675px #FFF , 2023px 455px #FFF , 1199px 1199px #FFF , 94px 1814px #FFF , 1055px 852px #FFF , 583px 631px #FFF , 150px 1931px #FFF , 1472px 597px #FFF , 611px 1338px #FFF , 54px 859px #FFF , 1266px 1019px #FFF , 1028px 256px #FFF , 1442px 964px #FFF , 436px 1325px #FFF , 2446px 1141px #FFF , 723px 70px #FFF , 825px 964px #FFF , 63px 271px #FFF , 647px 849px #FFF , 309px 673px #FFF , 1965px 2090px #FFF , 1672px 9px #FFF , 450px 2504px #FFF , 1675px 2135px #FFF , 2075px 921px #FFF , 1607px 2348px #FFF , 2243px 1494px #FFF;
          animation: animStar 125s linear infinite;
        }
        .stars1:after {
          content: " ";
          top: -600px;
          width: 2px;
          height: 2px;
          border-radius: 50%;
          position: absolute;
          background: transparent;
          box-shadow: 435px 1410px #FFF , 1717px 2554px #FFF , 885px 1458px #FFF , 1614px 909px #FFF , 26px 2169px #FFF , 1627px 1343px #FFF , 511px 518px #FFF , 1388px 722px #FFF , 748px 1982px #FFF , 837px 2188px #FFF , 891px 1897px #FFF , 917px 2547px #FFF , 866px 2021px #FFF , 1748px 2464px #FFF , 409px 2476px #FFF , 1321px 1824px #FFF , 1946px 1620px #FFF , 84px 1996px #FFF , 773px 475px #FFF , 2327px 1356px #FFF , 181px 38px #FFF , 2122px 1291px #FFF , 2254px 375px #FFF , 654px 432px #FFF , 2022px 710px #FFF , 866px 1651px #FFF , 948px 2128px #FFF , 1107px 1282px #FFF , 1605px 1555px #FFF , 847px 2056px #FFF , 1678px 385px #FFF , 1723px 2282px #FFF , 516px 166px #FFF , 1764px 93px #FFF , 1947px 2302px #FFF, 1357px 1486px #FFF , 1237px 2532px #FFF , 2338px 2002px #FFF , 251px 1525px #FFF , 876px 1121px #FFF , 189px 759px #FFF , 1936px 1574px #FFF , 2510px 1440px #FFF , 204px 836px #FFF , 2044px 437px #FFF , 471px 45px #FFF , 394px 548px #FFF , 1730px 641px #FFF , 1526px 1701px #FFF , 1559px 1106px #FFF , 1396px 1826px #FFF , 1106px 644px #FFF , 160px 2149px #FFF , 1261px 1804px #FFF , 363px 714px #FFF , 2002px 2277px #FFF , 696px 1741px #FFF , 2291px 499px #FFF , 2089px 2229px #FFF;
        }

        .stars2 {
          z-index: 0;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: transparent;
          box-shadow: 380px 1043px #FFF , 10px 1086px #FFF , 660px 1062px #FFF , 1371px 842px #FFF , 1290px 2153px #FFF , 2258px 231px #FFF , 2130px 2217px #FFF , 1084px 758px #FFF , 1464px 1903px #FFF , 621px 2482px #FFF , 2470px 754px #FFF , 1282px 1797px #FFF , 510px 1678px #FFF , 836px 799px #FFF , 2001px 134px #FFF , 2314px 1869px #FFF , 1031px 643px #FFF , 949px 292px #FFF , 16px 2265px #FFF , 465px 1239px #FFF , 2117px 1952px #FFF , 1683px 605px #FFF , 1818px 1945px #FFF , 890px 1749px #FFF , 324px 110px #FFF , 1048px 1442px #FFF , 2399px 1553px #FFF , 157px 551px #FFF , 666px 314px #FFF , 897px 933px #FFF , 2397px 438px #FFF , 1280px 988px #FFF , 1510px 2373px #FFF , 2453px 1645px #FFF , 831px 994px #FFF , 2125px 338px #FFF , 1571px 2128px #FFF , 1792px 53px #FFF , 820px 2480px #FFF , 529px 1544px #FFF , 1941px 928px #FFF , 1632px 795px #FFF , 152px 993px #FFF , 1040px 260px #FFF , 1131px 589px #FFF , 2395px 1336px #FFF , 1537px 1906px #FFF , 1989px 1910px #FFF , 1489px 1098px #FFF , 996px 1585px #FFF , 476px 69px #FFF , 123px 466px #FFF , 374px 414px #FFF , 741px 1097px #FFF , 1415px 1296px #FFF , 945px 1132px #FFF , 909px 2080px #FFF , 2219px 8px #FFF , 2198px 1039px #FFF , 1794px 1513px #FFF , 1484px 1972px #FFF , 1557px 2099px #FFF , 1385px 912px #FFF , 1612px 1474px #FFF , 169px 1963px #FFF;
          animation: animStar 175s linear infinite;
        }
        .stars2:after {
          content: " ";
          top: -600px;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          position: absolute;
          background: transparent;
          box-shadow: 148px 2112px #FFF , 2328px 2246px #FFF , 793px 1150px #FFF , 2476px 867px #FFF , 195px 2295px #FFF , 721px 1158px #FFF , 344px 1096px #FFF , 1434px 1247px #FFF , 2251px 1334px #FFF , 1696px 1404px #FFF , 1928px 1929px #FFF , 473px 1718px #FFF , 1176px 1364px #FFF , 133px 1990px #FFF , 1396px 1179px #FFF , 1355px 1046px #FFF , 676px 869px #FFF , 2255px 1676px #FFF , 2393px 2105px #FFF , 1032px 1390px #FFF , 773px 2159px #FFF , 1235px 945px #FFF , 1161px 209px #FFF , 1878px 175px #FFF , 287px 1787px #FFF , 509px 935px #FFF , 473px 442px #FFF , 1864px 177px #FFF , 768px 2004px #FFF , 513px 744px #FFF , 2060px 2271px #FFF , 2187px 2135px #FFF , 1818px 505px #FFF , 809px 1998px #FFF , 323px 2553px #FFF , 1420px 167px #FFF , 2418px 2233px #FFF , 1955px 2053px #FFF , 1822px 145px #FFF , 931px 629px #FFF , 94px 2440px #FFF , 1816px 718px #FFF , 386px 668px #FFF , 2040px 397px #FFF , 40px 866px #FFF , 1397px 2398px #FFF , 2399px 297px #FFF , 1611px 259px #FFF , 1393px 1139px #FFF;
        }

        .shooting-stars {
          z-index: 0;
          width: 5px;
          height: 85px;
          border-top-left-radius: 50%;
          border-top-right-radius: 50%;
          position: absolute;
          bottom: 0;
          right: 0;
          background: linear-gradient(to top, rgba(255, 255, 255, 0), white);
          animation: animShootingStar 10s linear infinite;
        }

        @keyframes animStar {
          from { transform: translateY(0px); }
          to { transform: translateY(-2560px) translateX(-2560px); }
        }
        
        @keyframes animShootingStar {
          from {
            transform: translateY(0px) translateX(0px) rotate(-45deg);
            opacity: 1;
            height: 5px;
          }
          to {
            transform: translateY(-2560px) translateX(-2560px) rotate(-45deg);
            opacity: 1;
            height: 800px;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
+      {/* eslint-enable react/no-unknown-property */}
    </div>
  );
}
