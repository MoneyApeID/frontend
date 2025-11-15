// pages/panel-admin/tutorials.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Icon } from '@iconify/react';
import AdminLayout from '../../components/admin/Layout';
import useAdminAuth from '../../lib/auth/useAdminAuth';
import { adminRequest } from '../../utils/admin/api';
import Image from 'next/image';

export default function TutorialManagement() {
  const { loading: authLoading } = useAdminAuth();
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    link: '',
    status: 'Active'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  useEffect(() => {
    if (authLoading) return;
    loadTutorials();
  }, [authLoading]);

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

  const loadTutorials = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminRequest('/tutorials', { method: 'GET' });
      if (res && res.success && res.data) {
        const tutorialsData = res.data.tutorials || [];
        setTutorials(tutorialsData);
        
        // Calculate stats
        const statsData = tutorialsData.reduce((acc, tutorial) => {
          acc.total++;
          if (tutorial.status === 'Active') acc.active++;
          else acc.inactive++;
          return acc;
        }, { total: 0, active: 0, inactive: 0 });
        setStats(statsData);

        // Fetch all image URLs
        const urlPromises = tutorialsData.map(async (tutorial) => {
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
        setStats({ total: 0, active: 0, inactive: 0 });
        setError(res?.message || 'Gagal memuat tutorial');
      }
    } catch (err) {
      console.error('Failed to load tutorials:', err);
      setError('Gagal memuat tutorial');
      setTutorials([]);
      setStats({ total: 0, active: 0, inactive: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tutorial) => {
    setSelectedTutorial(tutorial);
    setForm({
      title: tutorial.title || '',
      link: tutorial.link || '',
      status: tutorial.status || 'Active'
    });
    setImageFile(null);
    setImagePreview(null);
    setError('');
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedTutorial(null);
    setForm({
      title: '',
      link: '',
      status: 'Active'
    });
    setImageFile(null);
    setImagePreview(null);
    setError('');
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file gambar maksimal 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('File harus berupa gambar');
        return;
      }

      setImageFile(file);
      setError('');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    
    try {
      // Validate form
      if (!form.title.trim()) {
        setError('Judul tutorial harus diisi');
        setSaving(false);
        return;
      }

      if (!form.link.trim()) {
        setError('Link tutorial harus diisi');
        setSaving(false);
        return;
      }

      // Validate URL format
      try {
        new URL(form.link);
      } catch {
        setError('Link harus berupa URL yang valid');
        setSaving(false);
        return;
      }

      // Create FormData
      const formData = new FormData();
      
      if (selectedTutorial) {
        // Update existing
        formData.append('id', selectedTutorial.id.toString());
      }
      
      formData.append('title', form.title.trim());
      formData.append('link', form.link.trim());
      formData.append('status', form.status);
      
      // Append image file if selected
      if (imageFile) {
        formData.append('image', imageFile);
      }

      let res;
      if (selectedTutorial) {
        // Update existing
        res = await adminRequest('/tutorials', { 
          method: 'PUT', 
          body: formData
        });
      } else {
        // Create new - image is required for new tutorial
        if (!imageFile) {
          setError('Gambar tutorial harus diisi untuk tutorial baru');
          setSaving(false);
          return;
        }
        res = await adminRequest('/tutorials', { 
          method: 'POST', 
          body: formData
        });
      }
      
      if (res && res.success) {
        loadTutorials(); // Reload data
        setShowModal(false);
        setForm({ title: '', link: '', status: 'Active' });
        setImageFile(null);
        setImagePreview(null);
        setSelectedTutorial(null);
      } else {
        setError(res?.message || 'Gagal menyimpan tutorial');
      }
    } catch (err) {
      console.error('Save failed:', err);
      setError(err?.message || 'Gagal menyimpan tutorial');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tutorialId) => {
    if (!confirm('Yakin ingin menghapus tutorial ini?')) return;
    
    try {
      const res = await adminRequest(`/tutorials/${tutorialId}`, { method: 'DELETE' });
      if (res && res.success) {
        loadTutorials();
      } else {
        alert(res?.message || 'Gagal menghapus tutorial');
      }
    } catch (err) {
      alert(err?.message || 'Gagal menghapus tutorial');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { class: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Aktif' },
      inactive: { class: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: 'Tidak Aktif' }
    };
    
    const config = statusConfig[status.toLowerCase()] || statusConfig.active;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-400 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-white font-medium text-lg">Memuat Data Tutorial...</p>
            <p className="text-gray-400 text-sm mt-1">Harap tunggu sebentar</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="Kelola Tutorial">
      <Head>
        <title>Vla Devs | Kelola Tutorial</title>
        <link rel="icon" type="image/x-icon" href="/vla-logo.png" />
      </Head>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Tutorial" value={stats.total} icon="mdi:play-circle" color="blue" />
        <StatCard title="Tutorial Aktif" value={stats.active} icon="mdi:play-circle-outline" color="green" />
        <StatCard title="Tidak Aktif" value={stats.inactive} icon="mdi:play-circle-off" color="gray" />
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
          <button
            onClick={handleAdd}
            className="w-full h-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
          >
            <Icon icon="mdi:plus-circle" className="w-8 h-8" />
            <span className="font-semibold">Tambah Tutorial</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && !showModal && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-2xl mb-6">
          <div className="flex items-center gap-2">
            <Icon icon="mdi:alert-circle" className="w-5 h-5" />
            {error}
          </div>
        </div>
      )}

      {/* Tutorials Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            <Icon icon="mdi:format-list-bulleted" className="w-6 h-6 text-purple-400" />
            Daftar Tutorial ({tutorials.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Gambar</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Judul</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Link</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Tanggal Dibuat</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Diupdate</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tutorials.map((tutorial, idx) => {
                const imageUrl = imageUrls[tutorial.id];
                
                return (
                  <tr key={tutorial.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${idx % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                    <td className="px-6 py-4 text-white/90 font-mono text-sm">{tutorial.id}</td>
                    <td className="px-6 py-4">
                      {imageUrl ? (
                        <div className="relative w-20 h-12 rounded-lg overflow-hidden border border-white/10">
                          <Image
                            src={imageUrl}
                            alt={tutorial.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-12 bg-gray-700/50 rounded-lg flex items-center justify-center border border-white/10">
                          <Icon icon="mdi:image-off" className="text-gray-500 w-6 h-6" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-white font-medium">{tutorial.title}</td>
                    <td className="px-6 py-4">
                      <a
                        href={tutorial.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm truncate max-w-xs block"
                        title={tutorial.link}
                      >
                        {tutorial.link}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-center">{getStatusBadge(tutorial.status)}</td>
                    <td className="px-6 py-4 text-white/70 text-sm">{formatDate(tutorial.created_at)}</td>
                    <td className="px-6 py-4 text-white/70 text-sm">{formatDate(tutorial.updated_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(tutorial)}
                          className="p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Icon icon="mdi:pencil" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tutorial.id)}
                          className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Icon icon="mdi:delete" className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {tutorials.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    Tidak ada tutorial
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl w-full max-w-2xl border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                    <Icon icon={selectedTutorial ? "mdi:pencil" : "mdi:plus"} className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      {selectedTutorial ? 'Edit Tutorial' : 'Tambah Tutorial Baru'}
                    </h3>
                    {selectedTutorial && (
                      <p className="text-gray-400 text-sm">ID: {selectedTutorial.id}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setForm({ title: '', link: '', status: 'Active' });
                    setImageFile(null);
                    setImagePreview(null);
                    setSelectedTutorial(null);
                    setError('');
                  }}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <Icon icon="mdi:close" className="text-gray-400 hover:text-white w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-sm mb-6">
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:alert-circle" className="w-4 h-4" />
                    {error}
                  </div>
                </div>
              )}

              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                {/* Image Upload */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Gambar Tutorial {!selectedTutorial && '*'}
                  </label>
                  <div className="flex items-center gap-6">
                    <div className="relative w-48 h-32 bg-white/10 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-white/20">
                      {imagePreview ? (
                        <Image src={imagePreview} alt="Preview" fill className="object-cover" unoptimized />
                      ) : selectedTutorial && imageUrls[selectedTutorial.id] ? (
                        <Image src={imageUrls[selectedTutorial.id]} alt="Current" fill className="object-cover" unoptimized />
                      ) : (
                        <div className="text-center">
                          <Icon icon="mdi:image-plus" className="text-gray-400 w-8 h-8 mb-1" />
                          <p className="text-xs text-gray-400">Upload Gambar</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 inline-flex items-center gap-2">
                        <Icon icon="mdi:upload" className="w-4 h-4" />
                        {selectedTutorial ? 'Ganti Gambar' : 'Pilih Gambar'}
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={handleImageChange} 
                          accept="image/*" 
                        />
                      </label>
                      <p className="text-gray-500 text-xs mt-2">Format: PNG, JPG, SVG. Maksimal 5MB</p>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Judul Tutorial *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="Masukkan judul tutorial"
                    required
                  />
                </div>

                {/* Link */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Link YouTube *</label>
                  <input
                    type="url"
                    value={form.link}
                    onChange={(e) => setForm({...form, link: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="https://youtube.com/example"
                    required
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({...form, status: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  >
                    <option value="Active" className="bg-gray-900">Aktif</option>
                    <option value="Inactive" className="bg-gray-900">Tidak Aktif</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setForm({ title: '', link: '', status: 'Active' });
                      setImageFile(null);
                      setImagePreview(null);
                      setSelectedTutorial(null);
                      setError('');
                    }}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
                  >
                    <Icon icon="mdi:close" className="w-4 h-4" />
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 disabled:scale-100"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Icon icon="mdi:content-save" className="w-4 h-4" />
                    )}
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// Stats Card Component
function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: { bg: 'from-blue-600 to-cyan-600', text: 'text-blue-400' },
    green: { bg: 'from-green-600 to-emerald-600', text: 'text-green-400' },
    gray: { bg: 'from-gray-600 to-slate-600', text: 'text-gray-400' }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[color].bg} rounded-xl flex items-center justify-center`}>
          <Icon icon={icon} className="w-6 h-6 text-white" />
        </div>
      </div>
      <div>
        <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>
        <div className="text-2xl font-bold text-white">{value.toLocaleString('id-ID')}</div>
      </div>
    </div>
  );
}

