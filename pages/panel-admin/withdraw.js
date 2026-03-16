import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Icon } from '@iconify/react';
import AdminLayout from '../../components/admin/Layout';
import useAdminAuth from '../../lib/auth/useAdminAuth';
import { adminRequest, adminWithdrawInquiry, adminWithdrawTransfer, adminWithdrawHistory } from '../../utils/admin/api';

export default function AdminWithdrawPage() {
  const { loading: authLoading } = useAdminAuth();
  const [banks, setBanks] = useState([]);
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Inquiry result
  const [inquiryData, setInquiryData] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [transferring, setTransferring] = useState(false);

  // History
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPagination, setHistoryPagination] = useState(null);

  const loadBanks = async () => {
    try {
      const res = await adminRequest('/banks');
      if (res?.success && res.data) {
        setBanks(res.data.filter(b => b.status === 'Active'));
      }
    } catch {}
  };

  const loadHistory = async (page = 1) => {
    setHistoryLoading(true);
    try {
      const res = await adminWithdrawHistory({ page, limit: 10 });
      if (res?.success) {
        setHistory(res.data?.items || []);
        setHistoryPagination(res.data?.pagination || null);
      }
    } catch {}
    setHistoryLoading(false);
  };

  useEffect(() => {
    if (!authLoading) {
      loadBanks();
      loadHistory(1);
    }
  }, [authLoading]);

  const formatCurrency = (v) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v || 0);

  const selectedBank = banks.find(b => b.code === bankCode);

  const handleInquiry = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!bankCode || !accountNumber || !amount || Number(amount) <= 0) {
      setError('Lengkapi semua field');
      return;
    }
    setLoading(true);
    try {
      const res = await adminWithdrawInquiry({
        bank_code: bankCode,
        account_number: accountNumber,
        amount: Number(amount),
      });
      if (res?.success) {
        setInquiryData(res.data);
        setShowConfirm(true);
      } else {
        setError(res?.message || 'Inquiry gagal');
      }
    } catch (err) {
      setError('Terjadi kesalahan');
    }
    setLoading(false);
  };

  const handleTransfer = async () => {
    if (!inquiryData) return;
    setTransferring(true);
    setError('');
    try {
      const res = await adminWithdrawTransfer({
        session_id: inquiryData.session_id,
        bank_code: inquiryData.bank_code,
        account_number: inquiryData.account_number,
        account_name: inquiryData.account_name,
        amount: inquiryData.amount,
        partner_ref_no: inquiryData.partner_ref_no,
      });
      if (res?.success) {
        setSuccess('Transfer berhasil diproses');
        setShowConfirm(false);
        setInquiryData(null);
        setBankCode('');
        setAccountNumber('');
        setAmount('');
        loadHistory(1);
      } else {
        setError(res?.message || 'Transfer gagal');
        setShowConfirm(false);
      }
    } catch (err) {
      setError('Terjadi kesalahan');
      setShowConfirm(false);
    }
    setTransferring(false);
  };

  const statusColor = (s) => {
    if (s === 'Success') return 'bg-green-500/20 text-green-400';
    if (s === 'Pending') return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-red-500/20 text-red-400';
  };

  const getBankName = (code) => {
    const b = banks.find(x => x.code === code);
    return b ? b.name : code;
  };

  if (authLoading) return null;

  // Group banks by type
  const bankList = banks.filter(b => b.type === 'bank');
  const ewalletList = banks.filter(b => b.type === 'ewallet');

  return (
    <AdminLayout title="Penarikan Admin">
      <Head><title>Penarikan Admin</title></Head>

      <div className="space-y-6">
        {/* Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Icon icon="mdi:bank-transfer-out" className="w-5 h-5 text-red-400" />
            Transfer ke Bank / E-Wallet
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleInquiry} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Bank / E-Wallet</label>
              <select
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="" className="bg-gray-900">Pilih Bank / E-Wallet</option>
                {bankList.length > 0 && (
                  <optgroup label="Bank" className="bg-gray-900">
                    {bankList.map((b) => (
                      <option key={b.code} value={b.code} className="bg-gray-900">{b.name}</option>
                    ))}
                  </optgroup>
                )}
                {ewalletList.length > 0 && (
                  <optgroup label="E-Wallet" className="bg-gray-900">
                    {ewalletList.map((b) => (
                      <option key={b.code} value={b.code} className="bg-gray-900">{b.name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
              {selectedBank && (
                <p className="text-xs text-gray-500 mt-1">
                  Tipe: {selectedBank.type === 'ewallet' ? 'E-Wallet' : 'Bank'} | Kode: {selectedBank.code}
                </p>
              )}
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">
                {selectedBank?.type === 'ewallet' ? 'Nomor Customer' : 'Nomor Rekening'}
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                placeholder={selectedBank?.type === 'ewallet' ? 'Masukkan nomor HP/customer' : 'Masukkan nomor rekening'}
                className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Nominal</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Masukkan nominal"
                min="1"
                className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? 'Memproses...' : 'Cek & Inquiry'}
              </button>
            </div>
          </form>
        </div>

        {/* Confirm Modal */}
        {showConfirm && inquiryData && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowConfirm(false)}>
            <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-400" />
                Konfirmasi Transfer
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Nama Penerima</span>
                  <span className="text-white font-semibold">{inquiryData.account_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{inquiryData.bank_type === 'ewallet' ? 'E-Wallet' : 'Bank'}</span>
                  <span className="text-white">{inquiryData.bank_name || getBankName(inquiryData.bank_code)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{inquiryData.bank_type === 'ewallet' ? 'No. Customer' : 'No. Rekening'}</span>
                  <span className="text-white">{inquiryData.account_number}</span>
                </div>
                <hr className="border-white/10" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Nominal</span>
                  <span className="text-white font-bold">{formatCurrency(inquiryData.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Biaya Admin (PakaiLink)</span>
                  <span className="text-yellow-400">{formatCurrency(inquiryData.admin_fee)}</span>
                </div>
                <hr className="border-white/10" />
                <div className="flex justify-between">
                  <span className="text-gray-400 font-semibold">Total</span>
                  <span className="text-green-400 font-bold text-lg">{formatCurrency(inquiryData.final_amount)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 bg-white/10 border border-white/20 text-white py-3 rounded-xl hover:bg-white/20 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleTransfer}
                  disabled={transferring}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
                >
                  {transferring ? 'Mengirim...' : 'Kirim Sekarang'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Icon icon="mdi:history" className="w-5 h-5 text-blue-400" />
            Riwayat Penarikan Admin
          </h2>

          {historyLoading ? (
            <div className="text-center py-8 text-gray-400">Memuat...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Belum ada riwayat penarikan</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400">
                      <th className="text-left py-3 px-2">ID</th>
                      <th className="text-left py-3 px-2">Bank/Ewallet</th>
                      <th className="text-left py-3 px-2">Rekening</th>
                      <th className="text-left py-3 px-2">Nama</th>
                      <th className="text-right py-3 px-2">Nominal</th>
                      <th className="text-right py-3 px-2">Fee</th>
                      <th className="text-right py-3 px-2">Total</th>
                      <th className="text-center py-3 px-2">Status</th>
                      <th className="text-left py-3 px-2">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-2 text-gray-400">{item.id}</td>
                        <td className="py-3 px-2 text-white">{getBankName(item.bank_code)}</td>
                        <td className="py-3 px-2 text-white font-mono">{item.account_number}</td>
                        <td className="py-3 px-2 text-white">{item.account_name}</td>
                        <td className="py-3 px-2 text-white text-right">{formatCurrency(item.amount)}</td>
                        <td className="py-3 px-2 text-yellow-400 text-right">{formatCurrency(item.admin_fee)}</td>
                        <td className="py-3 px-2 text-green-400 text-right font-bold">{formatCurrency(item.final_amount)}</td>
                        <td className="py-3 px-2 text-center">
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${statusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-gray-400 whitespace-nowrap">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {historyPagination && historyPagination.total_pages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    disabled={historyPage <= 1}
                    onClick={() => { setHistoryPage(p => p - 1); loadHistory(historyPage - 1); }}
                    className="px-3 py-1 rounded-lg bg-white/10 text-white text-sm disabled:opacity-30"
                  >
                    Prev
                  </button>
                  <span className="text-gray-400 text-sm py-1">
                    {historyPage} / {historyPagination.total_pages}
                  </span>
                  <button
                    disabled={historyPage >= historyPagination.total_pages}
                    onClick={() => { setHistoryPage(p => p + 1); loadHistory(historyPage + 1); }}
                    className="px-3 py-1 rounded-lg bg-white/10 text-white text-sm disabled:opacity-30"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
