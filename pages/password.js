// pages/ganti-sandi.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { changePassword } from '../utils/api';
import BottomNavbar from '../components/BottomNavbar';
import Copyright from '../components/copyright';

export default function GantiSandi() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState({
    current_password: false,
    new_password: false,
    confirm_password: false
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [applicationData, setApplicationData] = useState(null);

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (!formData.current_password) {
      setErrorMsg("Kata sandi saat ini wajib diisi.");
      setLoading(false);
      return;
    }
    if (!formData.new_password) {
      setErrorMsg("Kata sandi baru wajib diisi.");
      setLoading(false);
      return;
    }
    if (!formData.confirm_password) {
      setErrorMsg("Konfirmasi kata sandi wajib diisi.");
      setLoading(false);
      return;
    }
    if (formData.new_password.length < 6) {
      setErrorMsg("Kata sandi baru minimal 6 karakter.");
      setLoading(false);
      return;
    }
    if (formData.new_password !== formData.confirm_password) {
      setErrorMsg("Kata sandi baru dan konfirmasi tidak cocok.");
      setLoading(false);
      return;
    }

    try {
      const res = await changePassword({
        current_password: formData.current_password,
        password: formData.new_password,
        confirmation_password: formData.confirm_password
      });
      setSuccessMsg(res.message || "Kata sandi berhasil diperbarui!");
      setErrorMsg('');
      setLoading(false);
      setTimeout(() => {
        setSuccessMsg('');
        router.push('/profile');
      }, 2000);
    } catch (error) {
      setErrorMsg(error.message || "Terjadi kesalahan. Silakan coba lagi.");
      setSuccessMsg('');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    const accessExpire = sessionStorage.getItem('access_expire');
    if (!token || !accessExpire) {
      router.push('/login');
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
  }, [router]);

  return (
    <div className="min-h-screen bg-brand-black text-white relative overflow-hidden pb-32">
      <Head>
        <title>{applicationData?.name || 'Money Rich'} | Ganti Kata Sandi</title>
        <meta name="description" content={`${applicationData?.name || 'Money Rich'} Change Password`} />
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

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-8 pb-24">
        {/* Hero Header Section */}
        <div className="mb-10 flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-brand-gold w-fit">
            <Icon icon="mdi:lock-reset" className="w-4 h-4" />
            Change Password
            </div>
            <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Ganti Kata Sandi
            </h1>
            <p className="text-sm text-white/60 max-w-2xl mt-2">
              Perbarui kata sandi Anda untuk menjaga keamanan akun. Gunakan kombinasi huruf, angka, dan karakter khusus.
            </p>
        </div>
      </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Form Section */}
          <section className="relative">
            <div className="absolute -inset-1 rounded-[30px] bg-gradient-to-br from-brand-gold/35 via-transparent to-brand-emerald/25 blur-3xl opacity-70"></div>
            <div className="relative rounded-[28px] border border-white/10 bg-brand-surface/95 backdrop-blur-xl p-6 sm:p-8 shadow-brand-glow">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-white/45">
                      Formulir Password
                    </p>
                    <h2 className="text-2xl font-semibold text-white mt-1">
                      Data Keamanan
                    </h2>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-brand-gold/15 border border-brand-gold/30 text-brand-gold flex items-center justify-center shadow-brand-glow">
                    <Icon icon="mdi:shield-lock" className="w-6 h-6" />
          </div>
        </div>

          {errorMsg && (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm font-semibold flex items-start gap-3">
                <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-red-200">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
                  <div className="rounded-2xl border border-brand-emerald/30 bg-brand-emerald/10 px-5 py-4 text-sm font-semibold flex items-start gap-3">
                    <Icon icon="mdi:check-circle" className="w-5 h-5 text-brand-emerald flex-shrink-0 mt-0.5" />
                    <span className="text-brand-emerald">{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
                    <label className="block text-sm font-semibold text-white/80 mb-3">
                Kata Sandi Saat Ini
              </label>
              <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/20 to-brand-emerald/20 rounded-2xl blur-sm opacity-50 group-focus-within:opacity-70 transition-opacity"></div>
                      <div className="relative flex items-center bg-brand-black/40 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 focus-within:border-brand-gold focus-within:shadow-[0_0_20px_rgba(232,193,82,0.2)]">
                <input
                  type={showPassword.current_password ? "text" : "password"}
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleInputChange}
                  placeholder="•••••••"
                          className="flex-1 bg-transparent outline-none py-4 px-4 text-white placeholder-white/40 font-medium"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current_password')}
                  className="px-4 text-white/60 hover:text-white transition-colors"
                >
                  <Icon 
                    icon={showPassword.current_password ? "mdi:eye-off-outline" : "mdi:eye-outline"} 
                    className="w-5 h-5" 
                  />
                </button>
                </div>
              </div>
            </div>

            {/* New Password */}
            <div>
                    <label className="block text-sm font-semibold text-white/80 mb-3">
                Kata Sandi Baru
              </label>
              <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/20 to-brand-emerald/20 rounded-2xl blur-sm opacity-50 group-focus-within:opacity-70 transition-opacity"></div>
                      <div className="relative flex items-center bg-brand-black/40 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 focus-within:border-brand-gold focus-within:shadow-[0_0_20px_rgba(232,193,82,0.2)]">
                <input
                  type={showPassword.new_password ? "text" : "password"}
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                          className="flex-1 bg-transparent outline-none py-4 px-4 text-white placeholder-white/40 font-medium"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new_password')}
                  className="px-4 text-white/60 hover:text-white transition-colors"
                >
                  <Icon 
                    icon={showPassword.new_password ? "mdi:eye-off-outline" : "mdi:eye-outline"} 
                    className="w-5 h-5" 
                  />
                </button>
                </div>
                      <p className="text-xs text-white/50 mt-2">Minimal 6 karakter</p>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
                    <label className="block text-sm font-semibold text-white/80 mb-3">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/20 to-brand-emerald/20 rounded-2xl blur-sm opacity-50 group-focus-within:opacity-70 transition-opacity"></div>
                      <div className="relative flex items-center bg-brand-black/40 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 focus-within:border-brand-gold focus-within:shadow-[0_0_20px_rgba(232,193,82,0.2)]">
                <input
                  type={showPassword.confirm_password ? "text" : "password"}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                          className="flex-1 bg-transparent outline-none py-4 px-4 text-white placeholder-white/40 font-medium"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm_password')}
                  className="px-4 text-white/60 hover:text-white transition-colors"
                >
                  <Icon 
                    icon={showPassword.confirm_password ? "mdi:eye-off-outline" : "mdi:eye-outline"} 
                    className="w-5 h-5" 
                  />
                </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
                    className="w-full bg-gradient-to-r from-brand-gold to-brand-gold-deep hover:from-brand-gold-deep hover:to-brand-gold disabled:opacity-50 disabled:cursor-not-allowed text-brand-black font-bold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-brand-gold/30 hover:shadow-brand-gold/50 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
            >
              {loading ? (
                <>
                        <div className="w-5 h-5 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin"></div>
                  Memperbarui...
                </>
              ) : (
                <>
                  <Icon icon="mdi:check-circle" className="w-5 h-5" />
                        Perbarui Kata Sandi
                </>
              )}
            </button>
          </form>
              </div>
            </div>
          </section>

          {/* Info Section */}
          <section className="space-y-6">
            {/* Security Tips Card */}
            <div className="rounded-3xl border border-white/10 bg-brand-surface-soft/90 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Icon icon="mdi:shield-lock" className="w-5 h-5 text-brand-gold" />
                <h3 className="text-lg font-semibold text-white">Tips Keamanan</h3>
              </div>
              <div className="space-y-3 text-sm text-white/70">
                <div className="flex items-start gap-3">
                  <Icon icon="mdi:check-circle" className="text-brand-emerald mt-1 flex-shrink-0" />
                  <p>Minimal 6 karakter dengan kombinasi huruf besar, kecil, dan angka.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Icon icon="mdi:calendar-refresh" className="text-brand-gold mt-1 flex-shrink-0" />
                  <p>Perbarui sandi setiap 3 bulan untuk keamanan maksimal.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Icon icon="mdi:key-variant" className="text-brand-emerald mt-1 flex-shrink-0" />
                  <p>Jangan gunakan sandi yang sama untuk banyak akun.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Icon icon="mdi:help-circle" className="text-brand-gold mt-1 flex-shrink-0" />
                  <p>Hubungi dukungan jika lupa sandi saat ini.</p>
                </div>
          </div>
        </div>

            {/* Security Info Card */}
            <div className="rounded-3xl border border-brand-emerald/25 bg-brand-emerald/10 p-6 space-y-3">
              <div className="flex items-center gap-2 text-brand-emerald">
                <Icon icon="mdi:security" className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Keamanan Data</h3>
              </div>
              <div className="space-y-2 text-sm text-white/70">
                <p>• Data kata sandi dienkripsi dengan teknologi terbaru</p>
                <p>• Tidak ada yang dapat melihat kata sandi Anda, termasuk admin</p>
                <p>• Sistem keamanan multi-layer untuk perlindungan maksimal</p>
        </div>
      </div>

            {/* Help Card */}
            {applicationData?.link_cs && (
              <div className="rounded-3xl border border-brand-gold/25 bg-brand-gold/10 p-6 space-y-3">
                <div className="flex items-center gap-2 text-brand-gold">
                  <Icon icon="mdi:help-circle" className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Butuh Bantuan?</h3>
                </div>
                <p className="text-sm text-white/70">
                  Jika Anda mengalami kendala atau lupa kata sandi, hubungi tim support Money Rich.
                </p>
                <button
                  onClick={() => window.open(applicationData.link_cs, '_blank')}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-brand-gold/40 bg-brand-gold/20 px-4 py-3 text-sm font-semibold text-brand-gold transition-colors hover:bg-brand-gold/30"
                >
                  <Icon icon="mdi:chat-processing" className="w-4 h-4" />
                  Hubungi Support
                </button>
              </div>
            )}
          </section>
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
