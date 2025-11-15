// pages/guide.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import { getTutorials } from '../utils/api';
import BottomNavbar from '../components/BottomNavbar';
import Copyright from '../components/copyright';

export default function Guide() {
  const router = useRouter();
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applicationData, setApplicationData] = useState(null);
  const [imageUrls, setImageUrls] = useState({});

  // Fetch image URL from S3
  const fetchImageUrl = async (imageKey) => {
    if (!imageKey) return null;
    try {
      const res = await fetch(`/api/s3-image-server?key=${encodeURIComponent(imageKey)}`);
      const data = await res.json();
      return data?.url || null;
    } catch (e) {
      console.error('Error fetching image:', e);
      return null;
    }
  };

  const fetchTutorials = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTutorials();
      if (res.success && res.data) {
        const tutorialsData = res.data.tutorials || res.data || [];
        const fetchedTutorials = Array.isArray(tutorialsData) ? tutorialsData : [];
        setTutorials(fetchedTutorials);

        // Fetch all image URLs
        const urlPromises = fetchedTutorials.map(async (tutorial) => {
          if (tutorial.image) {
            const url = await fetchImageUrl(tutorial.image);
            return { id: tutorial.id, url };
          }
          return { id: tutorial.id, url: null };
        });

        const urlResults = await Promise.all(urlPromises);
        const urlMap = {};
        urlResults.forEach(({ id, url }) => {
          if (url) urlMap[id] = url;
        });
        setImageUrls(urlMap);
      } else {
        setTutorials([]);
        setError(res.message || 'Gagal memuat video panduan');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      console.error('Error fetching tutorials:', err);
      setTutorials([]);
    }
    setLoading(false);
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

    fetchTutorials();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleTutorialClick = (link) => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-white relative overflow-hidden pb-32">
      <Head>
        <title>{applicationData?.name || 'Money Rich'} | Video Panduan</title>
        <meta name="description" content={`${applicationData?.name || 'Money Rich'} Video Panduan`} />
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
            <Icon icon="mdi:play-circle" className="w-4 h-4" />
            Video Panduan
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">
                Video Panduan
              </h1>
              <p className="text-sm text-white/60 max-w-2xl mt-2">
                Pelajari cara menggunakan platform Money Rich dengan mudah melalui video panduan yang telah kami siapkan. Tonton dan ikuti langkah-langkahnya.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Icon icon="mdi:youtube" className="w-4 h-4 text-red-500" />
              Video dari YouTube
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="relative animate-shake mb-6">
            <div className="absolute -inset-0.5 bg-red-500/50 rounded-2xl blur"></div>
            <div className="relative bg-red-500/10 border border-red-400/30 rounded-2xl p-4 flex items-start gap-3">
              <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-red-300 text-sm leading-relaxed">{error}</span>
            </div>
          </div>
        )}

        {/* Tutorials List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-3 border-brand-gold/20 border-t-brand-gold"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-brand-gold/40"></div>
            </div>
            <p className="text-white/70 text-sm mt-4">Memuat video panduan...</p>
          </div>
        ) : tutorials.length === 0 && !error ? (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface-soft/90 p-12 text-center shadow-[0_20px_60px_rgba(5,6,8,0.6)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,193,82,0.1),transparent)]"></div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-brand-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-brand-gold/20">
                <Icon icon="mdi:video-off" className="text-brand-gold w-10 h-10" />
              </div>
              <h3 className="text-white font-black text-xl mb-3">Belum Ada Video Panduan</h3>
              <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
                Video panduan akan muncul di sini setelah tersedia.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorials.map((tutorial) => {
              const imageUrl = imageUrls[tutorial.id];
              
              return (
                <div
                  key={tutorial.id}
                  onClick={() => handleTutorialClick(tutorial.link)}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface-soft/90 cursor-pointer shadow-[0_20px_60px_rgba(5,6,8,0.6)] hover:shadow-[0_25px_70px_rgba(232,193,82,0.2)] transition-all duration-300 hover:scale-[1.02] hover:border-brand-gold/30"
                >
                  {/* Thumbnail Image */}
                  <div className="relative w-full aspect-video bg-brand-black/40 overflow-hidden">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={tutorial.title || 'Video Panduan Thumbnail'}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-gold/20 to-brand-gold-deep/10">
                        <Icon icon="mdi:play-circle" className="w-16 h-16 text-brand-gold/50" />
                      </div>
                    )}
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-brand-gold/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-brand-gold/50 group-hover:scale-110 transition-transform duration-300">
                        <Icon icon="mdi:play" className="w-8 h-8 text-brand-black ml-1" />
                      </div>
                    </div>

                    {/* YouTube Badge */}
                    <div className="absolute top-3 right-3 bg-red-600/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1.5">
                      <Icon icon="mdi:youtube" className="w-4 h-4 text-white" />
                      <span className="text-white text-[10px] font-bold">YouTube</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-white font-black text-lg mb-2 line-clamp-2 group-hover:text-brand-gold transition-colors">
                      {tutorial.title || 'Video Panduan'}
                    </h3>
                    <div className="flex items-center gap-2 text-white/50 text-xs">
                      <Icon icon="mdi:clock-outline" className="w-4 h-4" />
                      <span>Tonton di YouTube</span>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              );
            })}
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
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

