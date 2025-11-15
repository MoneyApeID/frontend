// pages/terms-and-conditions.js
import Head from 'next/head';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/router';
import BottomNavbar from '../components/BottomNavbar';
import Copyright from '../components/copyright';

export default function TermsAndConditions() {
  const [applicationData, setApplicationData] = useState(null);
  const router = useRouter();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedApplication = localStorage.getItem('application');
      if (storedApplication) {
        try {
          const parsed = JSON.parse(storedApplication);
          setApplicationData({
            name: parsed.name || 'Money Rich',
            healthy: parsed.healthy || false,
            company: parsed.company || 'Money Rich Holdings',
            link_cs: parsed.link_cs || null,
          });
        } catch (error) {
          console.error('Error parsing application data:', error);
          setApplicationData({ name: 'Money Rich', healthy: false, company: 'Money Rich Holdings', link_cs: null });
        }
      } else {
        setApplicationData({ name: 'Money Rich', healthy: false, company: 'Money Rich Holdings', link_cs: null });
      }
    }
  }, []);

  return (
    <>
      <Head>
        <title>{applicationData?.name || 'Money Rich'} | Syarat dan Ketentuan</title>
        <meta name="description" content={`${applicationData?.name || 'Money Rich'} Syarat dan Ketentuan`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-brand-black text-white relative overflow-hidden pb-32">
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

        {/* Header */}
        <div className="relative z-10 pt-8 pb-24 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Hero Header Section */}
            <div className="mb-10 flex flex-col gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-brand-gold w-fit">
                <Icon icon="mdi:file-document" className="w-4 h-4" />
                Terms & Conditions
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-white">Syarat dan Ketentuan</h1>
                <p className="text-sm text-white/60 max-w-2xl mt-2">Terakhir diperbarui: 10 November 2025</p>
              </div>
            </div>

            {/* Content */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-gold/30 via-brand-emerald/20 to-brand-gold/30 rounded-3xl blur-xl opacity-50"></div>
              <div className="relative bg-gradient-to-br from-brand-surface via-brand-surface-soft to-brand-charcoal rounded-3xl p-6 sm:p-8 border border-white/10 backdrop-blur-xl shadow-[0_20px_60px_rgba(5,6,8,0.65)]">
                <div className="prose prose-invert max-w-none">
                  <div className="space-y-8 text-sm leading-relaxed">
                    
                    {/* Introduction */}
                    <div>
                      <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                        <Icon icon="mdi:file-document" className="w-6 h-6 text-brand-gold" />
                        Pengantar
                      </h2>
                      <p className="text-white/80 mb-4">
                        Harap baca syarat dan ketentuan ini dengan seksama sebelum menggunakan Layanan Kami.
                      </p>
                    </div>

                    {/* Definitions */}
                    <div>
                      <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                        <Icon icon="mdi:book-open-variant" className="w-6 h-6 text-brand-gold" />
                        Interpretasi dan Definisi
                      </h2>
                      
                      <h3 className="text-lg font-bold text-white mb-3">Definisi</h3>
                      <div className="space-y-3 text-white/80">
                        <p><strong>Aplikasi</strong> berarti program perangkat lunak yang disediakan oleh Perusahaan yang diunduh oleh Anda di perangkat elektronik apa pun, bernama {applicationData?.name || 'Money Rich'}.</p>
                        <p><strong>Toko Aplikasi</strong> berarti layanan distribusi digital yang dioperasikan dan dikembangkan oleh Apple Inc. (Apple App Store) atau Google Inc. (Google Play Store) di mana Aplikasi telah diunduh.</p>
                        <p><strong>Afiliasi</strong> berarti entitas yang mengontrol, dikontrol oleh, atau berada di bawah kontrol bersama dengan pihak, di mana &quot;kontrol&quot; berarti kepemilikan 50% atau lebih dari saham, kepentingan ekuitas atau sekuritas lain yang berhak memberikan suara untuk pemilihan direktur atau otoritas pengelola lainnya.</p>
                        <p><strong>Perusahaan</strong> (disebut sebagai &quot;Perusahaan&quot; atau &quot;Kami&quot; dalam Perjanjian ini) mengacu pada {applicationData?.company || 'Money Rich Holdings'}.</p>
                        <p><strong>Perangkat</strong> berarti perangkat apa pun yang dapat mengakses Layanan seperti komputer, telepon seluler atau tablet digital.</p>
                        <p><strong>Layanan</strong> mengacu pada Aplikasi atau Situs Web atau keduanya.</p>
                        <p><strong>Syarat dan Ketentuan</strong> (juga disebut sebagai &quot;Syarat&quot;) berarti Syarat dan Ketentuan ini yang membentuk keseluruhan perjanjian antara Anda dan Perusahaan mengenai penggunaan Layanan.</p>
                        <p><strong>Layanan Media Sosial Pihak Ketiga</strong> berarti layanan atau konten apa pun (termasuk data, informasi, produk atau layanan) yang disediakan oleh pihak ketiga yang dapat ditampilkan, disertakan atau tersedia oleh Layanan.</p>
                        <p><strong>Situs Web</strong> mengacu pada {applicationData?.name || 'Money Rich'}.</p>
                        <p><strong>Anda</strong> berarti individu yang mengakses atau menggunakan Layanan, atau perusahaan, atau entitas hukum lainnya atas nama individu tersebut yang mengakses atau menggunakan Layanan, sesuai dengan yang berlaku.</p>
                      </div>
                    </div>

                    {/* Acknowledgment */}
                    <div>
                      <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                        <Icon icon="mdi:handshake" className="w-6 h-6 text-brand-gold" />
                        Pengakuan
                      </h2>
                      <div className="space-y-3 text-white/80">
                        <p>Ini adalah Syarat dan Ketentuan yang mengatur penggunaan Layanan ini dan perjanjian yang beroperasi antara Anda dan Perusahaan. Syarat dan Ketentuan ini menetapkan hak dan kewajiban semua pengguna mengenai penggunaan Layanan.</p>
                        <p>Akses dan penggunaan Anda terhadap Layanan ini dikondisikan pada penerimaan dan kepatuhan Anda terhadap Syarat dan Ketentuan ini. Syarat dan Ketentuan ini berlaku untuk semua pengunjung, pengguna dan lainnya yang mengakses atau menggunakan Layanan.</p>
                        <p>Dengan mengakses atau menggunakan Layanan, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari Syarat dan Ketentuan ini, maka Anda tidak boleh mengakses Layanan.</p>
                        <p>Anda menyatakan bahwa Anda berusia di atas 18 tahun. Perusahaan tidak mengizinkan mereka yang berusia di bawah 18 tahun untuk menggunakan Layanan.</p>
                        <p>Akses dan penggunaan Anda terhadap Layanan juga dikondisikan pada penerimaan dan kepatuhan Anda terhadap Kebijakan Privasi Perusahaan. Kebijakan Privasi Kami menjelaskan kebijakan dan prosedur Kami dalam mengumpulkan, menggunakan dan mengungkapkan informasi pribadi Anda ketika Anda menggunakan Aplikasi atau Situs Web dan memberitahu Anda tentang hak privasi Anda dan bagaimana hukum melindungi Anda. Harap baca Kebijakan Privasi Kami dengan seksama sebelum menggunakan Layanan Kami.</p>
                      </div>
                    </div>

                    {/* Links to Other Websites */}
                    <div>
                      <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                        <Icon icon="mdi:link" className="w-6 h-6 text-brand-gold" />
                        Tautan ke Situs Web Lain
                      </h2>
                      <div className="space-y-3 text-white/80">
                        <p>Layanan Kami mungkin berisi tautan ke situs web atau layanan pihak ketiga yang tidak dimiliki atau dikontrol oleh Perusahaan.</p>
                        <p>Perusahaan tidak memiliki kontrol atas, dan tidak bertanggung jawab atas, konten, kebijakan privasi, atau praktik dari situs web atau layanan pihak ketiga mana pun. Anda lebih lanjut mengakui dan menyetujui bahwa Perusahaan tidak akan bertanggung jawab atau berkewajiban, secara langsung atau tidak langsung, atas kerusakan atau kerugian yang disebabkan atau diduga disebabkan oleh atau sehubungan dengan penggunaan atau ketergantungan pada konten, barang atau layanan apa pun yang tersedia di atau melalui situs web atau layanan tersebut.</p>
                        <p>Kami sangat menyarankan Anda untuk membaca syarat dan ketentuan serta kebijakan privasi dari situs web atau layanan pihak ketiga yang Anda kunjungi.</p>
                      </div>
                    </div>

                    {/* Termination */}
                    <div>
                      <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                        <Icon icon="mdi:stop-circle" className="w-6 h-6 text-brand-gold" />
                        Penghentian
                      </h2>
                      <div className="space-y-3 text-white/80">
                        <p>Kami dapat menghentikan atau menangguhkan akses Anda segera, tanpa pemberitahuan sebelumnya atau tanggung jawab, karena alasan apa pun, termasuk tanpa batasan jika Anda melanggar Syarat dan Ketentuan ini.</p>
                        <p>Setelah penghentian, hak Anda untuk menggunakan Layanan akan berhenti segera.</p>
                      </div>
                    </div>

                    {/* Limitation of Liability */}
                    <div>
                      <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                        <Icon icon="mdi:shield-alert" className="w-6 h-6 text-brand-gold" />
                        Pembatasan Tanggung Jawab
                      </h2>
                      <div className="space-y-3 text-white/80">
                        <p>Terlepas dari kerusakan yang mungkin Anda alami, seluruh tanggung jawab Perusahaan dan salah satu pemasoknya di bawah ketentuan apa pun dari Syarat ini dan solusi eksklusif Anda untuk semua hal di atas akan dibatasi pada jumlah yang benar-benar dibayar oleh Anda melalui Layanan atau 100 USD jika Anda belum membeli apa pun melalui Layanan.</p>
                        <p>Sejauh maksimum yang diizinkan oleh hukum yang berlaku, dalam keadaan apa pun Perusahaan atau pemasoknya tidak akan bertanggung jawab atas kerusakan khusus, insidental, tidak langsung, atau konsekuensial apa pun (termasuk, tetapi tidak terbatas pada, kerusakan untuk kehilangan keuntungan, kehilangan data atau informasi lain, untuk gangguan bisnis, untuk cedera pribadi, kehilangan privasi yang timbul dari atau dengan cara apa pun terkait dengan penggunaan atau ketidakmampuan untuk menggunakan Layanan, perangkat lunak pihak ketiga dan/atau perangkat keras pihak ketiga yang digunakan dengan Layanan, atau sebaliknya sehubungan dengan ketentuan apa pun dari Syarat ini), bahkan jika Perusahaan atau pemasok mana pun telah diberitahu tentang kemungkinan kerusakan tersebut dan bahkan jika solusi gagal dari tujuannya yang penting.</p>
                        <p>Beberapa negara bagian tidak mengizinkan pengecualian jaminan tersirat atau pembatasan tanggung jawab untuk kerusakan insidental atau konsekuensial, yang berarti bahwa beberapa pembatasan di atas mungkin tidak berlaku. Di negara bagian ini, tanggung jawab masing-masing pihak akan dibatasi pada sejauh maksimum yang diizinkan oleh hukum.</p>
                      </div>
                    </div>

                    {/* AS IS Disclaimer */}
                    <div>
                      <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                        <Icon icon="mdi:alert-circle" className="w-6 h-6 text-brand-gold" />
                        Penafian &quot;SEBAGAIMANA ADANYA&quot; dan &quot;SEBAGAIMANA TERSEDIA&quot;
                      </h2>
                      <div className="space-y-3 text-white/80">
                        <p>Layanan disediakan untuk Anda &quot;SEBAGAIMANA ADANYA&quot; dan &quot;SEBAGAIMANA TERSEDIA&quot; dan dengan semua kesalahan dan cacat tanpa jaminan apa pun. Sejauh maksimum yang diizinkan di bawah hukum yang berlaku, Perusahaan, atas namanya sendiri dan atas nama Afiliasinya dan pemberi lisensi dan penyedia layanannya masing-masing, secara tegas menyangkal semua jaminan, baik eksplisit, tersirat, statutori atau lainnya, sehubungan dengan Layanan, termasuk semua jaminan tersirat dari kemampuan jual, kesesuaian untuk tujuan tertentu, judul dan non-pelanggaran, dan jaminan yang mungkin timbul dari jalannya transaksi, jalannya kinerja, penggunaan atau praktik perdagangan.</p>
                        <p>Tanpa batasan pada hal di atas, Perusahaan tidak memberikan jaminan atau komitmen apa pun, dan tidak membuat pernyataan apa pun bahwa Layanan akan memenuhi persyaratan Anda, mencapai hasil yang dimaksudkan, kompatibel atau bekerja dengan perangkat lunak, aplikasi, sistem atau layanan lain apa pun, beroperasi tanpa gangguan, memenuhi standar kinerja atau keandalan apa pun atau bebas dari kesalahan atau bahwa kesalahan atau cacat apa pun dapat atau akan diperbaiki.</p>
                        <p>Tanpa membatasi hal di atas, baik Perusahaan maupun penyedia perusahaan tidak membuat pernyataan atau jaminan apa pun, eksplisit atau tersirat: (i) mengenai operasi atau ketersediaan Layanan, atau informasi, konten, dan materi atau produk yang disertakan di dalamnya; (ii) bahwa Layanan akan tidak terputus atau bebas dari kesalahan; (iii) mengenai keakuratan, keandalan, atau keaktualan informasi atau konten apa pun yang disediakan melalui Layanan; atau (iv) bahwa Layanan, servernya, konten, atau email yang dikirim dari atau atas nama Perusahaan bebas dari virus, skrip, trojan horse, worm, malware, timebombs atau komponen berbahaya lainnya.</p>
                        <p>Beberapa yurisdiksi tidak mengizinkan pengecualian jenis jaminan tertentu atau pembatasan pada hak statutori yang berlaku dari konsumen, sehingga beberapa atau semua pengecualian dan pembatasan di atas mungkin tidak berlaku untuk Anda. Tetapi dalam kasus seperti itu, pengecualian dan pembatasan yang ditetapkan dalam bagian ini akan diterapkan pada sejauh maksimum yang dapat diberlakukan di bawah hukum yang berlaku.</p>
                      </div>
                    </div>

                    {/* Governing Law */}
                    <div>
                      <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                        <Icon icon="mdi:gavel" className="w-6 h-6 text-brand-gold" />
                        Hukum yang Berlaku
                      </h2>
                      <p className="text-white/80">
                        Hukum yang berlaku akan mengatur Syarat ini dan penggunaan Anda terhadap Layanan. Penggunaan Anda terhadap Aplikasi juga dapat tunduk pada hukum lokal, negara bagian, nasional, atau internasional lainnya.
                      </p>
                    </div>

                    {/* Disputes Resolution */}
                    <div>
                      <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                        <Icon icon="mdi:scale-balance" className="w-6 h-6 text-brand-gold" />
                        Penyelesaian Sengketa
                      </h2>
                      <p className="text-white/80">
                        Jika Anda memiliki kekhawatiran atau sengketa tentang Layanan, Anda menyetujui untuk terlebih dahulu mencoba menyelesaikan sengketa secara informal dengan menghubungi Perusahaan.
                      </p>
                    </div>

                    {/* For European Union Users */}
                    <div>
                      <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                        <Icon icon="mdi:flag" className="w-6 h-6 text-brand-gold" />
                        Untuk Pengguna Uni Eropa (EU)
                      </h2>
                      <p className="text-white/80">
                        Jika Anda adalah konsumen Uni Eropa, Anda akan mendapat manfaat dari ketentuan wajib hukum negara tempat Anda tinggal.
                      </p>
                    </div>

                    {/* United States Legal Compliance */}
                    <div>
                      <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                        <Icon icon="mdi:shield-check" className="w-6 h-6 text-brand-gold" />
                        Kepatuhan Hukum
                      </h2>
                      <p className="text-white/80">
                        Anda menyatakan dan menjamin bahwa (i) Anda tidak berada di negara yang menjadi subjek embargo pemerintah, atau yang telah ditetapkan sebagai negara &quot;pendukung teroris&quot;, dan (ii) Anda tidak terdaftar dalam daftar pemerintah tentang pihak yang dilarang atau dibatasi.
                      </p>
                    </div>

                    {/* Severability and Waiver */}
                    <div>
                      <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                        <Icon icon="mdi:file-cog" className="w-6 h-6 text-brand-gold" />
                        Pemisahan dan Pengabaian
                      </h2>
                      <div className="space-y-3 text-white/80">
                        <div>
                          <h4 className="font-bold text-white mb-2">Pemisahan</h4>
                          <p>Jika ketentuan apa pun dari Syarat ini dianggap tidak dapat diberlakukan atau tidak valid, ketentuan tersebut akan diubah dan ditafsirkan untuk mencapai tujuan ketentuan tersebut sejauh mungkin di bawah hukum yang berlaku dan ketentuan yang tersisa akan terus berlaku penuh.</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-white mb-2">Pengabaian</h4>
                          <p>Kecuali sebagaimana diatur di sini, kegagalan untuk menggunakan hak atau memerlukan kinerja kewajiban di bawah Syarat ini tidak akan mempengaruhi kemampuan pihak untuk menggunakan hak tersebut atau memerlukan kinerja tersebut kapan saja setelahnya, dan pengabaian pelanggaran tidak akan merupakan pengabaian pelanggaran selanjutnya.</p>
                        </div>
                      </div>
                    </div>

                    {/* Translation Interpretation */}
                    <div>
                      <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                        <Icon icon="mdi:translate" className="w-6 h-6 text-brand-gold" />
                        Interpretasi Terjemahan
                      </h2>
                      <p className="text-white/80">
                        Syarat dan Ketentuan ini mungkin telah diterjemahkan jika Kami telah membuatnya tersedia untuk Anda di Layanan kami. Anda menyetujui bahwa teks bahasa Inggris asli akan berlaku dalam kasus sengketa.
                      </p>
                    </div>

                    {/* Changes to Terms */}
                    <div>
                      <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                        <Icon icon="mdi:update" className="w-6 h-6 text-brand-gold" />
                        Perubahan pada Syarat dan Ketentuan ini
                      </h2>
                      <div className="space-y-3 text-white/80">
                        <p>Kami berhak, atas kebijakan mutlak Kami, untuk memodifikasi atau mengganti Syarat ini kapan saja. Jika revisi bersifat material, Kami akan melakukan upaya yang wajar untuk memberikan pemberitahuan setidaknya 30 hari sebelum syarat baru berlaku. Apa yang merupakan perubahan material akan ditentukan atas kebijakan mutlak Kami.</p>
                        <p>Dengan terus mengakses atau menggunakan Layanan Kami setelah revisi tersebut berlaku, Anda menyetujui untuk terikat oleh syarat yang direvisi. Jika Anda tidak setuju dengan syarat baru, sebagian atau seluruhnya, harap berhenti menggunakan situs web dan Layanan.</p>
                      </div>
                    </div>

                    {/* Contact */}
                    <div>
                      <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                        <Icon icon="mdi:email" className="w-6 h-6 text-brand-gold" />
                        Hubungi Kami
                      </h2>
                      <p className="text-white/80 mb-4">
                        Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, Anda dapat menghubungi kami:
                      </p>
                      {applicationData?.link_cs && (
                        <div className="bg-brand-gold/10 rounded-xl p-4 border border-brand-gold/30">
                          <div className="flex items-center gap-3">
                            <Icon icon="mdi:email" className="w-5 h-5 text-brand-gold" />
                            <a href={applicationData.link_cs} target="_blank" rel="noopener noreferrer" className="text-brand-gold font-medium hover:text-brand-gold-deep transition-colors">
                              Hubungi Support
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Copyright />

        {/* Bottom Navigation - Floating */}
        <BottomNavbar />
      </div>
    </>
  );
}
