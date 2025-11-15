import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { registerUser, getInfo } from '../utils/api';
import Image from 'next/image';
import Copyright from '../components/copyright';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    password: '',
    password_confirmation: '',
    referral_code: '',
  });
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [applicationData, setApplicationData] = useState(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [closedRegister, setClosedRegister] = useState(false);
  const [referralLocked, setReferralLocked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [formValidation, setFormValidation] = useState({
    name: false,
    number: false,
    password: false,
    passwordMatch: false,
    referralCode: false
  });
  const [logoError, setLogoError] = useState(false);

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('token');
      const accessExpire = sessionStorage.getItem('access_expire');
      if (token && accessExpire) {
        const now = new Date();
        const expiry = new Date(accessExpire);
        if (now < expiry) {
          router.replace('/dashboard');
          return;
        }
      }
    }
    
    if (router.query && router.query.reff) {
      setFormData((prev) => ({ ...prev, referral_code: router.query.reff }));
      setReferralLocked(true);
    }

    const storedApplication = sessionStorage.getItem('application');
    if (storedApplication) {
      try {
        const parsed = JSON.parse(storedApplication);
        setApplicationData({
          name: parsed.name || 'Money Rich',
          company: parsed.company || 'Money Rich Holdings',
          healthy: parsed.healthy || false,
        });
      } catch (e) {
      setApplicationData({ name: 'Money Rich', company: 'Money Rich Holdings', healthy: false });
      }
    } else {
      setApplicationData({ name: 'Money Rich', company: 'Money Rich Holdings', healthy: false });
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
            setNotification({ message: 'Aplikasi sedang dalam pemeliharaan, Anda tidak dapat mendaftar. Silakan coba lagi nanti.', type: 'error' });
          }
          if (app.closed_register) {
            setClosedRegister(true);
            setNotification({ message: 'Pendaftaran sedang ditutup, Anda tidak dapat mendaftar. Silakan coba lagi nanti.', type: 'error' });
          }
        }
      } catch (err) {
        // ignore
      }
    })();
  }, [router]);

  useEffect(() => {
    setFormValidation({
      name: formData.name.trim().length >= 3,
      number: /^8[0-9]{8,11}$/.test(formData.number),
      password: formData.password.length >= 6,
      passwordMatch: formData.password === formData.password_confirmation && formData.password.length > 0,
      referralCode: formData.referral_code.trim().length > 0
    });
    setPasswordStrength(checkPasswordStrength(formData.password));
  }, [formData]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === 'name') {
      const sanitized = value.replace(/[^A-Za-z\s]/g, '');
      setFormData((prev) => ({ ...prev, [id]: sanitized }));
      return;
    }
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNumberChange = (e) => {
    let value = e.target.value.replace(/[^0-9+]/g, '');
    if (value.startsWith('+')) value = value.slice(1);
    if (value.startsWith('62') && value[2] === '8') {
      value = value.slice(2);
    }
    if (value.startsWith('0') && value[1] === '8') {
      value = value.slice(1);
    }
    value = value.replace(/[^0-9]/g, '');
    if (value.length > 12) value = value.slice(0, 12);
    setFormData((prev) => ({ ...prev, number: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (maintenanceMode) {
      setNotification({ message: 'Aplikasi sedang dalam pemeliharaan. Silakan coba lagi nanti.', type: 'error' });
      return;
    }
    if (closedRegister) {
      setNotification({ message: 'Pendaftaran sedang ditutup. Silakan coba lagi nanti.', type: 'error' });
      return;
    }
    
    if (formData.password !== formData.password_confirmation) {
      setNotification({ message: 'Password dan konfirmasi password tidak sama', type: 'error' });
      return;
    }
    
    setIsLoading(true);
    setNotification({ message: '', type: '' });
    
    try {
      const result = await registerUser(formData);
      
      if (result && result.success === true) {
        const successMessage = result.message || 'Registrasi berhasil! Selamat datang.';
        setNotification({ message: successMessage, type: 'success' });
        
        setFormData({ 
          name: '', 
          number: '', 
          password: '', 
          password_confirmation: '', 
          referral_code: referralLocked ? formData.referral_code : ''
        });

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('user-token-changed'));
        }
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
        
      } else if (result && result.success === false) {
        const errorMessage = result.message || 'Terjadi kesalahan. Silakan coba lagi.';
        setNotification({ message: errorMessage, type: 'error' });
      } else {
        setNotification({ message: 'Respon server tidak valid. Silakan coba lagi.', type: 'error' });
      }
      
    } catch (error) {
      console.error('Register error:', error);
      
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

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-amber-400';
    if (passwordStrength <= 4) return 'bg-brand-gold';
    return 'bg-brand-emerald';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Sangat Lemah';
    if (passwordStrength <= 2) return 'Lemah';
    if (passwordStrength <= 3) return 'Sedang';
    if (passwordStrength <= 4) return 'Kuat';
    return 'Sangat Kuat';
  };

  const isFormValid = Object.values(formValidation).every(Boolean) && termsAgreed;

  return (
    <>
      <Head>
        <title>{applicationData?.name || 'Money Rich'} | Register</title>
        <meta name="description" content={`${applicationData?.name || 'Money Rich'} registration`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-brand-black text-white relative overflow-hidden py-12">
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.18),rgba(5,6,8,0.95))]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(185,137,31,0.18),rgba(5,6,8,0))]"></div>

        <div className="relative z-10 w-full max-w-6xl px-6 py-12">
          <div className="flex flex-col items-center">

            {/* Main Content */}
            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-16 items-start">
              
              {/* Left Side - Info Highlights */}
              <div className="hidden lg:flex flex-col space-y-6">
                <div className="bg-brand-surface/80 border border-white/10 rounded-3xl p-6 shadow-[0_0_35px_rgba(232,193,82,0.12)]">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center text-brand-gold">
                      <Icon icon="mdi:rocket-launch" className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Mulai Perjalanan Anda</h3>
                      <p className="text-white/60 text-sm leading-relaxed">
                        Bergabunglah dengan ribuan investor yang telah mempercayakan strategi mereka pada ekosistem Money Rich.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-brand-surface/75 border border-white/10 rounded-3xl p-5 shadow-[0_0_35px_rgba(232,193,82,0.12)]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-gold/15 border border-brand-gold/25 flex items-center justify-center text-brand-gold">
                        <Icon icon="mdi:cash-multiple" className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-semibold text-white">Bonus Pendaftaran</h4>
                      </div>
                    <p className="text-xs text-white/55">
                      Raih welcome bonus eksklusif ketika menyelesaikan registrasi dan deposit pertama.
                    </p>
                    </div>
                  <div className="bg-brand-surface/75 border border-white/10 rounded-3xl p-5 shadow-[0_0_35px_rgba(232,193,82,0.12)]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-emerald/15 border border-brand-emerald/25 flex items-center justify-center text-brand-emerald">
                        <Icon icon="mdi:account-supervisor" className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-semibold text-white">Program Referral</h4>
                      </div>
                    <p className="text-xs text-white/55">
                      Ajak teman dan dapatkan komisi berlapis dari setiap investasi yang mereka lakukan.
                    </p>
                    </div>
                  <div className="bg-brand-surface/75 border border-white/10 rounded-3xl p-5 shadow-[0_0_35px_rgba(232,193,82,0.12)] sm:col-span-2">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-gold/15 border border-brand-gold/25 flex items-center justify-center text-brand-gold">
                        <Icon icon="mdi:shield-star" className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-semibold text-white">Akses Premium</h4>
                      </div>
                    <p className="text-xs text-white/55 leading-relaxed">
                      Dapatkan rekomendasi strategi, analitik real-time, dan dukungan concierge tanpa batas.
                    </p>
                  </div>
                </div>

                <div className="bg-brand-surface/80 border border-white/10 rounded-3xl p-5 shadow-[0_0_35px_rgba(232,193,82,0.12)]">
                  <div className="flex items-center justify-between text-sm text-white/60">
                    <div className="flex items-center gap-2">
                      <Icon icon="mdi:shield-check" className="w-5 h-5 text-brand-gold" />
                      <span>Terverifikasi</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon icon="mdi:lock-check" className="w-5 h-5 text-brand-emerald" />
                      <span>Aman</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon icon="mdi:certificate" className="w-5 h-5 text-brand-gold" />
                      <span>Terpercaya</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Register Form */}
              <div className="animate-fade-in-right">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-br from-brand-gold/30 via-transparent to-brand-gold/20 blur-3xl opacity-70"></div>
                  <div className="relative rounded-[26px] border border-white/10 bg-brand-surface/95 backdrop-blur-xl p-8 lg:p-10 shadow-brand-glow">
                  
                  {/* Logo + Form Header */}
                    <div className="text-center mb-8 space-y-2">
                      <div className="hidden lg:flex justify-center">
                    <div className="relative mb-6">
                          <div className="absolute -inset-2 bg-gradient-to-r from-[#E8C152]/30 to-[#4CD6C4]/30 blur-xl rounded-full"></div>
                      <div className="relative w-32 h-32 mx-auto">
                        <Image
                              src="/logo.svg"
                              alt="Money Rich Logo"
                              className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(232,193,82,0.6)]"
                          width={128}
                          height={128}
                          priority
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const fallback = e.target.nextSibling;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                            <div style={{ display: 'none' }} className="w-32 h-32 bg-gradient-to-br from-brand-gold to-brand-emerald rounded-3xl flex items-center justify-center shadow-2xl border-2 border-white/20">
                              <Icon icon="mdi:alpha-m-circle" className="text-white w-20 h-20" />
                            </div>
                        </div>
                      </div>
                    </div>
                    
                      <div className="lg:hidden flex flex-col items-center gap-3">
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-brand-surface border border-white/10 flex items-center justify-center shadow-brand-glow">
                          {!logoError ? (
                            <Image
                              src="/logo.svg"
                              alt="Money Rich Logo"
                              width={48}
                              height={48}
                              className="object-contain"
                              onError={() => setLogoError(true)}
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-brand-gold to-brand-gold-deep text-brand-black font-black text-xl">
                              MA
                            </div>
                          )}
                        </div>
                      </div>

                      <h2 className="text-3xl font-bold text-white">Buat Akun Money Rich</h2>
                      <p className="text-white/60 text-sm">Langkah pertama menuju investasi eksklusif</p>
                  </div>

                  {/* Notification */}
                  {notification.message && (
                    <div className={`mb-6 px-5 py-4 rounded-2xl text-sm font-medium flex items-start gap-3 animate-shake backdrop-blur-sm border ${
                      notification.type === 'success'
                        ? 'bg-green-500/20 text-green-300 border-green-400/30'
                        : 'bg-red-500/20 text-red-300 border-red-400/30'
                    }`}>
                      <Icon 
                        icon={notification.type === 'success' ? 'mdi:check-circle' : 'mdi:alert-circle'} 
                        className="w-5 h-5 flex-shrink-0 mt-0.5" 
                      />
                      <span className="flex-1">{notification.message}</span>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Name Field */}
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-[#D8CFB6] text-sm font-semibold flex items-center gap-2">
                        <Icon icon="mdi:account" className="w-4 h-4 text-[#E8C152]" />
                        Nama Lengkap
                      </label>
                      <div className="relative group">
                        <div className="brand-input">
                          <div className="flex items-center px-4 py-4 shrink-0">
                            <Icon icon="mdi:account-outline" className="text-[#D8CFB6]/50 w-5 h-5" />
                          </div>
                          <input
                            type="text"
                            id="name"
                            className="brand-input-field px-2 py-4 text-[#F7F3E5] placeholder-[#D8CFB6]/40 text-sm font-medium"
                            placeholder="Masukkan nama lengkap Anda"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            autoComplete="name"
                          />
                          <div className="flex items-center px-4 py-4 shrink-0">
                            {formValidation.name ? (
                              <Icon icon="mdi:check-circle" className="w-5 h-5 text-[#E8C152]" />
                            ) : (
                              <Icon icon="mdi:account-outline" className="w-5 h-5 text-[#D8CFB6]/20" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

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
                            {formValidation.number ? (
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
                        {/* Password Strength */}
                        {formData.password && (
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-600/30 rounded-full h-2 overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                ></div>
                              </div>
                              <span className={`text-xs font-medium ${getPasswordStrengthColor().replace('bg-', 'text-')}`}>
                                {getPasswordStrengthText()}
                              </span>
                            </div>
                            <div className="text-xs text-[#D8CFB6]/60 flex items-center gap-2">
                              <Icon 
                                icon={formData.password.length >= 6 ? "mdi:check" : "mdi:close"} 
                                className={`w-3 h-3 ${formData.password.length >= 6 ? 'text-[#E8C152]' : 'text-red-400'}`} 
                              />
                              <span>Minimal 6 karakter</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                      <label htmlFor="password_confirmation" className="block text-[#D8CFB6] text-sm font-semibold flex items-center gap-2">
                        <Icon icon="mdi:lock-check" className="w-4 h-4 text-[#E8C152]" />
                        Konfirmasi Password
                      </label>
                      <div className="relative group">
                        <div className="brand-input">
                          <div className="flex items-center px-4 py-4 shrink-0">
                            <Icon icon="mdi:lock-check-outline" className="text-[#D8CFB6]/50 w-5 h-5" />
                          </div>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="password_confirmation"
                            className="brand-input-field px-2 py-4 text-[#F7F3E5] placeholder-[#D8CFB6]/40 text-sm font-medium"
                            placeholder="Ulangi password Anda"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            required
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="flex items-center px-4 py-4 text-[#D8CFB6]/50 hover:text-[#F7F3E5] transition-colors shrink-0"
                          >
                            <Icon 
                              icon={showConfirmPassword ? "mdi:eye-off" : "mdi:eye"} 
                              className="w-5 h-5" 
                            />
                          </button>
                        </div>
                        {formData.password_confirmation && formData.password.length >= 6 && formData.password_confirmation !== formData.password && (
                          <div className="text-xs text-red-400 flex items-center gap-2 mt-2">
                            <Icon icon="mdi:close-circle" className="w-3 h-3" />
                            <span>Password tidak sama</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Referral Code Field */}
                    <div className="space-y-2">
                      <label htmlFor="referral_code" className="block text-[#D8CFB6] text-sm font-semibold flex items-center gap-2">
                        <Icon icon="mdi:gift-outline" className="w-4 h-4 text-[#E8C152]" />
                        Kode Referral
                      </label>
                      <div className="relative group">
                        <div className={`brand-input ${referralLocked ? 'opacity-75' : ''}`}>
                          <div className="flex items-center px-4 py-4 shrink-0">
                            <Icon icon="mdi:gift-outline" className="text-[#D8CFB6]/50 w-5 h-5" />
                          </div>
                          <input
                            type="text"
                            id="referral_code"
                            className={`brand-input-field px-2 py-4 text-[#F7F3E5] placeholder-[#D8CFB6]/40 text-sm font-medium ${referralLocked ? 'cursor-not-allowed' : ''}`}
                            placeholder="Masukkan kode referral"
                            value={formData.referral_code}
                            onChange={handleChange}
                            disabled={referralLocked}
                            required
                          />
                          <div className="flex items-center px-4 py-4 shrink-0">
                            {referralLocked ? (
                              <Icon icon="mdi:lock" className="w-5 h-5 text-yellow-400" />
                            ) : formData.referral_code ? (
                              <Icon icon="mdi:gift" className="w-5 h-5 text-[#E8C152]" />
                            ) : (
                              <Icon icon="mdi:gift-outline" className="w-5 h-5 text-[#D8CFB6]/20" />
                            )}
                          </div>
                        </div>
                        {referralLocked && (
                          <div className="text-xs text-[#E8C152] flex items-center gap-1 mt-2">
                            <Icon icon="mdi:information" className="w-4 h-4" />
                            Kode referral dari link undangan, tidak dapat diubah
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Terms Agreement Checkbox */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-4">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={termsAgreed}
                          onChange={(e) => setTermsAgreed(e.target.checked)}
                          className="w-5 h-5 rounded border-2 border-white/30 bg-transparent checked:bg-[#E8C152] checked:border-[#E8C152] focus:ring-2 focus:ring-[#E8C152]/50 focus:ring-offset-0 cursor-pointer mt-0.5 flex-shrink-0"
                        />
                        <span className="text-xs text-[#D8CFB6]/70">
                          Saya telah membaca dan menyetujui{' '}
                          <Link
                            href="/privacy-policy"
                            passHref
                            legacyBehavior
                          >
                            <a className="text-[#E8C152] hover:text-[#B9891F] font-semibold cursor-pointer underline">
                              Kebijakan Privasi
                            </a>
                          </Link>
                          {' '}dan{' '}
                          <Link
                            href="/terms-and-conditions"
                            passHref
                            legacyBehavior
                          >
                            <a className="text-[#E8C152] hover:text-[#B9891F] font-semibold cursor-pointer underline">
                              Syarat & Ketentuan
                            </a>
                          </Link>
                          .
                        </span>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className={`w-full font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg border relative overflow-hidden mt-8 ${
                        (!maintenanceMode && !closedRegister && isFormValid)
                          ? 'bg-gradient-to-r from-[#E8C152] to-[#B9891F] hover:from-[#f0d470] hover:to-[#e0b94a] text-white border-[#E8C152]/30 hover:shadow-[0_0_40px_rgba(232,193,82,0.5)] hover:scale-[1.02] active:scale-[0.98]'
                          : 'bg-gray-600/20 text-gray-500 cursor-not-allowed border-gray-600/10'
                      }`}
                      disabled={isLoading || !isFormValid || maintenanceMode || closedRegister}
                    >
                      {isLoading ? (
                        <>
                          <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                          <span>Sedang Mendaftar...</span>
                        </>
                      ) : (
                        <>
                          <Icon icon="mdi:account-plus" className="w-5 h-5" />
                          <span>Daftar Sekarang</span>
                          <Icon icon="mdi:arrow-right" className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    {/* Form Validation Summary */}
                    {!isFormValid && (
                      <div className="bg-orange-500/10 border border-orange-400/30 rounded-xl p-4 text-sm">
                        <div className="flex items-center gap-2 text-orange-300 mb-2">
                          <Icon icon="mdi:alert-circle" className="w-4 h-4" />
                          <span className="font-semibold">Lengkapi formulir:</span>
                        </div>
                        <div className="space-y-1 text-orange-200 text-xs">
                          {!formValidation.name && (
                            <div className="flex items-center gap-2">
                              <Icon icon="mdi:circle-small" className="w-3 h-3" />
                              <span>Nama minimal 3 karakter</span>
                            </div>
                          )}
                          {!formValidation.number && (
                            <div className="flex items-center gap-2">
                              <Icon icon="mdi:circle-small" className="w-3 h-3" />
                              <span>Nomor HP 9-12 digit, awalan 8</span>
                            </div>
                          )}
                          {!formValidation.password && (
                            <div className="flex items-center gap-2">
                              <Icon icon="mdi:circle-small" className="w-3 h-3" />
                              <span>Password minimal 6 karakter</span>
                            </div>
                          )}
                          {!formValidation.passwordMatch && formData.password_confirmation && formData.password.length >= 6 && (
                            <div className="flex items-center gap-2">
                              <Icon icon="mdi:circle-small" className="w-3 h-3" />
                              <span>Password tidak sama</span>
                            </div>
                          )}
                          {!formValidation.referralCode && (
                            <div className="flex items-center gap-2">
                              <Icon icon="mdi:circle-small" className="w-3 h-3" />
                              <span>Kode referral wajib diisi</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </form>

                  {/* Divider */}
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

                  {/* Login Link */}
                  <div className="text-center space-y-3">
                    <p className="text-sm text-white/55">Sudah punya akun?</p>
                    <Link href="/login" passHref legacyBehavior>
                    <a className="inline-flex items-center gap-2 rounded-xl border border-brand-gold/30 bg-brand-gold/10 px-6 py-3 font-semibold text-brand-gold hover:bg-brand-gold hover:text-brand-black transition-colors duration-200 cursor-pointer border border-white/10 hover:border-[#F45D16]/30">
                        <Icon icon="mdi:login" className="w-5 h-5" />
                        Login Sekarang
                        <Icon icon="mdi:arrow-right" className="w-4 h-4" />
                      </a>
                    </Link>
                  </div>

                </div>
              </div>

            </div>

            {/* Bottom Copyright */}
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
        </div>

        {/* eslint-disable react/no-unknown-property */}
        <style jsx global>{`
          .brand-input {
            display: flex;
            align-items: center;
            background: rgba(17, 19, 26, 0.92);
            border: 1.5px solid rgba(255, 255, 255, 0.08);
            border-radius: 0.9rem;
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
      </div>
    </>
  );
}

