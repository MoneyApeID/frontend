// pages/about.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import BottomNavbar from '../components/BottomNavbar';
import Image from 'next/image';
import Copyright from '../components/copyright';

export default function About() {
  const router = useRouter();
  const [applicationData, setApplicationData] = useState(null);

  useEffect(() => {
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
  }, []);

  return (
    <div className="min-h-screen bg-brand-black text-white relative overflow-hidden pb-32">
      <Head>
        <title>{applicationData?.name || 'Money Rich'} | Tentang Kami</title>
        <meta name="description" content={`Tentang ${applicationData?.name || 'Money Rich'}`} />
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
            <Icon icon="mdi:information-outline" className="w-4 h-4" />
            About Us
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">
                Tentang Kami
              </h1>
              <p className="text-sm text-white/60 max-w-2xl mt-2">
                Platform investasi modern yang menghadirkan akses investasi premium dengan transparansi penuh.
              </p>
            </div>
          </div>
        </div>

        {/* Logo Section */}
        <div className="relative mb-10">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-gold/30 via-brand-emerald/20 to-brand-gold/30 rounded-3xl blur-xl opacity-50"></div>
          <div className="relative bg-gradient-to-br from-brand-surface via-brand-surface-soft to-brand-charcoal rounded-3xl p-8 border border-white/10 text-center shadow-[0_20px_60px_rgba(5,6,8,0.65)]">
            <div className="w-48 h-auto relative mx-auto mb-4">
              <Image 
                src="/logo.svg" 
                alt="Money Rich Logo" 
                width={192} 
                height={60}
                className="drop-shadow-[0_0_20px_rgba(232,193,82,0.4)]"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">{applicationData?.name || 'Money Rich'}</h2>
            <p className="text-white/60 text-sm">Platform Investasi Modern & Eksklusif</p>
            <p className="text-brand-gold text-sm font-semibold mt-2">{applicationData?.company || 'Money Rich Holdings'}</p>
          </div>
        </div>

        {/* About Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Latar Belakang */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface-soft/90 p-6 shadow-[0_20px_60px_rgba(5,6,8,0.6)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,193,82,0.1),transparent)]"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center">
                  <Icon icon="mdi:earth" className="w-6 h-6 text-brand-gold" />
                </div>
                <h3 className="text-xl font-black text-white">Latar Belakang</h3>
              </div>
              <p className="text-sm text-white/70 leading-relaxed mb-3">
                {applicationData?.name || 'Money Rich'} adalah platform investasi yang berpusat di Singapura, didirikan oleh {applicationData?.company || 'Money Rich Holdings'} dengan visi menciptakan akses investasi premium yang transparan.
              </p>
              <p className="text-sm text-white/70 leading-relaxed">
                Platform ini lahir untuk menghapus hambatan tradisional dalam kepemilikan properti, sehingga investor global dapat berpartisipasi dengan modal yang lebih terjangkau namun tetap mendapatkan potensi keuntungan yang signifikan.
              </p>
            </div>
          </div>

          {/* Tujuan Pendirian */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface-soft/90 p-6 shadow-[0_20px_60px_rgba(5,6,8,0.6)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.1),transparent)]"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-emerald/15 border border-brand-emerald/30 flex items-center justify-center">
                  <Icon icon="mdi:target" className="w-6 h-6 text-brand-emerald" />
                </div>
                <h3 className="text-xl font-black text-white">Tujuan Pendirian</h3>
              </div>
              <ul className="space-y-3">
                {[
                  { title: "Memperluas Akses Investasi", text: "Memberikan kesempatan bagi investor di Indonesia untuk memiliki bagian dari properti strategis." },
                  { title: "Meningkatkan Likuiditas", text: "Proses investasi yang cepat dan fleksibel, memungkinkan keluar-masuk investasi dengan mudah." },
                  { title: "Transparansi & Efisiensi", text: "Laporan kinerja berkala untuk memantau perkembangan aset secara jelas." },
                  { title: "Keamanan & Kepatuhan", text: "Mematuhi regulasi investasi internasional dan menerapkan sistem keamanan yang ketat." }
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 flex-shrink-0 rounded-full bg-gradient-to-br from-brand-gold/20 to-brand-emerald/20 flex items-center justify-center border border-white/10 mt-0.5">
                      <Icon icon="mdi:check" className="text-brand-gold w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-white text-sm block mb-1">{item.title}</span>
                      <p className="text-white/70 text-xs leading-relaxed">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Nilai Utama */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-surface-soft/90 p-6 shadow-[0_20px_60px_rgba(5,6,8,0.6)] mb-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,193,82,0.08),transparent)]"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center">
                <Icon icon="mdi:diamond-stone" className="w-6 h-6 text-brand-gold" />
              </div>
              <h3 className="text-xl font-black text-white">Nilai Utama</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: "mdi:earth", title: "Akses Global", text: "Terbuka untuk investor dari berbagai negara." },
                { icon: "mdi:office-building", title: "Kualitas Aset Premium", text: "Fokus pada properti bernilai tinggi dengan prospek pertumbuhan." },
                { icon: "mdi:chart-bar", title: "Manajemen Profesional", text: "Dikelola oleh tim berpengalaman di bidang investasi digital dan keuangan." },
                { icon: "mdi:handshake", title: "Inklusif", text: "Membuka peluang investasi bagi siapa saja, tanpa batasan latar belakang." }
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-brand-black/40 rounded-2xl border border-white/10 hover:border-brand-gold/30 transition-all duration-300">
                  <Icon icon={item.icon} className="text-brand-emerald w-6 h-6 flex-shrink-0 mt-1" />
                  <div>
                    <span className="font-semibold text-white text-sm block mb-1">{item.title}</span>
                    <p className="text-white/60 text-xs">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kesimpulan */}
        <div className="relative overflow-hidden rounded-3xl border border-brand-emerald/25 bg-brand-emerald/10 p-6 shadow-[0_20px_60px_rgba(5,6,8,0.6)] mb-8">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Icon icon="mdi:lightbulb-on-outline" className="w-6 h-6 text-brand-gold" />
              <h3 className="text-xl font-black text-white">Kesimpulan</h3>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              {applicationData?.name || 'Money Rich'} hadir untuk menjadi penghubung antara peluang investasi kelas atas dan investor global. Dengan pengelolaan yang profesional, transparansi penuh, serta komitmen pada keamanan, kami menciptakan peluang investasi yang aman, menguntungkan, dan dapat diakses oleh semua orang.
            </p>
          </div>
        </div>
      </div>

      <Copyright />

      {/* Bottom Navigation - Floating */}
      <BottomNavbar />
    </div>
  );
}
