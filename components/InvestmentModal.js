// components/InvestmentModal.js
import React, { useState, useEffect } from 'react';
import { createInvestment } from '../utils/api';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';

export default function InvestmentModal({ open, onClose, product, user, onSuccess }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
    }
  }, [open, product?.id]);

  if (!open || !product) return null;

  // Fixed amount from product (no user input)
  const amount = product.amount || 0;
  const dailyProfit = product.daily_profit || 0;
  const duration = product.duration || 0;
  const totalReturn = dailyProfit * duration;
  const roiPercentage = amount ? (totalReturn / amount) * 100 : 0;

  const balance = user?.balance ?? 0;
  const remainingBalance = balance - amount;
  const hasSufficientBalance = remainingBalance >= 0;
  
  // Category info
  const category = product.category || {};
  const categoryName = category.name || 'Unknown';

  const formatCurrency = (amt) => new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    maximumFractionDigits: 0 
  }).format(amt);
  const formatPercentage = (value) => new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 1,
    minimumFractionDigits: value > 0 && value < 1 ? 1 : 0,
  }).format(value);

  const handleConfirm = async () => {
    setError('');
    if (!hasSufficientBalance) {
      setError('Saldo balance tidak mencukupi. Silakan lakukan deposit terlebih dahulu.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        product_id: product.id,
        payment_method: 'BALANCE',
        use_balance: true,
      };
      const data = await createInvestment(payload);
      setLoading(false);
      if (onSuccess) {
        onSuccess(data);
      }
    } catch (err) {
      setError(err.message || 'Gagal melakukan investasi');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
      <div className="relative max-w-md w-full my-4 animate-slideUp">
        {/* Outer Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#E8C152] via-[#B9891F] to-[#4CD6C4] rounded-3xl blur-xl opacity-40"></div>
        
        {/* Main Card */}
        <div className="relative bg-gradient-to-br from-[#11131A] via-[#0F0F0F] to-[#11131A] rounded-3xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <Icon icon="mdi:close" className="w-5 h-5 text-white" />
          </button>

          {/* Header with Gradient */}
          <div className="relative p-4 pb-4 bg-gradient-to-br from-[#E8C152]/10 to-[#4CD6C4]/10 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E8C152] to-[#B9891F] flex items-center justify-center shadow-lg">
                <Icon icon="mdi:trending-up" className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{product.name}</h2>
                <p className="text-xs text-white/60">Kategori: {categoryName}</p>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            {/* Investment Summary */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#E8C152]/30 to-[#4CD6C4]/30 rounded-2xl blur opacity-50"></div>
              <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-3 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Icon icon="mdi:chart-line-variant" className="w-4 h-4 text-[#E8C152]" />
                  <h3 className="text-white font-bold text-sm">Detail Investasi</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-[9px] uppercase tracking-wide text-white/55 flex items-center gap-1">
                      <Icon icon="mdi:cash" className="w-3.5 h-3.5 text-white/50" />
                        Nominal
                      </p>
                      <p className="text-sm font-semibold text-white mt-1">{formatCurrency(amount)}</p>
                  </div>
                    <div className="p-2 bg-gradient-to-br from-[#E8C152]/12 to-[#B9891F]/12 rounded-xl border border-[#E8C152]/20">
                      <p className="text-[9px] uppercase tracking-wide text-[#E8C152]/80 flex items-center gap-1">
                        <Icon icon="mdi:currency-usd" className="w-3 h-3 text-[#E8C152]" />
                        Profit Harian
                      </p>
                      <p className="text-sm font-semibold text-[#E8C152] mt-1">{formatCurrency(dailyProfit)}</p>
                    </div>
                    <div className="p-2 bg-gradient-to-br from-[#4CD6C4]/12 to-[#E8C152]/12 rounded-xl border border-[#4CD6C4]/20 sm:col-span-1 col-span-2">
                      <p className="text-[9px] uppercase tracking-wide text-[#4CD6C4]/80 flex items-center gap-1">
                        <Icon icon="mdi:calendar-clock" className="w-3 h-3 text-[#4CD6C4]" />
                        Durasi
                      </p>
                      <p className="text-sm font-semibold text-[#4CD6C4] mt-1">{duration} hari</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-[9px] uppercase tracking-wide text-white/50 flex items-center gap-1">
                        <Icon icon="mdi:trophy" className="w-3.5 h-3.5 text-[#E8C152]" />
                        Profit Per Siklus
                      </p>
                      <p className="text-sm font-semibold text-white mt-1">{formatCurrency(totalReturn)}</p>
                      </div>
                    <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-[9px] uppercase tracking-wide text-white/50 flex items-center gap-1">
                        <Icon icon="mdi:percent" className="w-3.5 h-3.5 text-[#4CD6C4]" />
                        ROI Per Siklus
                      </p>
                      <p className="text-sm font-semibold text-[#4CD6C4] mt-1">{formatPercentage(roiPercentage)}%</p>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-white font-semibold text-sm flex items-center gap-1.5">
                        <Icon icon="mdi:cash-check" className="w-4 h-4 text-[#E8C152]" />
                        Proyeksi Pencairan
                      </span>
                      <span className="text-base font-bold text-white bg-gradient-to-r from-[#E8C152] to-[#B9891F] bg-clip-text text-transparent">
                        {formatCurrency(totalReturn)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Balance Summary */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#E8C152]/20 via-transparent to-[#4CD6C4]/20 rounded-2xl blur opacity-60"></div>
              <div className="relative bg-gradient-to-br from-white/5 to-white/[0.01] rounded-2xl p-4 border border-white/10">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
            <div>
                      <p className="text-[11px] uppercase tracking-[0.32em] text-white/55">Saldo Balance</p>
                      <p className="text-xl font-semibold text-white mt-1">{formatCurrency(balance)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] uppercase tracking-wide text-white/45">Sisa Setelah Beli</p>
                      <p className={`text-sm font-semibold ${hasSufficientBalance ? 'text-[#4CD6C4]' : 'text-red-300'}`}>
                        {formatCurrency(hasSufficientBalance ? remainingBalance : 0)}
                      </p>
                      {!hasSufficientBalance && (
                        <p className="text-[11px] text-red-200 mt-1">Kurang {formatCurrency(Math.abs(remainingBalance))}</p>
                      )}
                    </div>
                  </div>

                  {!hasSufficientBalance && (
                    <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 flex flex-col gap-3">
                      <div className="flex items-start gap-2">
                        <Icon icon="mdi:alert" className="w-4 h-4 text-red-300 mt-0.5" />
                        <div className="text-xs text-red-200 leading-relaxed">
                          Saldo balance Anda belum mencukupi untuk membeli produk ini. Lakukan deposit terlebih dahulu agar transaksi dapat diproses.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          router.push('/deposit');
                          onClose?.();
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E8C152] to-[#B9891F] text-brand-black font-semibold text-xs px-4 py-2 shadow-brand-glow hover:-translate-y-0.5 transition-transform duration-300"
                      >
                        <Icon icon="mdi:wallet-plus" className="w-4 h-4" />
                        Deposit Sekarang
                      </button>
                </div>
              )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="relative animate-shake">
                <div className="absolute -inset-0.5 bg-red-500/50 rounded-2xl blur"></div>
                <div className="relative bg-red-500/10 border border-red-400/30 rounded-2xl p-3 flex items-start gap-2">
                  <Icon icon="mdi:alert-circle" className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-red-300 text-xs leading-relaxed">{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Fixed Action Buttons at Bottom */}
          <div className="p-4 pt-3 border-t border-white/10 bg-gradient-to-t from-black/20 to-transparent flex-shrink-0">
            <div className="flex gap-2">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-white/5 hover:bg-white/10 disabled:bg-white/5 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all duration-300 border border-white/10 disabled:cursor-not-allowed disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                Batal
              </button>
              
              <button
                onClick={handleConfirm}
                disabled={loading || !hasSufficientBalance}
                className="flex-1 relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#E8C152] to-[#B9891F] rounded-xl transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#E8C152]/50"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#deb956] to-[#E8C152] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all duration-300 flex items-center justify-center gap-2 group-disabled:opacity-60 group-disabled:cursor-not-allowed">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <Icon icon="mdi:rocket-launch" className="w-4 h-4" />
                      Gunakan Saldo Balance
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* eslint-disable react/no-unknown-property */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            transform: translateY(30px) scale(0.95); 
            opacity: 0; 
          }
          to { 
            transform: translateY(0) scale(1); 
            opacity: 1; 
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        
        .animate-fadeIn { 
          animation: fadeIn 0.3s ease-out; 
        }
        
        .animate-slideUp { 
          animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); 
        }
        
        .animate-shake { 
          animation: shake 0.5s ease-in-out; 
        }

        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
      {/* eslint-enable react/no-unknown-property */}
    </div>
  );
}
