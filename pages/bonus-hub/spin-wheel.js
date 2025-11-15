// pages/spin-wheel.js
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getSpinPrizeList, spinV2 } from '../../utils/api';
import { Icon } from '@iconify/react';
import BottomNavbar from '../../components/BottomNavbar';
import Copyright from '../../components/copyright';

export default function SpinWheel() {
  const router = useRouter();
  const [prizes, setPrizes] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({
    balance: 0,
    income: 0,
    name: '',
    number: '',
    reff_code: '',
    spin_ticket: 0,
    total_invest: 0,
    total_withdraw: 0
  });
  const wheelRef = useRef(null);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [pointerActive, setPointerActive] = useState(false);
  const [applicationData, setApplicationData] = useState(null);

  // Define colors for the wheel segments - Money Rich brand colors
  const prizeColors = [
    '#E8C152', '#D4A853', '#C89554', '#B88255',
    '#E8C152', '#D4A853', '#C89554', '#B88255'
  ].sort(() => Math.random() - 0.5);

  // Fetch prizes and user data
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    const accessExpire = sessionStorage.getItem('access_expire');
    if (!token || !accessExpire) {
      router.push('/login');
      return;
    }
    const fetchSpinData = async () => {
      try {
        setLoading(true);
        setError(null);
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserData(user);
        }
        const res = await getSpinPrizeList();
        if (res && res.success && Array.isArray(res.data)) {
          const filtered = res.data.filter((prize) => prize.status === 'Active');
          const totalChance = filtered.reduce((sum, prize) => sum + (typeof prize.chance === 'number' ? prize.chance : 0), 0);
          const processedPrizes = filtered.map((prize, index) => ({
            ...prize,
            color: prizeColors[index % prizeColors.length],
            textColor: '#050608',
            name: prize.amount >= 1000 ? `Rp ${formatCurrency(prize.amount)}` : `${prize.amount} Poin`,
            chancePercent: totalChance > 0 ? ((prize.chance / totalChance) * 100) : 0
          }));
          setPrizes(processedPrizes);
        } else {
          setError('Gagal memuat hadiah spin');
        }
      } catch (err) {
        setError('Network error. Please try again.');
        console.error('Error fetching spin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpinData();
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
  }, []);

  const calculateRotation = (prizeIndex) => {
    if (!prizes || prizes.length === 0) return 0;
    const segmentAngle = 360 / prizes.length;
    const targetCenter = (prizeIndex + 0.5) * segmentAngle;
    const desiredFinal = (270 - targetCenter + 360) % 360;
    const fullSpins = (5 + Math.floor(Math.random() * 2)) * 360;
    const finalRotation = fullSpins + desiredFinal;
    return finalRotation;
  };

  const handleSpin = async () => {
    if (userData.spin_ticket < 1) {
      setError('Tidak memiliki tiket spin yang cukup');
      return;
    }

    if (prizes.length === 0) {
      setError('Data hadiah belum dimuat');
      return;
    }

    setIsSpinning(true);
    setError(null);
    setResult(null);

    try {
      const previousRotation = currentRotation;
      const response = await spinV2();

      if (!response || !response.success) {
        setError(response?.message || 'Spin gagal');
        if (wheelRef.current) {
          wheelRef.current.style.transition = 'transform 600ms ease-out';
          wheelRef.current.style.transform = `rotate(${previousRotation}deg)`;
        }
        setCurrentRotation(previousRotation);
        setIsSpinning(false);
        return;
      }

      const serverPrize = response.data && response.data.spin_result ? response.data.spin_result : null;
      let serverIndex = -1;
      if (serverPrize) {
        serverIndex = prizes.findIndex(p => (p.code && serverPrize.code && p.code === serverPrize.code) || (Number(p.amount) === Number(serverPrize.amount)));
      }
      if (serverIndex === -1) serverIndex = 0;

      const finalRotation = calculateRotation(serverIndex);
      const baseFull = Math.floor(currentRotation / 360) * 360;
      let targetRotation = baseFull + finalRotation;
      if (targetRotation <= currentRotation) targetRotation += 360;
      if (wheelRef.current) {
        wheelRef.current.style.transition = 'transform 4s cubic-bezier(0.2,0.7,0.3,1)';
        wheelRef.current.style.transform = `rotate(${targetRotation}deg)`;
      }
      await new Promise(resolve => setTimeout(resolve, 4200));
      setCurrentRotation(targetRotation);

      setPointerActive(true);
      setResult({
        prize: {
          amount: response.data.spin_result.amount,
          name: response.data.spin_result.amount >= 1000 ? `Rp ${formatCurrency(response.data.spin_result.amount)}` : `${response.data.spin_result.amount} Poin`
        },
        message: response.message,
        previousBalance: response.data.balance_info.previous_balance,
        currentBalance: response.data.balance_info.current_balance,
        prizeAmount: response.data.balance_info.prize_amount
      });
      setTimeout(() => setPointerActive(false), 1800);

      const updatedUserData = {
        ...userData,
        balance: response.data.balance_info.current_balance,
        spin_ticket: userData.spin_ticket - 1
      };
      setUserData(updatedUserData);
      localStorage.setItem('user', JSON.stringify(updatedUserData));

    } catch (err) {
      setError(err.message || 'Network error. Please try again.');
      if (wheelRef.current) {
        wheelRef.current.style.transition = 'none';
        wheelRef.current.style.transform = `rotate(${currentRotation}deg)`;
      }
    } finally {
      setIsSpinning(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  const createWheelSegments = () => {
  if (prizes.length === 0) return null;

  const segmentAngle = 360 / prizes.length;
  const radius = 120;
  const centerX = 120;
  const centerY = 120;

  return prizes.map((prize, index) => {
    const startAngleRad = (index * segmentAngle) * (Math.PI / 180);
    const endAngleRad = ((index + 1) * segmentAngle) * (Math.PI / 180);

    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);

    const largeArcFlag = segmentAngle > 180 ? 1 : 0;
    const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    
    const textAngleRad = (startAngleRad + endAngleRad) / 2;
    const textRadius = radius * 0.7;
    const textX = centerX + textRadius * Math.cos(textAngleRad);
    const textY = centerY + textRadius * Math.sin(textAngleRad);

    const textAngleDeg = (textAngleRad * (180 / Math.PI)) + 90;
    return (
      <g key={index}>
        <path d={pathData} fill={prize.color} stroke="#fff" strokeWidth="2" />
        <text 
          x={textX}
          y={textY}
          fill={prize.textColor}
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="central"
          transform={`rotate(${textAngleDeg}, ${textX}, ${textY})`}
        >
          {prize.name}
        </text>
      </g>
    );
  });
};

  return (
    <div className="min-h-screen bg-brand-black text-white relative overflow-hidden pb-32">
      <Head>
        <title>{applicationData?.name || 'Money Rich'} | Spin Wheel</title>
        <meta name="description" content={`${applicationData?.name || 'Money Rich'} Spin Wheel`} />
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
            <Icon icon="mdi:dharmachakra" className="w-4 h-4" />
            Spin Wheel
              </div>
              <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">Roda Keberuntungan</h1>
            <p className="text-sm text-white/60 max-w-2xl mt-2">
              Putar roda dan dapatkan hadiah spesial! Gunakan tiket spin Anda untuk kesempatan memenangkan bonus.
            </p>
              </div>
            </div>

        {/* User Info Cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="relative overflow-hidden rounded-3xl border border-brand-gold/25 bg-gradient-to-br from-brand-gold/12 via-brand-surface to-brand-surface-soft p-5 shadow-[0_18px_45px_rgba(5,6,8,0.45)]">
            <div className="absolute -top-16 -right-12 w-40 h-40 rounded-full bg-brand-gold/35 blur-3xl opacity-70"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center">
                  <Icon icon="mdi:wallet" className="text-brand-gold w-5 h-5" />
                </div>
                <p className="text-xs uppercase tracking-[0.35em] text-brand-gold/80 font-semibold">Saldo</p>
              </div>
              <p className="text-3xl font-black text-white">Rp {formatCurrency(userData.income)}</p>
              <p className="text-[11px] text-white/55 mt-2">Saldo Anda</p>
          </div>
        </div>

          <div className="relative overflow-hidden rounded-3xl border border-brand-emerald/25 bg-gradient-to-br from-brand-surface via-brand-charcoal to-brand-surface-soft p-5 shadow-[0_18px_45px_rgba(5,6,8,0.45)]">
            <div className="absolute -bottom-16 -left-20 w-44 h-44 rounded-full bg-brand-emerald/30 blur-3xl opacity-60"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-emerald/20 border border-brand-emerald/30 flex items-center justify-center">
                  <Icon icon="mdi:ticket" className="text-brand-emerald w-5 h-5" />
              </div>
                <p className="text-xs uppercase tracking-[0.35em] text-brand-emerald/80 font-semibold">Kredit Spin</p>
              </div>
              <p className="text-3xl font-black text-brand-emerald">{userData.spin_ticket}</p>
              <p className="text-[11px] text-white/55 mt-2">Kredit Spin Tersedia</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="relative animate-shake mb-8">
            <div className="absolute -inset-0.5 bg-red-500/50 rounded-2xl blur"></div>
            <div className="relative bg-red-500/10 border border-red-400/30 rounded-2xl p-4 flex items-start gap-3">
              <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-red-300 text-sm leading-relaxed">{error}</span>
            </div>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="relative animate-fadeIn mb-8">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-emerald to-brand-emerald/60 rounded-3xl blur opacity-30"></div>
            <div className="relative bg-gradient-to-br from-brand-emerald/10 to-brand-emerald/5 rounded-3xl p-6 border border-brand-emerald/20 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Icon icon="mdi:trophy" className="w-6 h-6 text-brand-gold" />
                <h3 className="text-lg font-black text-white">Selamat! Anda Memenangkan</h3>
              </div>
              <div className="text-3xl font-black text-brand-gold mb-4">
              {result.prize.name}
            </div>
            </div>
          </div>
        )}

        {/* Spin Wheel Container */}
        <div className="relative mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-gold/30 to-brand-gold-deep/30 rounded-full blur-2xl opacity-30"></div>
          <div className="relative flex justify-center p-4">
            <div className="relative w-72 h-72">
              {loading ? (
                <div className="absolute inset-0 rounded-full bg-brand-surface border border-white/10 grid place-items-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-3 border-brand-gold/20 border-t-brand-gold"></div>
                    <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-brand-gold/40"></div>
                  </div>
                </div>
              ) : (
                <svg 
                  ref={wheelRef}
                  className="absolute inset-0 w-full h-full drop-shadow-2xl"
                  viewBox="0 0 240 240"
                  style={{ 
                    transform: `rotate(${currentRotation}deg)`,
                    transition: 'transform 4s cubic-bezier(0.2, 0.7, 0.3, 1)'
                  }}
                >
                  {createWheelSegments()}
                </svg>
              )}
              
              {/* Center circle */}
              <div className="absolute top-1/2 left-1/2 w-10 h-10 bg-gradient-to-br from-brand-surface to-brand-charcoal rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10 shadow-lg border-4 border-brand-gold"></div>
              
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-20 flex flex-col items-center pointer-events-none">
                <div className={`w-0 h-0 border-l-[16px] border-r-[16px] border-t-[24px] border-l-transparent border-r-transparent drop-shadow-lg transition-all duration-300 ${pointerActive ? 'border-t-brand-gold scale-110' : 'border-t-brand-gold'}`}></div>
              </div>
            </div>
          </div>

          {/* Spin Button */}
          <button
            onClick={handleSpin}
            disabled={isSpinning || userData.spin_ticket < 1}
            className={`w-full bg-gradient-to-r from-brand-gold to-brand-gold-deep text-brand-black font-black py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-brand-gold/30 mb-4 ${
              isSpinning || userData.spin_ticket < 1 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-brand-gold/50 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isSpinning ? (
              <>
                <div className="w-5 h-5 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin"></div>
                Memutar...
              </>
            ) : (
              <>
                <Icon icon="mdi:rocket" className="w-6 h-6" />
                Putar Sekarang
              </>
            )}
          </button>
        </div>
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
          
          .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
          .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}
