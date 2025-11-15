import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getTeamInvited } from '../utils/api';
import { Icon } from '@iconify/react';
import BottomNavbar from '../components/BottomNavbar';
import Copyright from '../components/copyright';

export default function Komisi() {
  const router = useRouter();
  const [applicationData, setApplicationData] = useState(null);
  const [copied, setCopied] = useState({ code: false, link: false });
  const [reffCode, setReffCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [teamStats, setTeamStats] = useState({
    1: { active: 0, count: 0, total_invest: 0 },
    2: { active: 0, count: 0, total_invest: 0 },
    3: { active: 0, count: 0, total_invest: 0 },
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    const accessExpire = sessionStorage.getItem('access_expire');
    if (!token || !accessExpire) {
      router.push('/login');
      return;
    }
    
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
        if (user?.reff_code) {
            setReffCode(user.reff_code);
          }
        }
    } catch (e) {
      // ignore
    }
    
    getTeamInvited()
      .then((res) => {
        if (res?.data) setTeamStats(res.data);
      })
      .catch(() => {});
      
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

  useEffect(() => {
    if (reffCode && typeof window !== 'undefined') {
      setReferralLink(`${window.location.origin}/register?reff=${reffCode}`);
    } else {
      setReferralLink('');
    }
  }, [reffCode]);

  const copyToClipboard = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied((prev) => ({ ...prev, [type]: true }));
    setTimeout(() => setCopied((prev) => ({ ...prev, [type]: false })), 2000);
  };

  const handleShareLink = async () => {
    if (!referralLink) return;

    const appName = applicationData?.name || 'Money Rich';
    // Format teks dengan URL di tengah untuk memastikan teks lengkap terkirim
    // Beberapa platform mengekstrak URL, jadi kita pastikan teks sebelum dan sesudah URL juga terkirim
    const shareText = `Bergabung bersama saya di ${appName}, sebuah platform investasi yang memberikan komisi eksklusif dengan minimal investasi Rp.10.000. 

Gunakan link undangan saya:
${referralLink}

Dapatkan komisi eksklusif dan manfaat lainnya, silahkan klik link undangan saya untuk bergabung.`;

    // Cek apakah Web Share API tersedia (mobile)
    if (navigator.share) {
      try {
        // Gunakan hanya text field, karena beberapa platform (WhatsApp) 
        // akan mengekstrak URL dari text dan menampilkan preview
        // Tapi dengan hanya menggunakan text, teks lengkap akan terkirim
        await navigator.share({
          text: shareText,
        });
        // Share berhasil
        setCopied((prev) => ({ ...prev, link: true }));
        setTimeout(() => setCopied((prev) => ({ ...prev, link: false })), 2000);
      } catch (error) {
        // User membatalkan share - tidak perlu melakukan apa-apa
        if (error.name !== 'AbortError') {
          // Untuk error lain, fallback ke copy clipboard
          copyToClipboard(shareText, 'link');
        }
      }
    } else {
      // Fallback: copy ke clipboard untuk desktop
      copyToClipboard(shareText, 'link');
    }
  };

  const scrollToCommissionStructure = () => {
    const element = document.getElementById('struktur-komisi');
    if (element) {
      // Hitung posisi scroll dengan offset untuk spacing
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 100; // 100px offset dari atas
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };


  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount || 0);

  const totalReferrals = teamStats[1]?.count + teamStats[2]?.count + teamStats[3]?.count || 0;
  const totalActive = teamStats[1]?.active + teamStats[2]?.active + teamStats[3]?.active || 0;
  const totalInvest = teamStats[1]?.total_invest + teamStats[2]?.total_invest + teamStats[3]?.total_invest || 0;
  const companyName = applicationData?.company || 'Money Rich Holdings';

  const commissionLevels = [
    {
      levelKey: '1',
      title: 'Level 1 Direct',
      description: 'Referral pribadi yang memperkuat jaringan Anda.',
      icon: 'mdi:numeric-1-circle',
      badge: '3%'
    },
    {
      levelKey: '2',
      title: 'Level 2 Partner',
      description: 'Tim inti yang yang mendukung Anda dalam berkembang bersama.',
      icon: 'mdi:numeric-2-circle',
      badge: '3%'
    },
    {
      levelKey: '3',
      title: 'Level 3 Network',
      description: 'Ekspansi jaringan untuk pendapatan berkelanjutan.',
      icon: 'mdi:numeric-3-circle',
      badge: '3%'
    }
  ];

  return (
    <div className="min-h-screen bg-brand-black text-white relative overflow-hidden pb-32">
      <Head>
        <title>{applicationData?.name || 'Money Rich'} | Referral</title>
        <meta name="description" content={`${applicationData?.name || 'Money Rich'} Referral`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.18),rgba(5,6,8,0.95))]"></div>
        <div className="absolute -top-40 -left-32 w-[420px] h-[420px] rounded-full bg-brand-gold/20 blur-[180px] opacity-70"></div>
        <div className="absolute bottom-20 right-[-140px] w-[520px] h-[520px] rounded-full bg-brand-gold-deep/15 blur-[220px] opacity-80"></div>
        <div className="absolute bottom-[-120px] left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full bg-brand-emerald/12 blur-[200px] opacity-70"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-12 pb-24 space-y-12">
        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface/95 backdrop-blur-xl p-8 sm:p-10 shadow-[0_35px_80px_rgba(5,6,8,0.65)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.22),transparent)]"></div>
            <div className="relative z-10 flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <span className="inline-flex items-center gap-2 w-fit rounded-full border border-brand-gold/30 bg-brand-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-brand-gold">
                  <Icon icon="mdi:rocket-launch" className="w-4 h-4" />
                  Referral Program
                </span>
                <h1 className="text-3xl sm:text-4xl font-black leading-tight">
                  Bangun jaringan <span className="text-brand-gold">Money Rich</span> dan raih komisi eksklusif.
                </h1>
                <p className="text-sm sm:text-base text-white/65 max-w-3xl">
                  Undang investor baru, bantu mereka berkembang, dan nikmati pembagian komisi bertingkat yang dirancang untuk pertumbuhan berkelanjutan. Semua terintegrasi langsung dengan saldo balance Anda.
                </p>
            </div>
            
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative overflow-hidden rounded-2xl border border-brand-gold/25 bg-brand-gold/10 p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-brand-gold/80">
                    Total Tim
                    <Icon icon="mdi:account-group" className="w-4 h-4 text-brand-gold" />
                  </div>
                  <p className="text-3xl font-bold text-white">{totalReferrals}</p>
                  <p className="text-[11px] text-white/55">Member yang terhubung langsung dengan Anda.</p>
                </div>
                <div className="relative overflow-hidden rounded-2xl border border-brand-emerald/30 bg-brand-emerald/10 p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-brand-emerald/80">
                    Aktif
                    <Icon icon="mdi:lightning-bolt" className="w-4 h-4 text-brand-emerald" />
                  </div>
                  <p className="text-3xl font-bold text-white">{totalActive}</p>
                  <p className="text-[11px] text-white/55">Investor yang sudah melakukan aktivitas dan menghasilkan komisi.</p>
                </div>
                <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/60">
                    Total Investasi
                    <Icon icon="mdi:cash-multiple" className="w-4 h-4 text-brand-gold" />
                </div>
                  <p className="text-3xl font-bold text-white">{formatCurrency(totalInvest)}</p>
                  <p className="text-[11px] text-white/55">Performa jaringan Anda dalam rupiah.</p>
          </div>
        </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                    <Icon icon="mdi:shield-check" className="w-5 h-5 text-brand-gold" />
                    Kenapa Money Rich?
                  </div>
                  <ul className="space-y-2 text-sm text-white/60">
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-gold mt-2"></span>
                      Komisi otomatis masuk ke saldo income Anda, siap dicairkan.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-gold mt-2"></span>
                      Transparansi penuh melalui dashboard jaringan real-time.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-gold mt-2"></span>
                      Materi promosi siap pakai dan dukungan concierge eksklusif.
                    </li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-white flex items-center gap-2">
                      <Icon icon="mdi:gesture-tap" className="w-5 h-5 text-brand-gold" />
                      Aksi Cepat
              </div>
                    <p className="text-sm text-white/60">
                      Bagikan kode Anda ke WhatsApp, Telegram, atau media sosial. Komisi dihitung otomatis setiap ada aktivitas dari jaringan Anda.
                    </p>
                </div>
                  <div className="flex flex-wrap gap-3 pt-3">
                    <button
                      onClick={handleShareLink}
                      className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-gold to-brand-gold-deep text-brand-black font-semibold py-3 shadow-brand-glow transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      <Icon icon="mdi:share-variant" className="w-5 h-5" />
                      {copied.link ? 'Disalin!' : 'Bagikan Link'}
                    </button>
                    <button
                      onClick={scrollToCommissionStructure}
                      className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 text-white/80 hover:text-white py-3 transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      <Icon icon="mdi:chart-line" className="w-5 h-5" />
                      Lihat Tim
                    </button>
              </div>
              </div>
            </div>
          </div>
        </div>

          <div className="relative overflow-hidden rounded-3xl border border-brand-gold/40 bg-brand-surface-soft/95 backdrop-blur-xl p-8 sm:p-9 shadow-brand-glow">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,193,82,0.2),transparent)]"></div>
            <div className="absolute -top-24 -right-16 w-56 h-56 rounded-full bg-brand-gold/25 blur-[140px] opacity-70"></div>
            <div className="relative z-10 flex flex-col gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-brand-gold/80">
                  <Icon icon="mdi:key-variant" className="w-4 h-4" />
                  Referral Credential
                </div>
                <h2 className="text-2xl font-bold text-white">Kode & Link Eksklusif</h2>
                <p className="text-sm text-white/60">
                  Gunakan kode atau link di bawah ini. Setiap pendaftaran yang sukses otomatis terhubung ke akun Anda.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-brand-surface p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Kode Referral</span>
              <button
                    onClick={() => reffCode && copyToClipboard(reffCode, 'code')}
                    className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                  copied.code 
                        ? 'bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/40'
                        : 'bg-white/5 text-white/70 border border-white/10 hover:text-white'
                }`}
              >
                    <Icon icon={copied.code ? 'mdi:check' : 'mdi:content-copy'} className="w-4 h-4" />
                    {copied.code ? 'Disalin' : 'Salin'}
              </button>
            </div>
                <div className="rounded-xl border border-white/10 bg-brand-black/40 px-4 py-4 text-center font-mono text-xl tracking-[0.4em] text-white">
                {reffCode || '---'}
            </div>
          </div>

              <div className="rounded-2xl border border-white/10 bg-brand-surface p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Link Referral</span>
              <button
                    onClick={() => referralLink && copyToClipboard(referralLink, 'link')}
                    className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                  copied.link 
                        ? 'bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/40'
                        : 'bg-white/5 text-white/70 border border-white/10 hover:text-white'
                }`}
              >
                    <Icon icon={copied.link ? 'mdi:check' : 'mdi:content-copy'} className="w-4 h-4" />
                    {copied.link ? 'Disalin' : 'Salin'}
              </button>
            </div>
                <div className="rounded-xl border border-white/10 bg-brand-black/40 px-4 py-3 text-sm text-white/70 break-all">
                  {referralLink || 'Link akan muncul setelah kode aktif.'}
          </div>
        </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/65 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Icon icon="mdi:lightbulb-on" className="w-5 h-5 text-brand-gold" />
                  Tips promosi cepat
                </div>
                <ul className="space-y-1.5 pl-4 list-disc marker:text-brand-gold/70">
                  <li>Sertakan testimoni atau bukti dashboard ketika membagikan link.</li>
                  <li>Gunakan grup komunitas untuk edukasi produk Money Rich.</li>
                  <li>Follow up calon investor 1x24 jam setelah membagikan link.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="struktur-komisi" className="space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:crown" className="w-6 h-6 text-brand-gold" />
              <h2 className="text-xl font-semibold text-white">Struktur Komisi</h2>
            </div>
            <p className="text-sm text-white/55 max-w-3xl">
              Pantau performa setiap level dan arahkan tim Anda langsung dari halaman ini. Data diperbarui secara real-time dari dashboard Money Rich.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {commissionLevels.map((tier) => {
              const stats = teamStats[tier.levelKey] || {};
                return (
                  <div
                  key={tier.levelKey}
                  className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface-soft/90 backdrop-blur-xl p-6 flex flex-col gap-5 shadow-[0_20px_60px_rgba(5,6,8,0.55)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br opacity-60 blur-2xl pointer-events-none" />
                  <div className="relative z-10 flex items-start justify-between gap-3">
                          <div>
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/70">
                        <Icon icon={tier.icon} className="w-4 h-4" />
                        Level {tier.levelKey}
                      </span>
                      <h3 className="text-white font-semibold text-lg mt-3">{tier.title}</h3>
                      <p className="text-sm text-white/60 mt-1">{tier.description}</p>
                          </div>
                    <span className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/70">
                      <Icon icon="mdi:star-circle" className="w-4 h-4 text-brand-gold" />
                      {tier.badge}
                    </span>
                    </div>

                  <div className="relative z-10 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-[10px] uppercase tracking-wide text-white/45">Tim</p>
                      <p className="text-lg font-semibold text-white mt-1">{stats.count || 0}</p>
                        </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-[10px] uppercase tracking-wide text-white/45">Aktif</p>
                      <p className="text-lg font-semibold text-brand-emerald mt-1">{stats.active || 0}</p>
                      </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-[10px] uppercase tracking-wide text-white/45">Invest</p>
                      <p className="text-lg font-semibold text-brand-gold mt-1">{formatCurrency(stats.total_invest || 0)}</p>
                        </div>
                      </div>

                      <button
                    onClick={() => router.push(`/referral/my-team?level=${tier.levelKey}`)}
                    className="relative z-10 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-gold to-brand-gold-deep text-brand-black font-semibold py-3 px-4 text-sm shadow-brand-glow transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    <Icon icon="mdi:account-search" className="w-4 h-4" />
                    Kelola Tim Level {tier.levelKey}
                      </button>
                  </div>
                );
              })}
            </div>
        </section>


        <Copyright />
      </div>

      {/* Bottom Navigation - Floating */}
          <BottomNavbar />
    </div>
  );
}
