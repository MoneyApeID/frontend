// pages/privacy-policy.js
import Head from 'next/head';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/router';
import BottomNavbar from '../components/BottomNavbar';
import Copyright from '../components/copyright';

export default function PrivacyPolicy() {
  const [applicationData, setApplicationData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedApplication = localStorage.getItem('application');
      if (storedApplication) {
        try {
          setApplicationData(JSON.parse(storedApplication));
        } catch (error) {
          console.error('Error parsing application data:', error);
        }
      }
    }
  }, []);

  return (
    <>
      <Head>
        <title>{applicationData?.name || 'Money Rich'} | Kebijakan Privasi</title>
        <meta name="description" content={`${applicationData?.name || 'Money Rich'} Kebijakan Privasi`} />
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
                <Icon icon="mdi:shield-check" className="w-4 h-4" />
                Privacy Policy
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-white">Kebijakan Privasi</h1>
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
                        <Icon icon="mdi:shield-check" className="w-6 h-6 text-brand-gold" />
                        Pengantar
                      </h2>
                      <p className="text-white/80 mb-4">
                        Kebijakan Privasi ini menjelaskan kebijakan dan prosedur Kami dalam mengumpulkan, menggunakan, dan mengungkapkan informasi Anda ketika Anda menggunakan Layanan dan memberitahu Anda tentang hak privasi Anda dan bagaimana hukum melindungi Anda.
                      </p>
                      <p className="text-white/80">
                        Kami menggunakan Data Pribadi Anda untuk menyediakan dan meningkatkan Layanan. Dengan menggunakan Layanan, Anda menyetujui pengumpulan dan penggunaan informasi sesuai dengan Kebijakan Privasi ini.
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
                        <p><strong>Akun</strong> berarti akun unik yang dibuat oleh Anda untuk mengakses Layanan kami atau bagian dari Layanan kami.</p>
                        <p><strong>Afiliasi</strong> berarti entitas yang mengontrol, dikontrol oleh, atau berada di bawah kontrol bersama dengan pihak, di mana &quot;kontrol&quot; berarti kepemilikan 50% atau lebih dari saham, kepentingan ekuitas atau sekuritas lain yang berhak memberikan suara untuk pemilihan direktur atau otoritas pengelola lainnya.</p>
                        <p><strong>Aplikasi</strong> mengacu pada {applicationData?.name || 'Money Rich'}, program perangkat lunak yang disediakan oleh Perusahaan.</p>
                        <p><strong>Perusahaan</strong> (disebut sebagai &quot;Perusahaan&quot; atau &quot;Kami&quot; dalam Perjanjian ini) mengacu pada {applicationData?.company || 'Money Rich Holdings'}.</p>
                        <p><strong>Cookies</strong> adalah file kecil yang ditempatkan di komputer, perangkat seluler atau perangkat lain oleh situs web, yang berisi detail riwayat penelusuran Anda di situs web tersebut di antara banyak kegunaannya.</p>
                        <p><strong>Perangkat</strong> berarti perangkat apa pun yang dapat mengakses Layanan seperti komputer, telepon seluler atau tablet digital.</p>
                        <p><strong>Data Pribadi</strong> adalah informasi apa pun yang berkaitan dengan individu yang teridentifikasi atau dapat diidentifikasi.</p>
                        <p><strong>Layanan</strong> mengacu pada Aplikasi atau Situs Web atau keduanya.</p>
                        <p><strong>Penyedia Layanan</strong> berarti setiap orang perseorangan atau badan hukum yang memproses data atas nama Perusahaan. Hal ini merujuk pada perusahaan atau individu pihak ketiga yang dipekerjakan oleh Perusahaan untuk memfasilitasi Layanan, menyediakan Layanan atas nama Perusahaan, melaksanakan layanan yang terkait dengan Layanan, atau membantu Perusahaan dalam menganalisis cara penggunaan Layanan.</p>
                        <p><strong>Data Penggunaan</strong> mengacu pada data yang dikumpulkan secara otomatis, baik yang dihasilkan dari penggunaan Layanan atau dari infrastruktur Layanan itu sendiri.</p>
                        <p><strong>Situs Web</strong> mengacu pada {applicationData?.name || 'Money Rich'}.</p>
                        <p><strong>Anda</strong> berarti individu yang mengakses atau menggunakan Layanan, atau perusahaan, atau entitas hukum lainnya atas nama individu tersebut yang mengakses atau menggunakan Layanan, sesuai dengan yang berlaku.</p>
                      </div>
                    </div>

                    {/* Data Collection */}
                    <div>
                      <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                        <Icon icon="mdi:database" className="w-6 h-6 text-brand-gold" />
                        Mengumpulkan dan Menggunakan Data Pribadi Anda
                      </h2>
                      
                      <h3 className="text-lg font-bold text-white mb-3">Jenis Data yang Dikumpulkan</h3>
                      <div className="space-y-3 text-white/80">
                        <div>
                          <h4 className="font-semibold text-white mb-2">Data Pribadi</h4>
                          <p className="mb-2">Saat menggunakan Layanan Kami, Kami mungkin meminta Anda untuk memberikan informasi yang dapat diidentifikasi secara pribadi yang dapat digunakan untuk menghubungi atau mengidentifikasi Anda. Informasi yang dapat diidentifikasi secara pribadi mungkin termasuk, tetapi tidak terbatas pada:</p>
                          <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Nama depan dan nama belakang</li>
                            <li>Nomor telepon</li>
                            <li>Data Penggunaan</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-white mb-2">Data Penggunaan</h4>
                          <p>Data Penggunaan dikumpulkan secara otomatis saat menggunakan Layanan. Data Penggunaan mungkin termasuk informasi seperti alamat Protokol Internet Perangkat Anda (mis. alamat IP), jenis browser, versi browser, halaman Layanan kami yang Anda kunjungi, waktu dan tanggal kunjungan Anda, waktu yang dihabiskan di halaman tersebut, pengidentifikasi perangkat unik dan data diagnostik lainnya.</p>
                        </div>
                      </div>
                    </div>

                    {/* Cookies */}
                    <div>
                      <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                        <Icon icon="mdi:cookie" className="w-6 h-6 text-brand-gold" />
                        Teknologi Pelacakan dan Cookies
                      </h2>
                      <div className="space-y-3 text-white/80">
                        <p>Kami menggunakan Cookies dan teknologi pelacakan serupa untuk melacak aktivitas di Layanan Kami dan menyimpan informasi tertentu. Teknologi pelacakan yang Kami gunakan meliputi beacon, tag, dan skrip untuk mengumpulkan dan melacak informasi serta untuk meningkatkan dan menganalisis Layanan Kami.</p>
                        
                        <div>
                          <h4 className="font-semibold text-white mb-2">Jenis Cookies yang Kami Gunakan:</h4>
                          <ul className="list-disc list-inside ml-4 space-y-2">
                            <li><strong>Cookies Penting/Pokok:</strong> Cookies ini penting untuk menyediakan layanan yang tersedia melalui Situs Web dan untuk memungkinkan Anda menggunakan beberapa fiturnya.</li>
                            <li><strong>Cookies Kebijakan/Pemberitahuan Penerimaan Cookies:</strong> Cookies ini mengidentifikasi apakah pengguna telah menerima penggunaan cookies di Situs Web.</li>
                            <li><strong>Cookies Fungsionalitas:</strong> Cookies ini memungkinkan kami mengingat pilihan yang Anda buat saat menggunakan Situs Web, seperti mengingat detail login atau preferensi bahasa Anda.</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Use of Data */}
                    <div>
                      <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                        <Icon icon="mdi:chart-line" className="w-6 h-6 text-brand-gold" />
                        Penggunaan Data Pribadi Anda
                      </h2>
                      <div className="space-y-3 text-white/80">
                        <p>Perusahaan dapat menggunakan Data Pribadi untuk tujuan berikut:</p>
                        <ul className="list-disc list-inside ml-4 space-y-2">
                          <li>Untuk menyediakan dan memelihara Layanan kami, termasuk untuk memantau penggunaan Layanan kami</li>
                          <li>Untuk mengelola Akun Anda: untuk mengelola pendaftaran Anda sebagai pengguna Layanan</li>
                          <li>Untuk pelaksanaan kontrak: pengembangan, kepatuhan dan pelaksanaan kontrak pembelian untuk produk, item atau layanan yang telah Anda beli</li>
                          <li>Untuk menghubungi Anda: Untuk menghubungi Anda melalui email, panggilan telepon, SMS, atau bentuk komunikasi elektronik lainnya</li>
                          <li>Untuk memberikan berita, penawaran khusus, dan informasi umum tentang barang, layanan dan acara lain yang Kami tawarkan</li>
                          <li>Untuk mengelola permintaan Anda: Untuk menangani dan mengelola permintaan Anda kepada Kami</li>
                          <li>Untuk transfer bisnis: Kami dapat menggunakan informasi Anda untuk mengevaluasi atau melakukan merger, divestasi, restrukturisasi, reorganisasi, pembubaran, atau penjualan atau transfer lain dari sebagian atau seluruh aset Kami</li>
                          <li>Untuk tujuan lain: Kami dapat menggunakan informasi Anda untuk tujuan lain, seperti analisis data, mengidentifikasi tren penggunaan, menentukan efektivitas kampanye promosi kami dan untuk mengevaluasi dan meningkatkan Layanan, produk, layanan, pemasaran dan pengalaman Anda</li>
                        </ul>
                      </div>
                    </div>

                    {/* Data Retention */}
                    <div>
                      <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                        <Icon icon="mdi:clock-outline" className="w-6 h-6 text-brand-gold" />
                        Penyimpanan Data Pribadi Anda
                      </h2>
                      <p className="text-white/80">
                        Perusahaan akan menyimpan Data Pribadi Anda hanya selama diperlukan untuk tujuan yang diuraikan dalam Kebijakan Privasi ini. Kami akan menyimpan dan menggunakan Data Pribadi Anda sejauh yang diperlukan untuk mematuhi kewajiban hukum kami, menyelesaikan sengketa, dan menegakkan perjanjian dan kebijakan hukum kami.
                      </p>
                    </div>

                    {/* Data Security */}
                    <div>
                      <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                        <Icon icon="mdi:security" className="w-6 h-6 text-brand-gold" />
                        Keamanan Data Pribadi Anda
                      </h2>
                      <p className="text-white/80">
                        Keamanan Data Pribadi Anda penting bagi Kami, tetapi ingatlah bahwa tidak ada metode transmisi melalui Internet, atau metode penyimpanan elektronik yang 100% aman. Meskipun Kami berusaha menggunakan cara yang masuk akal secara komersial untuk melindungi Data Pribadi Anda, Kami tidak dapat menjamin keamanan absolutnya.
                      </p>
                    </div>

                    {/* Children's Privacy */}
                    <div>
                      <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                        <Icon icon="mdi:account-child" className="w-6 h-6 text-brand-gold" />
                        Privasi Anak-anak
                      </h2>
                      <p className="text-white/80">
                        Layanan kami tidak ditujukan untuk siapa pun yang berusia di bawah 18 tahun. Kami tidak secara sadar mengumpulkan informasi yang dapat diidentifikasi secara pribadi dari siapa pun yang berusia di bawah 18 tahun. Jika Anda adalah orang tua atau wali dan Anda mengetahui bahwa anak Anda telah memberikan Data Pribadi kepada Kami, silakan hubungi Kami.
                      </p>
                    </div>

                    {/* Changes to Policy */}
                    <div>
                      <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                        <Icon icon="mdi:update" className="w-6 h-6 text-brand-gold" />
                        Perubahan pada Kebijakan Privasi ini
                      </h2>
                      <p className="text-white/80">
                        Kami dapat memperbarui Kebijakan Privasi Kami dari waktu ke waktu. Kami akan memberi tahu Anda tentang perubahan apa pun dengan memposting Kebijakan Privasi baru di halaman ini. Kami akan memberi tahu Anda melalui email dan/atau pemberitahuan yang menonjol di Layanan Kami, sebelum perubahan menjadi efektif dan memperbarui tanggal &quot;Terakhir diperbarui&quot; di bagian atas Kebijakan Privasi ini.
                      </p>
                    </div>

                    {/* Contact */}
                    <div>
                      <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                        <Icon icon="mdi:email" className="w-6 h-6 text-brand-gold" />
                        Hubungi Kami
                      </h2>
                      <p className="text-white/80 mb-4">
                        Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, Anda dapat menghubungi kami:
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
