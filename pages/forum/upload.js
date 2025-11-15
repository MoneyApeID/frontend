// pages/forum/upload.js
import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { checkForumStatus, submitForumTestimonial } from '../../utils/api';
import BottomNavbar from '../../components/BottomNavbar';
import Copyright from '../../components/copyright';
import { Icon } from '@iconify/react';

export default function UploadWithdrawal() {
    const router = useRouter();
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [statusLoading, setStatusLoading] = useState(true);
    const [canUpload, setCanUpload] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [applicationData, setApplicationData] = useState(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const token = sessionStorage.getItem('token');
        const accessExpire = sessionStorage.getItem('access_expire');
        if (!token || !accessExpire) {
        router.push('/login');
        return;
        }
        // Check forum status on mount
        const checkStatus = async () => {
            setStatusLoading(true);
            setErrorMsg('');
            try {
                const res = await checkForumStatus();
                if (res?.data?.has_withdrawal) {
                    setCanUpload(true);
                    setStatusMsg('Anda dapat mengunggah testimoni penarikan karena ada penarikan dalam 3 hari terakhir.');
                } else {
                    setCanUpload(false);
                    setStatusMsg('Anda belum melakukan penarikan dalam 3 hari terakhir. Silakan lakukan penarikan terlebih dahulu untuk bisa mengunggah testimoni.');
                }
            } catch (err) {
                setErrorMsg('Gagal memeriksa status penarikan.');
            } finally {
                setStatusLoading(false);
            }
        };
        checkStatus();
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
    }, [router]);

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!['image/jpeg', 'image/png'].includes(file.type)) {
                setErrorMsg('File harus JPG atau PNG.');
                setSelectedFile(null);
                setPreviewUrl(null);
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                setErrorMsg('Ukuran file maksimal 2MB.');
                setSelectedFile(null);
                setPreviewUrl(null);
                return;
            }
            setErrorMsg('');
            setSelectedFile(file);
            
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        // Extra validation: prevent submit if no image
        if (!selectedFile) {
            setErrorMsg('Pilih gambar terlebih dahulu.');
            return;
        }
        if (selectedFile === null || typeof selectedFile !== 'object') {
            setErrorMsg('Pilih gambar terlebih dahulu.');
            return;
        }
        if (comment.trim().length < 5 || comment.trim().length > 60) {
            setErrorMsg('Deskripsi minimal 5 dan maksimal 60 karakter.');
            return;
        }
        setIsSubmitting(true);
        setUploadProgress(0);
        try {
            // Simulate progress
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += 15;
                setUploadProgress(Math.min(progress, 95));
            }, 150);

            // Submit to API
            const res = await submitForumTestimonial({ image: selectedFile, description: comment });
            clearInterval(progressInterval);
            setUploadProgress(100);
            setIsSubmitting(false);
            if (res?.success) {
                setSuccessMsg(res?.message || 'Postingan terkirim, menunggu persetujuan.');
                setErrorMsg('');
                setTimeout(() => {
                    setSuccessMsg('');
                    router.push('/forum');
                }, 5000);
            } else {
                setErrorMsg(res?.message || 'Gagal mengunggah testimoni.');
                setSuccessMsg('');
            }
        } catch (err) {
            setIsSubmitting(false);
            setErrorMsg('Gagal mengunggah testimoni.');
            setSuccessMsg('');
        }
    };

    return (
        <div className="min-h-screen bg-brand-black pb-32 relative overflow-hidden">
           <Head>
              <title>{applicationData?.name || 'Money Rich'} | Unggah Testimoni</title>
              <meta name="description" content={`${applicationData?.name || 'Money Rich'} Upload Testimonial`} />
              <link rel="icon" href="/favicon.ico" />
            </Head>

            {/* Background elements - matching referral/dashboard style */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.18),rgba(5,6,8,0.95))]"></div>
              <div className="absolute -top-40 -left-32 w-[420px] h-[420px] rounded-full bg-brand-gold/20 blur-[180px] opacity-70"></div>
              <div className="absolute bottom-20 right-[-140px] w-[520px] h-[520px] rounded-full bg-brand-gold-deep/15 blur-[220px] opacity-80"></div>
              <div className="absolute bottom-[-120px] left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full bg-brand-emerald/12 blur-[200px] opacity-70"></div>
            </div>

            {/* Top Navigation */}
            <div className="sticky top-0 z-20 bg-brand-black/85 backdrop-blur-xl border-b border-white/10">
              <div className="max-w-sm mx-auto p-4 flex items-center justify-between">
                <button 
                  onClick={() => router.back()}
                  className="w-10 h-10 flex items-center justify-center bg-brand-surface hover:bg-brand-surface-soft rounded-xl border border-white/10 hover:border-brand-gold/30 transition-all duration-300"
                >
                  <Icon icon="mdi:arrow-left" className="w-5 h-5 text-white" />
                </button>
                <div className="flex flex-col items-center">
                  <h1 className="text-lg font-bold text-white">Unggah Testimoni</h1>
                  <p className="text-[10px] text-white/50 mt-0.5">Bagikan bukti penarikan Anda</p>
                </div>
                <div className="w-10 h-10"></div>
              </div>
            </div>

            <div className="max-w-sm mx-auto p-4 relative z-10 pt-6">

                {/* Hero Section */}
                <div className="relative mb-6">
                    <div className="absolute -inset-1 bg-gradient-to-r from-brand-gold via-brand-gold-deep to-brand-gold rounded-3xl blur-xl opacity-25"></div>
                    <div className="relative bg-gradient-to-br from-brand-surface via-brand-surface-soft to-brand-charcoal rounded-3xl p-6 border border-brand-gold/20 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-full blur-2xl"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-gold to-brand-gold-deep flex items-center justify-center shadow-lg shadow-brand-gold/40">
                                    <Icon icon="mdi:upload" className="w-8 h-8 text-brand-black" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-black text-white mb-1">Unggah Testimoni</h2>
                                    <p className="text-xs text-white/60">Bagikan bukti penarikan dan dapatkan bonus</p>
                                </div>
                            </div>
                            
                            {/* Bonus Badge */}
                            <div className="inline-flex items-center gap-2 bg-brand-emerald/15 text-brand-emerald px-4 py-2 rounded-xl text-sm font-bold border border-brand-emerald/30 mb-4">
                                <Icon icon="mdi:gift" className="w-5 h-5" />
                                <span>Bonus: Rp 2.000 - Rp 20.000</span>
                            </div>

                            {/* Status Indicator */}
                            <div className={`mt-4 p-3 rounded-xl border ${canUpload ? 'bg-brand-emerald/10 border-brand-emerald/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                <div className="flex items-center gap-2">
                                    <Icon 
                                        icon={statusLoading ? "mdi:loading" : (canUpload ? "mdi:check-circle" : "mdi:alert-circle")} 
                                        className={`w-4 h-4 ${statusLoading ? 'text-white/70 animate-spin' : (canUpload ? 'text-brand-emerald' : 'text-red-400')}`} 
                                    />
                                    <span className={`text-xs font-semibold ${canUpload ? 'text-brand-emerald' : 'text-red-400'}`}>
                                        {statusLoading ? 'Memeriksa...' : (canUpload ? 'Siap Mengunggah' : 'Unggah Terkunci')}
                                    </span>
                                </div>
                                {!statusLoading && (
                                    <p className="text-xs text-white/60 mt-1.5 ml-6">
                                        {statusMsg}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upload Form */}
                <div className="bg-gradient-to-br from-brand-surface via-brand-surface-soft to-brand-charcoal rounded-3xl p-6 border border-white/10 mb-6 shadow-[0_20px_60px_rgba(5,6,8,0.55)]">
                    {errorMsg && (
                        <div className="relative animate-shake mb-4">
                            <div className="absolute -inset-0.5 bg-red-500/50 rounded-2xl blur"></div>
                            <div className="relative bg-red-500/10 border border-red-400/30 rounded-2xl p-4 flex items-start gap-3">
                                <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <span className="text-red-300 text-sm leading-relaxed">{errorMsg}</span>
                            </div>
                        </div>
                    )}
                    {successMsg && (
                        <div className="relative animate-fadeIn mb-4">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-emerald to-teal-500 rounded-2xl blur opacity-30"></div>
                            <div className="relative bg-brand-emerald/10 border border-brand-emerald/30 rounded-2xl p-4 flex items-start gap-3">
                                <Icon icon="mdi:check-circle" className="w-5 h-5 text-brand-emerald flex-shrink-0 mt-0.5" />
                                <span className="text-brand-emerald text-sm leading-relaxed font-semibold">{successMsg}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Image Upload Section */}
                        <div>
                            <label className="block text-white/80 text-sm font-semibold mb-3">
                                <span className="flex items-center gap-2">
                                    <Icon icon="mdi:image" className="w-4 h-4 text-brand-gold" />
                                    Bukti Penarikan
                                </span>
                                <span className="text-xs text-white/50 font-normal block mt-1">JPG/PNG, maksimal 2MB</span>
                            </label>
                            
                            {previewUrl ? (
                                <div className="relative group">
                                    <div className="relative rounded-2xl overflow-hidden border-2 border-brand-gold/30 bg-brand-black/40 aspect-video">
                                        <Image 
                                            src={previewUrl} 
                                            alt="Preview" 
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveFile}
                                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500/90 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                                            aria-label="Hapus gambar"
                                        >
                                            <Icon icon="mdi:close" className="w-4 h-4" />
                                        </button>
                                        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <div className="bg-brand-gold/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-bold text-brand-black">
                                                {selectedFile?.name}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={canUpload && !isSubmitting ? handleFileSelect : undefined}
                                    disabled={!canUpload || isSubmitting}
                                    className={`w-full relative group overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ${
                                        !canUpload || isSubmitting
                                            ? 'border-white/20 bg-brand-surface/50 cursor-not-allowed'
                                            : 'border-brand-gold/40 bg-brand-surface/30 hover:border-brand-gold hover:bg-brand-surface/50 cursor-pointer'
                                    }`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-brand-emerald/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="relative p-8 flex flex-col items-center justify-center gap-3">
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                                            !canUpload || isSubmitting
                                                ? 'bg-white/5'
                                                : 'bg-brand-gold/20 group-hover:bg-brand-gold/30'
                                        } transition-all`}>
                                            <Icon 
                                                icon="mdi:cloud-upload" 
                                                className={`w-8 h-8 ${!canUpload || isSubmitting ? 'text-white/30' : 'text-brand-gold'}`} 
                                            />
                                        </div>
                                        <div className="text-center">
                                            <p className={`text-sm font-semibold mb-1 ${!canUpload || isSubmitting ? 'text-white/40' : 'text-white'}`}>
                                                Klik untuk memilih gambar
                                            </p>
                                            <p className="text-xs text-white/50">
                                                atau drag & drop di sini
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/jpeg,image/png"
                                style={{ display: 'none' }}
                                disabled={!canUpload || isSubmitting}
                            />
                        </div>
                        {/* Description Section */}
                        <div>
                            <label className="block text-white/80 text-sm font-semibold mb-3">
                                <span className="flex items-center gap-2">
                                    <Icon icon="mdi:text-box" className="w-4 h-4 text-brand-gold" />
                                    Deskripsi Testimoni
                                </span>
                                <span className="text-xs text-white/50 font-normal block mt-1">
                                    {comment.length}/60 karakter (minimal 5 karakter)
                                </span>
                            </label>
                            <div className="relative">
                                <div className={`bg-brand-black/40 border rounded-2xl transition-all duration-300 ${
                                    !canUpload || isSubmitting 
                                        ? 'border-white/10 opacity-50' 
                                        : 'border-white/10 focus-within:border-brand-gold focus-within:shadow-[0_0_20px_rgba(232,193,82,0.2)]'
                                }`}>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        minLength={5}
                                        maxLength={60}
                                        placeholder="Tulis deskripsi singkat tentang penarikan Anda..."
                                        required
                                        className="w-full bg-transparent text-white placeholder-white/40 py-4 px-4 outline-none min-h-[100px] resize-none text-sm"
                                        disabled={!canUpload || isSubmitting}
                                    />
                                </div>
                                <div className="flex items-center justify-end mt-2">
                                    <div className={`text-xs font-semibold ${
                                        comment.length < 5 ? 'text-red-400' : 
                                        comment.length >= 60 ? 'text-brand-gold' : 
                                        'text-white/50'
                                    }`}>
                                        {comment.length}/60
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rules Section */}
                        <div className="p-4 bg-brand-black/30 rounded-xl border border-white/5">
                            <div className="flex items-start gap-2 mb-2">
                                <Icon icon="mdi:information" className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-white mb-2">Aturan Pengunggahan:</p>
                                    <ul className="text-xs text-white/60 space-y-1 list-disc list-inside">
                                        <li>Gambar harus bukti penarikan yang sah</li>
                                        <li>Deskripsi minimal 5 karakter, maksimal 60 karakter</li>
                                        <li>Hanya file JPG/PNG, maksimal 2MB</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting || !canUpload || !selectedFile || comment.trim().length < 5}
                            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm transition-all duration-300 shadow-lg ${
                                isSubmitting || !canUpload || !selectedFile || comment.trim().length < 5
                                    ? 'bg-brand-surface text-white/40 cursor-not-allowed border border-white/10' 
                                    : 'bg-gradient-to-r from-brand-gold to-brand-gold-deep hover:from-brand-gold-deep hover:to-brand-gold text-brand-black hover:scale-[1.02] active:scale-[0.98] shadow-brand-gold/30'
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin"></div>
                                    <span>Mengunggah...</span>
                                </>
                            ) : (
                                <>
                                    <Icon icon="mdi:upload" className="w-5 h-5" />
                                    <span>Unggah Testimoni</span>
                                </>
                            )}
                        </button>
                        
                        {isSubmitting && (
                            <div className="mt-4 space-y-2">
                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-brand-gold to-brand-gold-deep rounded-full transition-all duration-300 shadow-brand-glow" 
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-center text-white/60">
                                    Mengunggah {uploadProgress}%...
                                </p>
                            </div>
                        )}
                    </form>
                </div>

                {/* Copyright dengan jarak yang cukup dari bottom navbar */}
                <Copyright />
            </div>

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
