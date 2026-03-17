import Head from 'next/head';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { loginUser, getInfo } from '../utils/api';
import Image from 'next/image';
import Copyright from '../components/copyright';

export default function Login() {
    const router = useRouter();
    const [formData, setFormData] = useState({ number: '', password: '' });
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const [applicationData, setApplicationData] = useState(null);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [logoError, setLogoError] = useState(false);

    useEffect(() => {
        const storedApplication = sessionStorage.getItem('application');
        if (storedApplication) {
            try {
                const parsed = JSON.parse(storedApplication);
                setApplicationData({
                    name: parsed.name || 'Money Rich',
                    healthy: parsed.healthy || false,
                });
            } catch (e) {
                setApplicationData({ name: 'Money Rich', healthy: false });
            }
        } else {
            setApplicationData({ name: 'Money Rich', healthy: false });
        }

        (async () => {
            try {
                const data = await getInfo();
                if (data && data.success && data.data) {
                    const app = data.data;
                    if (app.name && app.company) {
                        const stored = JSON.parse(sessionStorage.getItem('application') || '{}');
                        const merged = { ...(stored || {}), name: app.name, company: app.company };
                        sessionStorage.setItem('application', JSON.stringify(merged));
                        setApplicationData(prev => ({ ...(prev || {}), name: app.name, company: app.company }));
                    }
                    if (app.maintenance) {
                        setMaintenanceMode(true);
                        setNotification({ message: 'Aplikasi sedang dalam pemeliharaan. Silakan coba lagi nanti.', type: 'error' });
                    }
                }
            } catch (err) {
                // ignore fetch errors here
            }
        })();
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleNumberChange = (e) => {
        let value = e.target.value.replace(/[^0-9+]/g, '');

        if (value.startsWith('+')) {
            value = value.slice(1);
        }

        value = value.replace(/[^0-9]/g, '');

        if (/^(62|0)8/.test(value)) {
            value = value.replace(/^(62|0)/, '');
        }

        if (!value.startsWith('8') && value.length > 0) {
            value = value.replace(/^62/, '');
        }

        if (value.length > 12) value = value.slice(0, 12);

        setFormData((prev) => ({ ...prev, number: value }));
    };

    useEffect(() => {
        const num = formData.number || '';
        const isPhoneValid = /^8\d{8,11}$/.test(num);
        setIsFormValid(isPhoneValid && (formData.password || '').length >= 6);
    }, [formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (maintenanceMode) {
            setNotification({ message: 'Aplikasi sedang dalam pemeliharaan, Anda tidak dapat masuk. Silakan coba lagi nanti.', type: 'error' });
            return;
        }
        setIsLoading(true);
        setNotification({ message: '', type: '' });

        try {
            const result = await loginUser(formData);

            if (result && result.success === true) {
                setFormData({ number: '', password: '' });
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('user-token-changed'));
                }

                router.push('/dashboard');

            } else if (result && result.success === false) {
                const errorMessage = result.message || 'Terjadi kesalahan. Silakan coba lagi.';
                setNotification({ message: errorMessage, type: 'error' });
            } else {
                setNotification({ message: 'Respon server tidak valid. Silakan coba lagi.', type: 'error' });
            }

        } catch (error) {
            console.error('Login error:', error);

            if (error.response) {
                const statusCode = error.response.status;
                const responseData = error.response.data;

                if (statusCode >= 400 && statusCode < 500) {
                    const errorMessage = responseData?.message || 'Data yang dimasukkan tidak valid';
                    setNotification({ message: errorMessage, type: 'error' });
                } else if (statusCode >= 500) {
                    const errorMessage = responseData?.message || 'Terjadi kesalahan server. Silakan coba lagi nanti.';
                    setNotification({ message: errorMessage, type: 'error' });
                } else {
                    setNotification({ message: 'Terjadi kesalahan yang tidak diketahui', type: 'error' });
                }
            } else if (error.request) {
                setNotification({ message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.', type: 'error' });
            } else {
                const errorMessage = error.message || 'Terjadi kesalahan. Silakan coba lagi.';
                setNotification({ message: errorMessage, type: 'error' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const token = sessionStorage.getItem('token');
        const accessExpire = sessionStorage.getItem('access_expire');
        if (token && accessExpire) {
            const now = new Date();
            const expiry = new Date(accessExpire);
            if (now < expiry) {
                router.replace('/dashboard');
            }
        }
    }, [router]);

    return (
        <>
            <Head>
                <title>{applicationData?.name || 'Money Rich'} | Masuk</title>
                <meta name="description" content={`Masuk ke akun${applicationData?.name ? ' ' + applicationData.name : ''} - Akses layanan platform dengan aman.`} />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://moneyrich.co/login" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="min-h-screen bg-brand-black text-white relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.22),rgba(5,6,8,0.95))]"></div>
                    <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-[#e8c152]/15 blur-3xl"></div>
                    <div className="absolute -bottom-48 -right-20 w-[620px] h-[620px] rounded-full bg-[#b9891f]/10 blur-[140px]"></div>
                    <div className="absolute top-1/4 left-1/3 w-[320px] h-[320px] rounded-full bg-[#4cd6c4]/5 blur-[120px]"></div>
                </div>

                <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
                    <header className="hidden lg:flex lg:flex-row lg:items-center lg:justify-between gap-6 mb-16">
                        <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-brand-surface border border-white/5 flex items-center justify-center shadow-brand-glow">
                                {!logoError ? (
                                    <Image
                                        src="/logo.svg"
                                        alt="Money Rich Logo"
                                        width={64}
                                        height={64}
                                        priority
                                        className="object-contain"
                                        onError={() => setLogoError(true)}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-brand-gold to-brand-gold-deep text-brand-black font-black text-2xl">
                                        MA
                                        </div>
                                )}
                                        </div>
                                            <div>
                                <p className="text-xs uppercase tracking-[0.35em] text-white/40">Money Rich</p>
                                <h1 className="text-2xl font-semibold text-white">Masuk ke Akun Anda</h1>
                                    </div>
                                </div>

                        <div className="flex items-center gap-6">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-white/40">Platform Terpercaya</p>
                                <p className="text-2xl font-black text-brand-gold">10K+</p>
                            </div>
                            <div className="hidden sm:flex h-12 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold">
                                    <Icon icon="mdi:shield-check" className="w-5 h-5" />
                                            </div>
                                            <div>
                                    <p className="text-sm font-semibold text-white">Keamanan Prioritas</p>
                                    <p className="text-xs text-white/50">Dilindungi oleh standar multi-layer</p>
                                            </div>
                                            </div>
                                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-16 items-center">
                        <div className="hidden lg:flex lg:flex-col space-y-10">
                            <div className="space-y-5">
                                <span className="inline-flex items-center gap-2 rounded-full border border-brand-gold/20 bg-brand-surface/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold">
                                    <span className="h-1.5 w-1.5 rounded-full bg-brand-gold animate-pulse"></span>
                                    Premium platform
                                </span>
<h2 className="text-4xl lg:text-5xl font-black leading-tight">
                                    Kelola aktivitas Anda bersama <span className="text-brand-gold">Money Rich</span>
                                </h2>
                                <p className="text-base text-white/60 max-w-xl">
                                    Akses berbagai layanan dan fitur platform dengan dukungan penuh dari tim kami.
                                </p>
                                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="rounded-3xl border border-white/10 bg-brand-surface/80 p-6 shadow-[0_0_35px_rgba(232,193,82,0.12)] hover:border-brand-gold/40 transition-all duration-300">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-11 w-11 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold">
                                            <Icon icon="mdi:lightning-bolt" className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-white">Akses Cepat</h3>
                                    </div>
                                    <p className="text-sm text-white/55 leading-relaxed">
                                        Akses berbagai fitur dan layanan platform dengan mudah dan cepat.
                                    </p>
                                            </div>
                                <div className="rounded-3xl border border-white/10 bg-brand-surface/80 p-6 shadow-[0_0_35px_rgba(232,193,82,0.12)] hover:border-brand-gold/40 transition-all duration-300">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-11 w-11 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold">
                                            <Icon icon="mdi:shield-check" className="w-6 h-6" />
                                            </div>
                                        <h3 className="text-lg font-semibold text-white">Aman & Terpercaya</h3>
                                        </div>
                                    <p className="text-sm text-white/55 leading-relaxed">
                                        Platform yang aman dengan standar keamanan terkini untuk data Anda.
                                    </p>
                                            </div>
                                <div className="rounded-3xl border border-white/10 bg-brand-surface/80 p-6 shadow-[0_0_35px_rgba(232,193,82,0.12)] hover:border-brand-gold/40 transition-all duration-300 sm:col-span-2">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-11 w-11 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold">
                                            <Icon icon="mdi:headset" className="w-6 h-6" />
                                            </div>
                                        <h3 className="text-lg font-semibold text-white">Dukungan 24/7</h3>
                                        </div>
                                    <p className="text-sm text-white/55 leading-relaxed">
                                        Tim support siap membantu kapan pun Anda memerlukan bantuan.
                                    </p>
                                    </div>
                                </div>

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                                <div>
                                    <p className="text-4xl font-black text-brand-gold">98%</p>
                                    <p className="text-xs uppercase tracking-widest text-white/45">Tingkat kepuasan member</p>
                                        </div>
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-2">
                                        <span className="h-9 w-9 rounded-full border border-brand-surface bg-brand-gold/20"></span>
                                        <span className="h-9 w-9 rounded-full border border-brand-surface bg-brand-gold/30"></span>
                                        <span className="h-9 w-9 rounded-full border border-brand-surface bg-brand-gold/20"></span>
                                        </div>
                                    <p className="text-sm text-white/60 max-w-[220px]">
                                        Komunitas aktif dengan update dan informasi terbaru setiap hari.
                                    </p>
                                        </div>
                                    </div>
                                </div>

                        <div className="relative">
                            <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-br from-brand-gold/30 via-transparent to-brand-gold/20 blur-3xl opacity-70"></div>
                            <div className="relative rounded-[26px] border border-white/10 bg-brand-surface/95 backdrop-blur-xl p-8 sm:p-10 shadow-brand-glow">
                                <div className="lg:hidden flex flex-col items-center text-center mb-6 gap-4">
                                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-brand-surface border border-white/10 flex items-center justify-center shadow-brand-glow">
                                        {!logoError ? (
                                                <Image
                                                src="/logo.svg"
                                                alt="Money Rich Logo"
                                                width={48}
                                                height={48}
                                                    priority
                                                className="object-contain"
                                                onError={() => setLogoError(true)}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-brand-gold to-brand-gold-deep text-brand-black font-black text-xl">
                                                MA
                                            </div>
                                        )}
                                                </div>
                                    <div className="space-y-1">
                                        <h2 className="text-xl font-bold text-white">Masuk ke Akun Anda</h2>
                                        <p className="text-xs text-white/60">Akses akun Anda dengan aman di mana saja</p>
                                            </div>
                                        </div>
                                <div className="text-center mb-8 space-y-2">
                                    <h2 className="text-3xl font-bold text-white">Masuk</h2>
                                    <p className="text-sm text-white/55">Akses akun Money Rich Anda.</p>
                                    </div>

                                    {notification.message && (
                                    <div
                                        className={`mb-6 px-5 py-4 rounded-2xl text-sm font-semibold flex items-start gap-3 border ${
                                            notification.type === 'success'
                                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-400/20'
                                                : 'bg-red-500/10 text-red-300 border-red-400/20'
                                        }`}
                                    >
                                            <Icon
                                            icon={notification.type === 'success' ? 'mdi:check-decagram' : 'mdi:alert-decagram'}
                                                className="w-5 h-5 flex-shrink-0 mt-0.5"
                                            />
                                        <span className="flex-1 leading-relaxed">{notification.message}</span>
                                        </div>
                                    )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Phone Number Field */}
                                        <div className="space-y-2">
                      <label htmlFor="number" className="block text-[#D8CFB6] text-sm font-semibold flex items-center gap-2">
                        <Icon icon="mdi:phone" className="w-4 h-4 text-[#E8C152]" />
                                                Nomor HP
                                            </label>
                                            <div className="relative group">
                        <div className="brand-input">
                                                    <div className="flex items-center shrink-0 px-4 py-4 border-r border-white/5">
                                                        <Icon icon="flag:id-4x3" className="w-6 h-6 mr-2 shrink-0" />
                            <span className="text-[#D8CFB6] text-sm font-semibold whitespace-nowrap">+62</span>
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        id="number"
                            className="brand-input-field px-4 text-[#F7F3E5] placeholder-[#D8CFB6]/40 text-sm font-medium"
                                                        placeholder="8xxxxxxxxxxx"
                                                        value={formData.number}
                                                        onChange={handleNumberChange}
                                                        required
                                                        autoComplete="username"
                                                    />
                                                    <div className="flex items-center shrink-0 px-4">
                            {formData.number ? (
                              <Icon icon="mdi:check-circle" className="w-5 h-5 shrink-0 text-[#E8C152]" />
                                                        ) : (
                              <Icon icon="mdi:phone-outline" className="w-5 h-5 shrink-0 text-[#D8CFB6]/20" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Password Field */}
                                        <div className="space-y-2">
                      <label htmlFor="password" className="block text-[#D8CFB6] text-sm font-semibold flex items-center gap-2">
                        <Icon icon="mdi:lock" className="w-4 h-4 text-[#E8C152]" />
                                                Password
                                            </label>
                                            <div className="relative group">
                        <div className="brand-input">
                                                    <div className="flex items-center px-4 py-4">
                            <Icon icon="mdi:lock-outline" className="text-[#D8CFB6]/50 w-5 h-5" />
                                                    </div>
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        id="password"
                            className="brand-input-field px-2 py-4 text-[#F7F3E5] placeholder-[#D8CFB6]/40 text-sm font-medium"
                            placeholder="Buat password yang kuat"
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        required
                            autoComplete="new-password"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                            className="flex items-center px-4 py-4 text-[#D8CFB6]/50 hover:text-[#F7F3E5] transition-colors flex-shrink-0"
                                                    >
                                                        <Icon
                                                            icon={showPassword ? "mdi:eye-off" : "mdi:eye"}
                                                            className="w-5 h-5"
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                        className={`w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${
                                                (!maintenanceMode && isFormValid)
                                                ? 'bg-gradient-to-r from-brand-gold to-brand-gold-deep text-brand-black hover:shadow-brand-glow hover:-translate-y-0.5'
                                                : 'bg-brand-surface-soft text-white/30 cursor-not-allowed'
                                            }`}
                                            disabled={isLoading || !isFormValid || maintenanceMode}
                                        >
                                            {isLoading ? (
                                                <>
                                                <span className="animate-spin rounded-full h-5 w-5 border-2 border-brand-black/30 border-t-brand-black"></span>
                                                    <span>Sedang Login...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Icon icon="mdi:login-variant" className="w-5 h-5" />
                                                <span>Masuk ke Money Rich</span>
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    <div className="relative my-8">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-white/10"></div>
                                        </div>
                                    <div className="relative flex justify-center">
                                        <span className="px-4 text-xs uppercase tracking-[0.3em] text-white/40 bg-brand-surface">
                                            atau
                                        </span>
                                        </div>
                                    </div>

                                <div className="text-center space-y-3">
                                    <p className="text-sm text-white/55">Belum punya akun?</p>
                                        <Link href="/register" passHref legacyBehavior>
                                            <a className="inline-flex items-center gap-2 rounded-xl border border-brand-gold/30 bg-brand-gold/10 px-6 py-3 font-semibold text-brand-gold hover:bg-brand-gold hover:text-brand-black transition-colors duration-200 cursor-pointer border border-white/10 hover:border-[#F45D16]/30">
                                                <Icon icon="mdi:account-plus" className="w-5 h-5" />
                                                Daftar Sekarang
                                            </a>
                                        </Link>
                                    </div>
                            </div>
                                </div>
                            </div>

                    <footer className="mt-24 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-white/40">
                        <div className="flex items-center gap-2">
                            <Copyright />
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/privacy-policy" className="hover:text-brand-gold transition-colors">
                                Kebijakan Privasi
                            </Link>
                            <span>•</span>
                            <Link href="/terms-and-conditions" className="hover:text-brand-gold transition-colors">
                                Syarat & Ketentuan
                            </Link>
                            </div>
                    </footer>
                        </div>

                {/* eslint-disable react/no-unknown-property */}
                <style jsx global>{`
          .brand-input {
                        display: flex;
                        align-items: center;
            background: rgba(17, 19, 26, 0.92);
            border: 1.5px solid rgba(255, 255, 255, 0.08);
            border-radius: 0.9rem;
            overflow: hidden;
                        transition: all 0.3s ease;
                    }

          .brand-input-field {
            flex: 1;
            background: transparent;
            outline: none;
            border: 0;
            min-width: 0;
            padding: 1rem;
            color: #ffffff;
            font-size: 0.95rem;
            font-weight: 500;
          }

          .brand-input:focus-within {
            border-color: rgba(232, 193, 82, 0.5);
            box-shadow: 0 0 0 4px rgba(232, 193, 82, 0.12);
            background: rgba(17, 19, 26, 0.96);
          }

          .brand-input-field::placeholder {
            color: rgba(255, 255, 255, 0.35);
                    }
                `}</style>
                {/* eslint-enable react/no-unknown-property */}
            </div>
        </>
    );
}
