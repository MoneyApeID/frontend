// pages/forum.js
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { getForumTestimonials } from '../utils/api';
import BottomNavbar from '../components/BottomNavbar';
import Image from 'next/image';
import Copyright from '../components/copyright';


export default function Testimoni() {
    const router = useRouter();
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalImage, setModalImage] = useState(null); // url string
    const [applicationData, setApplicationData] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(12);
    const [showLimitDropdown, setShowLimitDropdown] = useState(false);
    const [totalTestimonials, setTotalTestimonials] = useState(0);
    const [totalRewards, setTotalRewards] = useState(0);
    const [viewMode, setViewMode] = useState('grid'); // grid or list

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const token = sessionStorage.getItem('token');
        const accessExpire = sessionStorage.getItem('access_expire');
        if (!token || !accessExpire) {
          router.push('/login');
          return;
        }
        const fetchTestimonials = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await getForumTestimonials({ limit, page });
                const items = (res.data?.items || res.data?.testimonials || res.data || []).filter(t => t.status === 'Accepted');
                setTestimonials(items);
                const total = res.data?.total || res.data?.total_count || res.total || items.length;
                setTotalTestimonials(typeof total === 'number' ? total : Number(total) || items.length);
                
                // Calculate total rewards
                const rewards = items.reduce((sum, item) => sum + (item.reward || 0), 0);
                setTotalRewards(rewards);
            } catch (err) {
                setError(err.message || 'Gagal memuat testimoni');
            } finally {
                setLoading(false);
            }
        };
        fetchTestimonials();
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
    }, [page, limit, router]);

    const formatDate = (dateString) => {
        const d = new Date(dateString.replace(' ', 'T'));
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
            ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const handlePageChange = (newPage) => {
        console.log('handlePageChange called with:', newPage, 'current page:', page);
        if (newPage >= 1 && newPage !== page) {
            console.log('Setting page to:', newPage);
            setPage(newPage);
        }
    };

    // Modal overlay for image
    const ImageModal = ({ url, onClose }) => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-black/95 backdrop-blur-md animate-fadeIn" onClick={onClose}>
          <div className="relative max-w-full max-h-full p-4" onClick={e => e.stopPropagation()}>
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-gold to-brand-gold-deep rounded-3xl blur-xl opacity-50"></div>
            <Image
              src={url}
              alt="Bukti Penarikan Besar"
              unoptimized
              width={500}
              height={500}
              className="relative rounded-2xl shadow-2xl border-2 border-brand-gold/20 max-h-[80vh] w-auto bg-brand-charcoal object-contain animate-slideUp"
            />
            <button
              onClick={onClose}
              className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition-all"
              aria-label="Tutup"
            >
              <Icon icon="mdi:close" className="w-5 h-5" />
            </button>
          </div>
        </div>
    );

    return (
      <div className="min-h-screen bg-brand-black pb-32 relative overflow-hidden">
        <Head>
          <title>{applicationData?.name || 'Money Rich'} | Testimoni</title>
          <meta name="description" content={`${applicationData?.name || 'Money Rich'} Testimonials`} />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        {modalImage && <ImageModal url={modalImage} onClose={() => setModalImage(null)} />}

        {/* Background elements - matching referral/dashboard style */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.18),rgba(5,6,8,0.95))]"></div>
          <div className="absolute -top-40 -left-32 w-[420px] h-[420px] rounded-full bg-brand-gold/20 blur-[180px] opacity-70"></div>
          <div className="absolute bottom-20 right-[-140px] w-[520px] h-[520px] rounded-full bg-brand-gold-deep/15 blur-[220px] opacity-80"></div>
          <div className="absolute bottom-[-120px] left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full bg-brand-emerald/12 blur-[200px] opacity-70"></div>
        </div>

        <div className="max-w-sm mx-auto p-4 relative z-10">
          {/* Hero Header Section */}
          <div className="relative mb-6 pt-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-gold via-brand-gold-deep to-brand-gold rounded-3xl blur-xl opacity-30"></div>
            <div className="relative bg-gradient-to-br from-brand-surface via-brand-surface-soft to-brand-charcoal rounded-3xl p-6 border border-brand-gold/20 overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-emerald rounded-full blur-2xl"></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-gold to-brand-gold-deep flex items-center justify-center shadow-lg shadow-brand-gold/40 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        <Icon icon="mdi:comment-quote" className="w-9 h-9 text-brand-black" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand-emerald border-2 border-brand-black flex items-center justify-center">
                        <Icon icon="mdi:check" className="w-3 h-3 text-brand-black" />
                      </div>
                    </div>
                    <div>
                      <h1 className="text-2xl font-black text-white mb-1">Testimoni Member</h1>
                      <p className="text-white/70 text-xs leading-relaxed">Bukti nyata keberhasilan investasi bersama Money Rich</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/30'
                    : 'bg-brand-surface text-white/60 border border-white/10 hover:border-brand-gold/20'
                }`}
              >
                <Icon icon="mdi:view-grid" className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/30'
                    : 'bg-brand-surface text-white/60 border border-white/10 hover:border-brand-gold/20'
                }`}
              >
                <Icon icon="mdi:view-list" className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-white/50">
              Halaman {page} dari {Math.ceil(totalTestimonials / limit) || 1}
            </div>
          </div>

          {/* Testimonials Grid/List */}
          {loading && (
            <div className="flex flex-col items-center justify-center my-12">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-3 border-brand-gold/20 border-t-brand-gold"></div>
                <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-brand-gold/40"></div>
              </div>
              <p className="text-white/70 text-center mt-4 text-sm">Memuat testimoni...</p>
            </div>
          )}
          {error && !loading && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 text-center mb-6">
              <Icon icon="mdi:alert-circle" className="text-red-400 w-8 h-8 mx-auto mb-2" />
              <h3 className="text-white font-semibold">Terjadi Kesalahan</h3>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
          {!loading && !error && testimonials.length === 0 && (
            <div className="bg-brand-surface border border-white/10 rounded-2xl p-8 text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mx-auto mb-4">
                <Icon icon="mdi:comment-off" className="w-8 h-8 text-brand-gold" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Belum Ada Testimoni</h3>
              <p className="text-white/60 text-sm mb-4">Jadilah yang pertama mengunggah testimoni!</p>
              <button
                onClick={() => router.push('/forum/upload')}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-gold to-brand-gold-deep text-brand-black font-semibold px-4 py-2 text-sm shadow-brand-glow hover:scale-105 transition-transform"
              >
                <Icon icon="mdi:upload" className="w-4 h-4" />
                Unggah Testimoni
              </button>
            </div>
          )}
          {!loading && !error && testimonials.length > 0 && (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-2 gap-3 mb-6' 
              : 'space-y-3 mb-6'
            }>
              {testimonials.map((t) => (
                <TestimonialCard 
                  key={t.id} 
                  t={t} 
                  setModalImage={setModalImage} 
                  formatCurrency={formatCurrency}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && !error && testimonials.length > 0 && (
            <div className="space-y-4 mt-6 mb-4">
              {/* Limit Selector and Page Info */}
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
                        {[10, 12, 20, 50, 100].map((l) => (
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
                  Menampilkan {((page - 1) * limit) + 1} - {Math.min(page * limit, totalTestimonials || testimonials.length)} dari {totalTestimonials || testimonials.length} testimoni
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
                  {[...Array(Math.min(5, Math.ceil((totalTestimonials || testimonials.length) / limit) || 1))].map((_, idx) => {
                    const totalPages = Math.ceil((totalTestimonials || testimonials.length) / limit) || 1;
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
                    const totalPages = Math.ceil((totalTestimonials || testimonials.length) / limit) || 1;
                    if (page < totalPages) {
                      handlePageChange(page + 1);
                    }
                  }}
                  disabled={(() => {
                    // Disable if we're on the last page
                    const totalPages = Math.ceil((totalTestimonials || testimonials.length) / limit) || 1;
                    const isLastPage = page >= totalPages;
                    
                    // Also disable if we got less than limit items (meaning no more pages)
                    const hasLessThanLimit = testimonials.length < limit;
                    
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

          {/* Add Testimonial CTA */}
          {!loading && (
            <div className="relative mt-6 mb-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-gold via-brand-emerald to-brand-gold rounded-3xl blur-xl opacity-25 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-brand-surface via-brand-surface-soft to-brand-charcoal rounded-3xl p-6 border border-brand-gold/30 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-full blur-2xl"></div>
                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-brand-gold to-brand-gold-deep mb-3 shadow-brand-glow">
                    <Icon icon="mdi:star-circle" className="w-6 h-6 text-brand-black" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">Bagikan Pengalaman Anda</h3>
                  <p className="text-white/70 text-sm mb-4">Dapatkan bonus Rp 2.000 - Rp 20.000 untuk setiap testimoni yang terverifikasi.</p>
                  <button
                    onClick={() => router.push('/forum/upload')}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-gold to-brand-gold-deep text-brand-black font-semibold px-5 py-2.5 text-sm shadow-brand-glow hover:scale-105 active:scale-95 transition-transform"
                  >
                    <Icon icon="mdi:upload" className="w-4 h-4" />
                    Unggah Testimoni Sekarang
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Copyright */}
          <Copyright />
        </div>

        {/* Floating Upload Button - Above Navbar */}
        <button
          onClick={() => router.push('/forum/upload')}
          className="fixed bottom-24 right-4 z-40 w-16 h-16 rounded-full bg-gradient-to-br from-brand-gold to-brand-gold-deep text-brand-black shadow-[0_0_35px_rgba(232,193,82,0.4)] hover:shadow-[0_0_45px_rgba(232,193,82,0.5)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group"
          aria-label="Unggah Testimoni"
        >
          <Icon icon="mdi:plus" className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
        </button>

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
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          
          .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
          .animate-slideUp { animation: slideUp 0.5s ease-out; }
          .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
      </div>
    );
}

// TestimonialCard component for cleaner map rendering
// Optimized TestimonialCard component for testimoni.js
// Replace the existing TestimonialCard function with this

function TestimonialCard({ t, setModalImage, formatCurrency, viewMode = 'grid' }) {
    const [imgUrl, setImgUrl] = useState(null);
    useEffect(() => {
        let isMounted = true;
        if (t.image) {
            fetch(`/api/s3-image?key=${encodeURIComponent(t.image)}`)
                .then(res => res.json())
                .then(data => { if (isMounted && data.url) setImgUrl(data.url); });
        }
        return () => { isMounted = false; };
    }, [t.image]);

    if (viewMode === 'list') {
      return (
        <div className="bg-gradient-to-r from-brand-surface via-brand-surface-soft to-brand-charcoal rounded-2xl border border-white/10 overflow-hidden animate-fadeIn hover:border-brand-gold/30 hover:shadow-lg hover:shadow-brand-gold/10 transition-all duration-300">
          <div className="flex flex-col sm:flex-row gap-4 p-4">
            {/* Avatar & Info */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-gold to-brand-gold-deep flex items-center justify-center shadow-md shadow-brand-gold/30 flex-shrink-0">
                  <Icon icon="mdi:account" className="w-6 h-6 text-brand-black" />
                </div>
                {t.image && imgUrl && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-brand-emerald border-2 border-brand-black flex items-center justify-center">
                    <Icon icon="mdi:image" className="w-3 h-3 text-brand-black" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-bold text-white text-sm">{t.name}</p>
                <p className="text-xs text-white/60">+62{String(t.number).replace(/^\+?62|^0/, '')}</p>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/80 leading-relaxed mb-3">
                {t.description}
              </p>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Icon icon="mdi:clock-outline" className="w-4 h-4" />
                  <span>
                    {new Date(t.time.replace(' ', 'T')).toLocaleDateString('id-ID', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-brand-emerald/15 text-brand-emerald px-3 py-1.5 rounded-lg text-xs font-bold border border-brand-emerald/30">
                  <Icon icon="mdi:gift" className="w-4 h-4" />
                  <span>{formatCurrency(t.reward)}</span>
                </div>
              </div>
            </div>

            {/* Image */}
            {t.image && imgUrl && (
              <div className="flex-shrink-0 sm:w-24 sm:h-24 w-full h-32">
                <Image
                  src={imgUrl}
                  alt="bukti penarikan"
                  unoptimized
                  width={96}
                  height={96}
                  className="w-full h-full object-cover rounded-xl border-2 border-white/10 shadow-lg cursor-pointer hover:scale-105 hover:border-brand-gold/40 transition-all duration-200"
                  onClick={() => setModalImage(imgUrl)}
                />
              </div>
            )}
          </div>
        </div>
      );
    }

    // Grid View
    return (
      <div className="group relative bg-gradient-to-br from-brand-surface via-brand-surface-soft to-brand-charcoal rounded-2xl border border-white/10 overflow-hidden animate-fadeIn hover:border-brand-gold/30 hover:shadow-xl hover:shadow-brand-gold/20 transition-all duration-300 cursor-pointer">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/0 via-brand-gold/0 to-brand-gold/0 group-hover:from-brand-gold/5 group-hover:via-brand-gold/0 group-hover:to-brand-emerald/5 transition-all duration-300 pointer-events-none"></div>
        
        <div className="relative z-10">
          {/* Header with Avatar */}
          <div className="p-3 border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-gold to-brand-gold-deep flex items-center justify-center shadow-md shadow-brand-gold/30 flex-shrink-0">
                  <Icon icon="mdi:account" className="w-4 h-4 text-brand-black" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-white text-xs truncate">{t.name}</p>
                  <p className="text-[10px] text-white/60 truncate">+62{String(t.number).replace(/^\+?62|^0/, '')}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-brand-emerald/15 text-brand-emerald px-2 py-0.5 rounded-md text-[10px] font-bold border border-brand-emerald/30">
                <Icon icon="mdi:gift" className="w-3 h-3" />
                <span className="hidden sm:inline">{formatCurrency(t.reward)}</span>
              </div>
            </div>
          </div>

          {/* Image */}
          {t.image && imgUrl ? (
            <div className="relative w-full aspect-square overflow-hidden bg-brand-black/20">
              <Image
                src={imgUrl}
                alt="bukti penarikan"
                unoptimized
                fill
                className="object-cover cursor-pointer group-hover:scale-110 transition-transform duration-300"
                onClick={() => setModalImage(imgUrl)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-brand-gold/90 backdrop-blur-sm rounded-lg px-2 py-1 text-[10px] font-bold text-brand-black flex items-center gap-1">
                  <Icon icon="mdi:eye" className="w-3 h-3" />
                  Lihat
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full aspect-square bg-brand-black/20 flex items-center justify-center">
              <Icon icon="mdi:image-off" className="w-8 h-8 text-white/20" />
            </div>
          )}

          {/* Description */}
          <div className="p-3">
            <p className="text-xs text-white/80 leading-relaxed line-clamp-2 mb-2">
              {t.description}
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="flex items-center gap-1.5 text-[10px] text-white/50">
                <Icon icon="mdi:clock-outline" className="w-3 h-3" />
                <span>
                  {new Date(t.time.replace(' ', 'T')).toLocaleDateString('id-ID', { 
                    day: '2-digit', 
                    month: 'short'
                  })}
                </span>
              </div>
              {!t.image && (
                <div className="text-brand-emerald text-[10px] font-bold">
                  {formatCurrency(t.reward)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
}

// Usage Instructions:
// 1. Import Image from 'next/image' at the top if not already imported
// 2. Import Icon from '@iconify/react' at the top if not already imported  
// 3. Replace the existing TestimonialCard function with this one
// 4. The line-clamp-3 utility may need Tailwind CSS plugin, or use manual overflow: hidden with max-height
